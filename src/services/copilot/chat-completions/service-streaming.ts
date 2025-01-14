import type {
  ChatCompletionsChunk,
  ChatCompletionsPayload,
} from "./types-streaming"

import { copilot } from "../../api-instance"

export const chatCompletionsStream = (payload: ChatCompletionsPayload) =>
  copilot<ChatCompletionsChunk>("/chat/completions", {
    method: "POST",
    body: payload,
  })
