import { ofetch } from "ofetch"

import { getToken } from "./get-token/service"

const result = await getToken()

export const COPILOT_VSCODE_BASE_URL =
  "https://api.individual.githubcopilot.com"
export const COPILOT_VSCODE_TOKEN = result.token
export const COPILOT_VSCODE_HEADERS = {
  authorization: `Bearer ${COPILOT_VSCODE_TOKEN}`,
  "copilot-integration-id": "vscode-chat",
}

export const copilotVSCode = ofetch.create({
  baseURL: COPILOT_VSCODE_BASE_URL,
  headers: COPILOT_VSCODE_HEADERS,
})
