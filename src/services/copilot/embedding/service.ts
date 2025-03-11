import { COPILOT_API_BASE_URL } from "~/lib/api-config"
import { state } from "~/lib/state"

import type { EmbeddingRequest, EmbeddingResponse } from "./types"

import { copilot } from "../../api-instance"

export const createEmbeddings = (payload: EmbeddingRequest) => {
  const response = await fetch(`${COPILOT_API_BASE_URL}/embeddings`, {
    headers: {
      authorization: `token ${state.copilotToken}`,
    },
  })
}

copilot<EmbeddingResponse>("/embeddings", {
  method: "POST",
  body: {
    ...payload,
  },
})

export interface EmbeddingRequest {
  input: string | Array<string>
  model: string
}

export interface Embedding {
  object: string
  embedding: Array<number>
  index: number
}

export interface EmbeddingResponse {
  object: string
  data: Array<Embedding>
  model: string
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}
