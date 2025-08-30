import type { Context, Next } from "hono"

import consola from "consola"
import { HTTPException } from "hono/http-exception"

import { ApiKeyManager } from "./api-auth"

/**
 * Authentication middleware for Hono
 * Validates API keys for protected routes
 */
export async function authMiddleware(c: Context, next: Next): Promise<void> {
  const apiKeyManager = ApiKeyManager.getInstance()

  // Skip authentication if disabled
  if (!apiKeyManager.isEnabled()) {
    await next()
    return
  }

  // Extract API key from headers
  const headers = Object.fromEntries(
    Object.entries(c.req.header()).map(([key, value]) => [
      key.toLowerCase(),
      Array.isArray(value) ? value[0] : value,
    ]),
  )

  const apiKey = apiKeyManager.extractKeyFromHeaders(headers)

  if (!apiKey) {
    consola.warn(
      `Unauthorized request from ${c.req.header("x-forwarded-for") || "unknown"}: No API key provided`,
    )
    throw new HTTPException(401, {
      message:
        "API key required. Provide it via 'Authorization: Bearer <key>' or 'X-API-Key: <key>' header.",
    })
  }

  if (!apiKeyManager.validateKey(apiKey)) {
    consola.warn(
      `Unauthorized request from ${c.req.header("x-forwarded-for") || "unknown"}: Invalid API key`,
    )
    throw new HTTPException(401, {
      message: "Invalid API key",
    })
  }

  // Log successful authentication (with masked key for security)
  const maskedKey = `${apiKey.slice(0, 8)}***${apiKey.slice(Math.max(0, apiKey.length - 4))}`
  consola.debug(`Authenticated request with key: ${maskedKey}`)

  await next()
}

/**
 * Create a middleware that only applies authentication to specific paths
 */
export function createConditionalAuthMiddleware(
  protectedPaths: Array<string> = [],
) {
  return async (c: Context, next: Next): Promise<void> => {
    const path = c.req.path

    // Check if current path should be protected
    const shouldProtect =
      protectedPaths.length === 0
      || protectedPaths.some((protectedPath) => path.startsWith(protectedPath))

    await (shouldProtect ? authMiddleware(c, next) : next())
  }
}

/**
 * Middleware to add API key info to response headers (for debugging)
 */
export async function addAuthInfoMiddleware(
  c: Context,
  next: Next,
): Promise<void> {
  const apiKeyManager = ApiKeyManager.getInstance()

  await next()

  // Add auth info to response headers
  c.res.headers.set("X-Auth-Enabled", apiKeyManager.isEnabled().toString())
  if (apiKeyManager.isEnabled()) {
    c.res.headers.set("X-Auth-Required", "true")
  }
}
