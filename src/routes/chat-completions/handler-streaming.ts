import type { Context } from "hono"

import consola from "consola"
import { streamSSE, type SSEMessage } from "hono/streaming"

import type { ChatCompletionsPayload } from "~/services/copilot/chat-completions/types"

import { chatCompletions } from "~/services/copilot/chat-completions/service"
import { chatCompletionsStream } from "~/services/copilot/chat-completions/service-streaming"

export async function handlerStreaming(c: Context) {
  const payload = await c.req.json<ChatCompletionsPayload>()

  consola.info(`Received request: ${JSON.stringify(payload).slice(0, 500)}`)

  if (payload.stream) {
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

        await stream.writeSSE(chunk as SSEMessage)
      }
    })
  }

  const response = await chatCompletions(payload)
  return c.json(response)
}
