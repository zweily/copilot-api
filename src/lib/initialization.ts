import consola from "consola"
import fs from "node:fs"
import { FetchError } from "ofetch"

import { PATHS } from "~/config/paths"
import { CONFIG } from "~/lib/config"
import { getGitHubUser } from "~/services/github/get-user/service"

import type { parseCli } from "./cli"

import { TOKENS } from "../config/tokens"
import { getModels } from "../services/copilot/get-models/service"
import { getCopilotToken } from "../services/copilot/get-token/copilot-token"
import { getGitHubToken } from "../services/github/get-token/service"
import { CACHE } from "./cache"
import { initializeLogger } from "./logger"

interface InitStep {
  name: string
  run: () => Promise<void> | void
}

const initSteps: Array<InitStep> = [
  {
    name: "Emulation check",
    run: () => {
      if (CONFIG.EMULATE_STREAMING) {
        consola.box("Streaming emulation is enabled.")
      }
    },
  },
  {
    name: "Cache",
    run: async () => {
      if (!fs.existsSync(PATHS.CACHE_PATH)) {
        fs.mkdirSync(PATHS.APP_DIR, { recursive: true })
        await CACHE._write({})
      }
    },
  },
  {
    name: "GitHub authentication",
    run: async () => {
      TOKENS.GITHUB_TOKEN = await getCachedGithubToken()

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

async function getCachedGithubToken() {
  const cachedToken = await CACHE.get("github-token")
  return cachedToken?.value
}

async function initializeGithubToken() {
  consola.start("Getting GitHub device code")
  const token = await getGitHubToken()
  await CACHE.set("github-token", token.access_token)
  return token.access_token
}

async function logUser() {
  const user = await getGitHubUser()
  consola.info(`Logged in as ${JSON.stringify(user.login)}`)
}

export async function initializeApp(
  options: Awaited<ReturnType<typeof parseCli>>,
) {
  CONFIG.EMULATE_STREAMING = options["emulate-streaming"]
  CONFIG.LOGGING_ENABLED = options.logs

  // Initialize logger if enabled
  await initializeLogger()

  await initialize()

  return {
    port: parseInt(options.port, 10),
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
