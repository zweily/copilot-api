import consola from "consola"
import { Hono } from "hono"
import { streamSSE } from "hono/streaming"
import { FetchError } from "ofetch"

import type { ChatCompletionsPayload } from "~/services/copilot/chat-completions/types"

import { chatCompletions } from "~/services/copilot/chat-completions/service"

import { createContentChunk, createFinalChunk, segmentResponse } from "./utils"

export const chatCompletionsRoutes = new Hono()

chatCompletionsRoutes.post("/chat/completions", async (c) => {
  try {
    const payload = await c.req.json<ChatCompletionsPayload>()
    payload.stream = false

    consola.info(`Received request: ${JSON.stringify(payload).slice(0, 500)}`)

    const response = await chatCompletions(payload)
    consola.info(`Response from Copilot: ${JSON.stringify(response)}`)

    const segments = segmentResponse(response.choices[0].message.content)
    const chunks = segments.map((segment) =>
      createContentChunk(segment, response, payload.model),
    )

    chunks.push(createFinalChunk(response, payload.model))

    consola.info(
      `Streaming response, first chunk: ${JSON.stringify(chunks.at(0))}`,
    )

    return streamSSE(c, async (stream) => {
      for (const chunk of chunks) {
        await stream.writeSSE({
          data: JSON.stringify(chunk.data),
        })
        await stream.sleep(1) // Simulated latency
      }
    })
  } catch (error) {
    if (error instanceof FetchError) {
      consola.error(`Request failed: ${error.message}`, error.response?._data)
    }
    throw error
  }
})
