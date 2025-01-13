import consola from "consola"
import fs from "node:fs"

import { CACHE } from "./lib/cache"
import { PATHS } from "./lib/paths"
import { TOKENS } from "./lib/tokens"
import { server } from "./server"
import { getModels } from "./services/copilot-vscode/get-models/service"
import { getCopilotToken } from "./services/copilot-vscode/get-token/copilot-token"
import { getGitHubToken } from "./services/copilot-vscode/get-token/github-token"

if (!fs.existsSync(PATHS.PATH_CACHE_FILE)) {
  fs.mkdirSync(PATHS.DIR_CACHE, { recursive: true })
  await CACHE._write({})
}

let githubToken: string

const cachedGithubToken = await CACHE.get("github-token")

const FOUR_HOURS = 4 * 60 * 60 * 1000

// If exists and at most 4 hours old
if (
  cachedGithubToken &&
  Date.now() - cachedGithubToken.createdAt < FOUR_HOURS
) {
  githubToken = cachedGithubToken.value
} else {
  githubToken = await getGitHubToken()
  await CACHE.set("github-token", githubToken)
}

TOKENS.GITHUB_TOKEN = githubToken

const { token: copilotToken, refresh_in } = await getCopilotToken()
TOKENS.COPILOT_TOKEN = copilotToken

// refresh_in is in minutes
// we're refreshing 100 minutes early
const refreshInterval = (refresh_in - 100) * 60 * 1000

setInterval(async () => {
  consola.start("Refreshing copilot token")
  const { token: copilotToken } = await getCopilotToken()
  TOKENS.COPILOT_TOKEN = copilotToken
}, refreshInterval)

const models = await getModels()

consola.info(
  `Available models: ${models.data.map((model) => model.id).join("\n")}`,
)

export default server
