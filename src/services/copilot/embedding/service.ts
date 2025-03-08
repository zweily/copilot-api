import type { ChatCompletionsPayload } from "~/services/copilot/chat-completions/types.ts"
import type { GetModelsResponse } from "~/services/copilot/get-models/types.ts"

import { copilot } from "../../api-instance"

export const embedding = (payload: ChatCompletionsPayload) =>
  copilot<GetModelsResponse>("/embeddings", {
    method: "POST",
    body: {
      ...payload,
    },
  })
