import { copilot } from "~/services/api-instance"

import type { ChatCompletionResponse, ChatCompletionsPayload } from "./types"

export const chatCompletions = (payload: ChatCompletionsPayload) =>
  copilot<ChatCompletionResponse>("/chat/completions", {
    method: "POST",
    body: payload,
  })
