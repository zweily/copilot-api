import { events } from "fetch-event-stream"

import { copilotHeaders, COPILOT_API_BASE_URL } from "~/lib/api-config"
import { state } from "~/lib/state"

import type { ChatCompletionResponse, ChatCompletionsPayload } from "./types"

export const createChatCompletions = async (
  payload: ChatCompletionsPayload,
) => {
  if (!state.copilotToken) throw new Error("Copilot token not found")

  const response = await fetch(`${COPILOT_API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: copilotHeaders(state),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to create chat completions", {
      cause: await response.json(),
    })
  }

  if (payload.stream) {
    return events(response)
  }

  return (await response.json()) as ChatCompletionResponse
}
