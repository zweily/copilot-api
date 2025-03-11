import type { State } from "./state"

export const COPILOT_API_CONFIG = {
  baseURL: "https://api.individual.githubcopilot.com",
  headers: {
    "copilot-integration-id": "vscode-chat",
    "copilot-vision-request": "true",
    "editor-version": "vscode/1.98.0-insider",
  },
} as const

export const COPILOT_API_BASE_URL = "https://api.individual.githubcopilot.com"
export const copilotHeaders = (state: State) => ({
  Authorization: `Bearer ${state.copilotToken}`,
  "content-type": "application/json",
  "copilot-integration-id": "vscode-chat",
  "editor-version": `vscode/${state.vsCodeVersion}`,
  "editor-plugin-version": "copilot-chat/0.24.1",
  "openai-intent": "conversation-panel",
  "x-github-api-version": "2024-12-15",
  "x-request-id": globalThis.crypto.randomUUID(),
  "x-vscode-user-agent-library-version": "electron-fetch",
})

export const GITHUB_API_BASE_URL = "https://api.github.com"
export const githubHeaders = (state: State) => ({
  authorization: `token ${state.githubToken}`,
  "editor-version": `vscode/${state.vsCodeVersion}`,
  "editor-plugin-version": "copilot-chat/0.24.1",
  "user-agent": "GitHubCopilotChat/0.24.1",
  "x-github-api-version": "2024-12-15",
  "x-vscode-user-agent-library-version": "electron-fetch",
})

export const GITHUB_BASE_URL = "https://github.com"
export const GITHUB_CLIENT_ID = "01ab8ac9400c4e429b23"
export const GITHUB_APP_SCOPES = [
  "read:org",
  "read:user",
  "repo",
  "user:email",
  "workflow",
].join(" ")
