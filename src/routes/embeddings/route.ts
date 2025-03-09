import consola from "consola"
import { Hono } from "hono"
import { FetchError } from "ofetch"

import type { EmbeddingRequest } from "~/services/copilot/embedding/types"

import { embedding } from "~/services/copilot/embedding/service"

export const embeddingRoutes = new Hono()

embeddingRoutes.post("/", async (c) => {
  try {
    const embeddings = await embedding(await c.req.json<EmbeddingRequest>())
    return c.json(embeddings)
  } catch (error) {
    if (error instanceof FetchError) {
      consola.error(`Request failed: ${error.message}`, error.response?._data)
    }
    throw error
  }
})
