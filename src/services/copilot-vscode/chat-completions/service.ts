import type { ChatCompletionResponse, ChatCompletionsPayload } from "./types"

import { copilotVSCode } from "../api-instance"

export const chatCompletions = (payload: ChatCompletionsPayload) =>
  copilotVSCode<ChatCompletionResponse>("/chat/completions", {
    method: "POST",
    body: payload,
  })
