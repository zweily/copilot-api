import consola from "consola"
import fs from "node:fs/promises"

import { PATHS } from "~/lib/paths"
import { getCopilotToken } from "~/services/copilot/get-token/copilot-token"

import { state } from "./state"

export const readGithubToken = () =>
  fs.readFile(PATHS.GITHUB_TOKEN_PATH, "utf8")

export const writeGithubToken = (token: string) =>
  fs.writeFile(PATHS.GITHUB_TOKEN_PATH, token)

export const setupCopilotTokenRefresh = async () => {
  const { token, refresh_in } = await getCopilotToken()
  state.copilotToken = token

  const refreshInterval = (refresh_in - 60) * 1000

  setInterval(async () => {
    consola.start("Refreshing Copilot token")
    try {
      const { token } = await getCopilotToken()
      state.copilotToken = token
    } catch (error) {
      consola.error("Failed to refresh Copilot token:", error)
      throw error
    }
  }, refreshInterval)
}

// Simple token manager with basic encapsulation
export const tokenService = {
  // Private token storage
  _tokens: {
    github: undefined as string | undefined,
    copilot: undefined as string | undefined,
  },

  // Get Copilot token
  getCopilotToken(): string | undefined {
    return this._tokens.copilot
  },

  // Set Copilot token
  setCopilotToken(token: string): void {
    this._tokens.copilot = token
  },

  // Initialize Copilot token with auto-refresh
  async initCopilotToken(): Promise<void> {
    const { token, refresh_in } = await getCopilotToken()
    this.setCopilotToken(token)

    // Set up refresh timer
    const refreshInterval = (refresh_in - 60) * 1000
    setInterval(async () => {
      consola.start("Refreshing Copilot token")
      try {
        const { token: newToken } = await getCopilotToken()
        this.setCopilotToken(newToken)
        consola.success("Copilot token refreshed")
      } catch (error) {
        consola.error("Failed to refresh Copilot token:", error)
      }
    }, refreshInterval)
  },
}
