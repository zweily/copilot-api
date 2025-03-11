import consola from "consola"
import fs from "node:fs/promises"

import { PATHS } from "~/lib/paths"
import { getCopilotToken } from "~/services/copilot/get-token/copilot-token"
import { getDeviceCode } from "~/services/github/get-device-code"
import { getGitHubUser } from "~/services/github/get-user"
import { pollAccessToken } from "~/services/github/poll-access-token"

import { state } from "./state"

export const readGithubToken = () =>
  fs.readFile(PATHS.GITHUB_TOKEN_PATH, "utf8")

export const writeGithubToken = (token: string) =>
  fs.writeFile(PATHS.GITHUB_TOKEN_PATH, token)

export const setupCopilotToken = async () => {
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

export async function setupGitHubToken(): Promise<void> {
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

async function logUser() {
  const user = await getGitHubUser()
  consola.info(`Logged in as ${user.login}`)
}
