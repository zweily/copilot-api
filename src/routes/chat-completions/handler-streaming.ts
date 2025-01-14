import type { Context } from "hono"

import consola from "consola"
import { streamSSE } from "hono/streaming"

import type { ChatCompletionsPayload } from "~/services/copilot/chat-completions/types"

import { chatCompletionsStream } from "~/services/copilot/chat-completions/service-streaming"

export async function handlerStreaming(c: Context) {
  const payload = await c.req.json<ChatCompletionsPayload>()

  consola.info(`Received request: ${JSON.stringify(payload).slice(0, 500)}`)

  const response = await chatCompletionsStream(payload)

  return streamSSE(c, async (stream) => {
    let index = 0
    for await (const chunk of response) {
      if (index === 0) {
        consola.info(
          `Streaming response, first chunk: ${JSON.stringify(chunk)}`,
        )
      }

      index++

      await stream.writeSSE({
        data: JSON.stringify(chunk.data),
      })
    }
  })
}
