import consola from "consola"
import { Hono } from "hono"
import { FetchError } from "ofetch"

import type { EmbeddingRequest } from "~/services/copilot/embedding/types"

import { createEmbeddings } from "~/services/copilot/create-embeddings"

export const embeddingRoutes = new Hono()

embeddingRoutes.post("/", async (c) => {
  try {
    const embeddings = await createEmbeddings(
      await c.req.json<EmbeddingRequest>(),
    )
    return c.json(embeddings)
  } catch (error) {
    if (error instanceof FetchError) {
      consola.error(`Request failed: ${error.message}`, error.response?._data)
    }
    throw error
  }
})
