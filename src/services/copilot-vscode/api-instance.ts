import { ofetch } from "ofetch"

import { TOKENS } from "~/lib/tokens"

export const copilotVSCode = ofetch.create({
  baseURL: "https://api.individual.githubcopilot.com",
  headers: {
    "copilot-integration-id": "vscode-chat",
  },

  onRequest({ options }) {
    options.headers.set("authorization", `Bearer ${TOKENS.COPILOT_TOKEN}`)
  },
})

export const github = ofetch.create({
  baseURL: "https://api.github.com",
  headers: {
    // "editor-plugin-version": "copilot-chat/0.23.2",
    // "editor-version": "vscode/1.96.2",
    // "user-agent": "GitHubCopilotChat/0.23.2",
    // "x-github-api-version": "2024-12-15",
  },

  onRequest({ options }) {
    options.headers.set("authorization", `token ${TOKENS.GITHUB_TOKEN}`)
  },
})
