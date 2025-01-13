import type { ChatCompletionResponse, ChatCompletionsPayload } from "./types"

import { copilot } from "../../api-instance"

export const chatCompletions = (payload: ChatCompletionsPayload) =>
  copilot<ChatCompletionResponse>("/chat/completions", {
    method: "POST",
    body: payload,
  })
