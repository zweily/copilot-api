export const COPILOT_CONFIG = {
  baseURL: "https://api.individual.githubcopilot.com",
  headers: {
    "copilot-integration-id": "vscode-chat",
  },
} as const

export const GITHUB_CONFIG = {
  baseURL: "https://api.github.com",
} as const

export const GITHUB_WEB_CONFIG = {
  baseURL: "https://github.com",
} as const
