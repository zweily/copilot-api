import consola from "consola"

import { ensurePaths } from "~/lib/paths"
import { readGithubToken, tokenService, writeGithubToken } from "~/lib/token"
import { getDeviceCode } from "~/services/github/get-device-code"
import { getGitHubUser } from "~/services/github/get-user/service"
import { pollAccessToken } from "~/services/github/poll-access-token"

import { getModels } from "../services/copilot/get-models/service"
import { state } from "./state"

async function logUser() {
  const user = await getGitHubUser()
  consola.info(`Logged in as ${JSON.stringify(user.login)}\n`)
}

async function setupGitHubToken(): Promise<void> {
  const githubToken = await readGithubToken()

  if (githubToken) {
    state.githubToken = githubToken
    await logUser()

    return
  }

  consola.info("Not logged in, getting new access token")
  const response = await getDeviceCode()

  consola.info(
    `Please enter the code "${response.user_code}" in ${response.verification_uri}`,
  )

  const token = await pollAccessToken(response)
  await writeGithubToken(token)
  state.githubToken = token

  await logUser()
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

export async function initializeApp() {
  await ensurePaths()
  await setupGitHubToken()
  await initializeCopilotToken()
  await logModelInformation()
}
