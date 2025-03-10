import consola from "consola"
import { FetchError } from "ofetch"

import { ensurePaths } from "~/lib/paths"
import { tokenService } from "~/lib/token"
import { getGitHubUser } from "~/services/github/get-user/service"

import { getModels } from "../services/copilot/get-models/service"
import { getGitHubToken } from "../services/github/get-token/service"

async function initializeGithubAuthentication(): Promise<void> {
  const githubToken = await tokenService.getGithubToken()

  try {
    if (githubToken) {
      // Set token in the service so github fetcher can use it
      await tokenService.setGithubToken(githubToken)
      await logUser()
    } else {
      throw new Error("No GitHub token available")
    }
  } catch (error) {
    if (error instanceof FetchError && error.statusCode !== 401) {
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
    const newToken = await initializeGithubToken()
    await tokenService.setGithubToken(newToken)
    await logUser()
  }
}

async function initializeCopilotToken(): Promise<void> {
  await tokenService.initCopilotToken()
}

async function logModelInformation(): Promise<void> {
  const models = await getModels()
  consola.info(
    `Available models: \n${models.data.map((model) => `- ${model.id}`).join("\n")}`,
  )
}

async function initializeGithubToken() {
  consola.start("Getting GitHub device code")
  return await getGitHubToken()
}

async function logUser() {
  const user = await getGitHubUser()
  consola.info(`Logged in as ${JSON.stringify(user.login)}\n`)
}

export async function initializeApp() {
  await ensurePaths()
  await initializeGithubAuthentication()
  await initializeCopilotToken()
  await logModelInformation()
}
