import type { BlankEnv, BlankInput } from "hono/types"
import type { ContentfulStatusCode } from "hono/utils/http-status"

import consola from "consola"
import { Hono, type Context } from "hono"
import { FetchError } from "ofetch"

import { handlerStreaming } from "./handler"

export const completionRoutes = new Hono()

completionRoutes.post("/", async (c) => {
  try {
    return await handlerStreaming(c)
  } catch (error) {
    consola.error("Error occurred:", error)
    return handleError(c, error)
  }
})

// Handle different error types with specific handlers
async function handleError(
  c: Context<BlankEnv, "/", BlankInput>,
  error: unknown,
) {
  if (error instanceof FetchError) {
    return handleFetchError(c, error)
  }

  if (error instanceof Response) {
    return await handleResponseError(c, error)
  }

  if (error instanceof Error) {
    return handleGenericError(c, error)
  }

  // Fallback for unknown error types
  return c.json(
    {
      error: {
        message: "An unknown error occurred",
        type: "unknown_error",
      },
    },
    500,
  )
}

function handleFetchError(
  c: Context<BlankEnv, "/", BlankInput>,
  error: FetchError,
) {
  const status = error.response?.status ?? 500

  // Forward all headers from the error response
  error.response?.headers.forEach((value, key) => {
    c.header(key, value)
  })

  return c.json(
    {
      error: {
        message: error.message,
        type: "fetch_error",
        data: error.response?._data as unknown,
      },
    },
    status as ContentfulStatusCode,
  )
}

async function handleResponseError(
  c: Context<BlankEnv, "/", BlankInput>,
  error: Response,
) {
  const errorText = await error.text()
  consola.error(
    `Request failed: ${error.status} ${error.statusText}: ${errorText}`,
  )

  // Forward all headers from the error response
  error.headers.forEach((value, key) => {
    c.header(key, value)
  })

  return c.json(
    {
      error: {
        message: error.statusText || "Request failed",
        type: "response_error",
        status: error.status,
        details: errorText,
      },
    },
    error.status as ContentfulStatusCode,
  )
}

function handleGenericError(
  c: Context<BlankEnv, "/", BlankInput>,
  error: Error,
) {
  return c.json(
    {
      error: {
        message: error.message,
        type: "error",
      },
    },
    500,
  )
}
