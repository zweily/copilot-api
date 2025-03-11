import { events } from "fetch-event-stream"

import { copilotHeaders, COPILOT_API_BASE_URL } from "~/lib/api-config"
import { HTTPError } from "~/lib/http-error"
import { state } from "~/lib/state"

import type {
  ChatCompletionResponse,
  ChatCompletionsPayload,
} from "./chat-completions/types"

export const createChatCompletions = async (
  payload: ChatCompletionsPayload,
) => {
  if (!state.copilotToken) throw new Error("Copilot token not found")

  const response = await fetch(`${COPILOT_API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: copilotHeaders(state),
    body: JSON.stringify(payload),
  })

  if (!response.ok)
    throw new HTTPError("Failed to create chat completions", response)

  if (payload.stream) {
    return events(response)
  }

  return (await response.json()) as ChatCompletionResponse
}
