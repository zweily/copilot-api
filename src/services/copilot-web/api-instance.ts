import { ofetch } from "ofetch"

import { ENV } from "~/lib/env"

export const copilotWeb = ofetch.create({
  baseURL: "https://api.individual.githubcopilot.com",
  headers: {
    authorization: ENV.GITHUB_AUTH_HEADER,
    "copilot-integration-id": "copilot-chat",
  },
})
