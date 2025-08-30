import consola from "consola"
import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

import { PATHS } from "./paths"

export interface ApiKeyConfig {
  keys: Array<string>
  enabled: boolean
}

export class ApiKeyManager {
  private static instance: ApiKeyManager | undefined
  private config: ApiKeyConfig = { keys: [], enabled: false }
  private hashedKeys: Set<string> = new Set()

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager()
    }
    return ApiKeyManager.instance
  }

  /**
   * Generate a secure API key
   */
  static generateApiKey(): string {
    // Generate a secure random API key with prefix
    const randomBytes = crypto.randomBytes(32)
    return `capi_${randomBytes.toString("hex")}`
  }

  /**
   * Hash an API key for secure storage
   */
  private hashApiKey(key: string): string {
    return crypto.createHash("sha256").update(key).digest("hex")
  }

  /**
   * Set API key configuration
   */
  setConfig(keys: Array<string>, enabled: boolean = true): void {
    this.config = { keys, enabled }
    this.hashedKeys.clear()

    if (enabled && keys.length > 0) {
      // Hash all keys for secure comparison
      for (const key of keys) {
        this.hashedKeys.add(this.hashApiKey(key))
      }
      consola.info(`API authentication enabled with ${keys.length} key(s)`)
    } else {
      consola.warn(
        "API authentication disabled - server is open to all requests",
      )
    }
  }

  /**
   * Check if authentication is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled && this.config.keys.length > 0
  }

  /**
   * Validate an API key
   */
  validateKey(key: string): boolean {
    if (!this.isEnabled()) {
      return true // Allow all requests when auth is disabled
    }

    if (!key) {
      return false
    }

    const hashedKey = this.hashApiKey(key)
    return this.hashedKeys.has(hashedKey)
  }

  /**
   * Extract API key from request headers
   * Supports both "Authorization: Bearer <key>" and "X-API-Key: <key>"
   */
  extractKeyFromHeaders(
    headers: Record<string, string | undefined>,
  ): string | null {
    // Check Authorization header (Bearer token)
    const authHeader = headers.authorization || headers.Authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7).trim()
    }

    // Check X-API-Key header
    const apiKeyHeader = headers["x-api-key"] || headers["X-API-Key"]
    if (apiKeyHeader) {
      return apiKeyHeader.trim()
    }

    return null
  }

  /**
   * Load API keys from file
   */
  async loadKeysFromFile(): Promise<void> {
    try {
      const keysPath = path.join(PATHS.APP_DIR, "api_keys.json")
      const data = await fs.readFile(keysPath)
      const config = JSON.parse(data) as ApiKeyConfig

      if (Array.isArray(config.keys)) {
        this.setConfig(config.keys, config.enabled)
      }
    } catch {
      // File doesn't exist or is invalid - that's okay
      consola.debug("No API keys file found, authentication will be disabled")
    }
  }

  /**
   * Save API keys to file
   */
  async saveKeysToFile(): Promise<void> {
    try {
      const keysPath = path.join(PATHS.APP_DIR, "api_keys.json")
      await fs.writeFile(keysPath, JSON.stringify(this.config, null, 2))
      await fs.chmod(keysPath, 0o600) // Owner read/write only
      consola.success(`API keys saved to ${keysPath}`)
    } catch (error) {
      consola.error("Failed to save API keys:", error)
      throw error
    }
  }

  /**
   * Add a new API key
   */
  async addKey(key?: string): Promise<string> {
    const newKey = key || ApiKeyManager.generateApiKey()
    this.config.keys.push(newKey)
    this.hashedKeys.add(this.hashApiKey(newKey))
    await this.saveKeysToFile()
    return newKey
  }

  /**
   * Remove an API key
   */
  async removeKey(key: string): Promise<boolean> {
    const index = this.config.keys.indexOf(key)
    if (index !== -1) {
      this.config.keys.splice(index, 1)
      this.hashedKeys.delete(this.hashApiKey(key))
      await this.saveKeysToFile()
      return true
    }
    return false
  }

  /**
   * List all API keys (masked for security)
   */
  listKeys(): Array<{ key: string; masked: string }> {
    return this.config.keys.map((key) => ({
      key,
      masked: `${key.slice(0, 8)}${"*".repeat(key.length - 12)}${key.slice(Math.max(0, key.length - 4))}`,
    }))
  }

  /**
   * Generate and add a new API key
   */
  async generateAndAddKey(): Promise<string> {
    const newKey = ApiKeyManager.generateApiKey()
    await this.addKey(newKey)
    return newKey
  }
}
