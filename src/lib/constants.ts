
// VSCode client ID
const GITHUB_CLIENT_ID = "01ab8ac9400c4e429b23"
const GITHUB_OAUTH_SCOPES = [
  "read:org",
  "read:user",
  "repo",
  "user:email",
  "workflow",
].join(" ")

export const ENV = {
  GITHUB_CLIENT_ID,
  GITHUB_OAUTH_SCOPES,
}

export const COPILOT_API_CONFIG = {
  baseURL: "https://api.individual.githubcopilot.com",
  headers: {
    "copilot-integration-id": "vscode-chat",
    "copilot-vision-request": "true",
    "editor-version": "vscode/1.98.0-insider",
  },
} as const

export const GITHUB_API_CONFIG = {
  baseURL: "https://api.github.com",
} as const

export const GITHUB_WEB_API_CONFIG = {
  baseURL: "https://github.com",
} as const
