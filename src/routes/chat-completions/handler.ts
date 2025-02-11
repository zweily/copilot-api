import type { Context } from "hono"

import consola from "consola"
import { streamSSE } from "hono/streaming"

import type { ChatCompletionsPayload } from "~/services/copilot/chat-completions/types"

import { logToFile } from "~/lib/logger"
import { chatCompletions } from "~/services/copilot/chat-completions/service"

import { createContentChunk, createFinalChunk, segmentResponse } from "./utils"

export async function handler(c: Context) {
  const payload = await c.req.json<ChatCompletionsPayload>()

  const loggedPayload = structuredClone(payload)
  loggedPayload.messages = loggedPayload.messages.map((message) => ({
    ...message,
    content:
      message.content.length > 100 ?
        message.content.slice(0, 100 - 3) + "..."
      : message.content,
  }))

  consola.info("Received request:", loggedPayload)
  await logToFile("REQUEST", JSON.stringify(payload, null, 2))

  const response = await chatCompletions(payload)
  await logToFile("RESPONSE", JSON.stringify(response, null, 2))

  if (payload.stream) {
    consola.info(`Response from Copilot: ${JSON.stringify(response)}`)

    const segments = segmentResponse(response.choices[0].message.content)
    const chunks = segments.map((segment) =>
      createContentChunk(segment, response, payload.model),
    )

    chunks.push(createFinalChunk(response, payload.model))

    return streamSSE(c, async (stream) => {
      for (const chunk of chunks) {
        await stream.writeSSE({
          data: JSON.stringify(chunk.data),
        })
        await stream.sleep(1) // Simulated latency
      }
    })
  }

  return c.json(response)
}
