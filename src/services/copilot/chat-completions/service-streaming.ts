import { stream } from "fetch-event-stream"

import { COPILOT_API_CONFIG } from "~/lib/config"

import type { ChatCompletionsPayload } from "./types"

import { TOKENS } from "../../../lib/tokens"

export const chatCompletionsStream = async (payload: ChatCompletionsPayload) =>
  stream(`${COPILOT_API_CONFIG.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      ...COPILOT_API_CONFIG.headers,
      authorization: `Bearer ${TOKENS.COPILOT_TOKEN}`,
    },
    body: JSON.stringify(payload),
  })
