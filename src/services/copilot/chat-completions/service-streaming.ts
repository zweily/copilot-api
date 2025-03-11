import { stream } from "fetch-event-stream"

import { COPILOT_API_CONFIG } from "~/lib/api-config"
import { tokenService } from "~/lib/token"

import type { ChatCompletionsPayload } from "./types"

export const chatCompletionsStream = async (
  payload: ChatCompletionsPayload,
) => {
  const copilotToken = tokenService.getCopilotToken()

  return stream(`${COPILOT_API_CONFIG.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      ...COPILOT_API_CONFIG.headers,
      authorization: `Bearer ${copilotToken}`,
    },
    body: JSON.stringify(payload),
  })
}
