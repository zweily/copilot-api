import consola from "consola"
import fs from "node:fs/promises"
import { FetchError } from "ofetch"

import { PATHS } from "~/lib/paths"
import { getGitHubUser } from "~/services/github/get-user/service"

import type { getOptions } from "./cli"

import { getModels } from "../services/copilot/get-models/service"
import { getCopilotToken } from "../services/copilot/get-token/copilot-token"
import { getGitHubToken } from "../services/github/get-token/service"
import { initializeLogger } from "./logger"
import { getGithubToken, saveGithubToken, TOKENS } from "./tokens"

interface InitStep {
  name: string
  run: () => Promise<void> | void
}

const initSteps: Array<InitStep> = [
  {
    name: "App directory",
    run: async () => {
      await fs.mkdir(PATHS.APP_DIR, { recursive: true })
      await fs.writeFile(PATHS.GITHUB_TOKEN_PATH, "", { flag: "a" })
    },
  },
  {
    name: "GitHub authentication",
    run: async () => {
      TOKENS.GITHUB_TOKEN = await getGithubToken()

      try {
        await logUser()
      } catch (error) {
        if (!(error instanceof FetchError)) throw error
        if (error.statusCode !== 401) {
          consola.error("Authentication error:", {
            error,
            request: error.request,
            options: error.options,
            response: error.response,
            data: error.response?._data as Record<string, unknown>,
          })
          throw error
        }

        consola.info("Not logged in, getting new access token")
        TOKENS.GITHUB_TOKEN = await initializeGithubToken()
        await logUser()
      }
    },
  },
  {
    name: "Copilot token",
    run: async () => {
      const { token, refresh_in } = await getCopilotToken()
      TOKENS.COPILOT_TOKEN = token

      const refreshInterval = (refresh_in - 60) * 1000
      setInterval(async () => {
        consola.start("Refreshing copilot token")
        const { token: newToken } = await getCopilotToken()
        TOKENS.COPILOT_TOKEN = newToken
      }, refreshInterval)
    },
  },
  {
    name: "Model information",
    run: async () => {
      const models = await getModels()
      consola.info(
        `Available models: \n${models.data.map((model) => `- ${model.id}`).join("\n")}`,
      )
    },
  },
]

async function initializeGithubToken() {
  consola.start("Getting GitHub device code")
  const token = await getGitHubToken()
  await saveGithubToken(token.access_token)
  return token.access_token
}

async function logUser() {
  const user = await getGitHubUser()
  consola.info(`Logged in as ${JSON.stringify(user.login)}`)
}

import { configManager } from "./config"
import { initializePort } from "./port"

export async function initializeApp(
  options: Awaited<ReturnType<typeof getOptions>>,
) {
  configManager.setConfig({
    EMULATE_STREAMING: options["emulate-streaming"],
    LOGGING_ENABLED: options.logs,
  })

  // Get available port, trying the CLI option first
  const port = await initializePort()

  // Initialize logger if enabled
  await initializeLogger()

  await initialize()

  const serverUrl = `http://localhost:${port}`
  consola.success(`Server started at ${serverUrl}`)

  return {
    port,
  }
}

async function initialize() {
  for (const step of initSteps) {
    try {
      consola.start(`Initializing ${step.name}...`)
      await step.run()
      consola.success(`${step.name} initialized`)
    } catch (error) {
      consola.error(`Failed to initialize ${step.name}:`, error)
      throw error
    }
  }
}
