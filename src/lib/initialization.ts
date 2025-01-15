import consola from "consola"
import fs from "node:fs"
import { FetchError } from "ofetch"

import { ENV } from "~/config/env"
import { getGitHubUser } from "~/services/github/get-user/service"

import { PATHS } from "../config/paths"
import { TOKENS } from "../config/tokens"
import { getModels } from "../services/copilot/get-models/service"
import { getCopilotToken } from "../services/copilot/get-token/copilot-token"
import { getGitHubToken } from "../services/github/get-token/service"
import { CACHE } from "./cache"

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

async function initializeCopilotToken() {
  const { token, refresh_in } = await getCopilotToken()
  TOKENS.COPILOT_TOKEN = token

  // refresh_in is in seconds
  // we're refreshing 1 minute (60 seconds) early
  const refreshInterval = (refresh_in - 60) * 1000

  setInterval(async () => {
    consola.start("Refreshing copilot token")
    const { token: newToken } = await getCopilotToken()
    TOKENS.COPILOT_TOKEN = newToken
  }, refreshInterval)

  return token
}

async function initializeCache() {
  if (!fs.existsSync(PATHS.PATH_CACHE_FILE)) {
    fs.mkdirSync(PATHS.DIR_CACHE, { recursive: true })
    await CACHE._write({})
  }
}

async function logAvailableModels() {
  const models = await getModels()
  consola.info(
    `Available models: \n${models.data.map((model) => `- ${model.id}`).join("\n")}\n`,
  )
}

async function logUser() {
  const user = await getGitHubUser()
  consola.info(`Logged in as ${JSON.stringify(user.login)}`)
}

export async function initialize() {
  if (ENV.EMULATE_STREAMING) consola.box("Streaming emulation is enabled.")

  await initializeCache()

  TOKENS.GITHUB_TOKEN = await getCachedGithubToken()

  try {
    await logUser()
  } catch (error) {
    if (!(error instanceof FetchError)) throw error
    consola.log(
      error,
      error.request,
      error.options,
      error.response,
      error.response?._data,
    )
    if (error.statusCode !== 401) throw error

    consola.info("Not logged in, getting new access token")
    TOKENS.GITHUB_TOKEN = await initializeGithubToken()
    await logUser()
  }

  await initializeCopilotToken()

  // Log available models
  await logAvailableModels()
}
