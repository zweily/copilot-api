import { buildCopilotHeaders, COPILOT_API_BASE_URL } from "~/lib/api-config"
import { state } from "~/lib/state"

export const createEmbeddings = async (payload: EmbeddingRequest) => {
  if (!state.copilotToken) throw new Error("Copilot token not found")

  const response = await fetch(`${COPILOT_API_BASE_URL}/embeddings`, {
    method: "POST",
    headers: buildCopilotHeaders(state.copilotToken),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Failed to create embeddings", {
      cause: await response.json(),
    })
  }

  return (await response.json()) as EmbeddingResponse
}

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
