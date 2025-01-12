import consola from "consola"

import { TOKENS } from "./lib/tokens"
import { chatCompletions } from "./services/copilot-vscode/chat-completions/service"
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

const response = await chatCompletions({
  messages: [
    {
      role: "user",
      content: "Write a function that returns the sum of two numbers",
    },
  ],
  model: "gpt-4o-mini",
  stream: false,
})

console.log(response)

await Bun.write("response.json", JSON.stringify(response, null, 2))
