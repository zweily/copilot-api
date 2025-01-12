import consola from "consola"

import { TOKENS } from "./lib/tokens"
import { getCopilotToken } from "./services/copilot-vscode/get-token/copilot-token"
import { getGitHubToken } from "./services/copilot-vscode/get-token/github-token"

const githubToken = await getGitHubToken()
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
