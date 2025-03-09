import type { EmbeddingRequest, EmbeddingResponse } from "./types"

import { copilot } from "../../api-instance"

export const embedding = (payload: EmbeddingRequest) =>
  copilot<EmbeddingResponse>("/embeddings", {
    method: "POST",
    body: {
      ...payload,
    },
  })
