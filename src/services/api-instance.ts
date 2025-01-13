import { ofetch } from "ofetch"

import { TOKENS } from "~/lib/tokens"

export const copilot = ofetch.create({
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

  onRequest({ options }) {
    options.headers.set("authorization", `token ${TOKENS.GITHUB_TOKEN}`)
  },
})

// Only used for device flow auth
export const _github = ofetch.create({
  baseURL: "https://github.com",
})
