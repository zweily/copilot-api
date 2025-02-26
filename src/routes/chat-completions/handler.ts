import type { Context } from "hono"

import { streamSSE, type SSEMessage } from "hono/streaming"

import type { ChatCompletionsPayload } from "~/services/copilot/chat-completions/types"

import { chatCompletions } from "~/services/copilot/chat-completions/service"
import { chatCompletionsStream } from "~/services/copilot/chat-completions/service-streaming"

export async function handlerStreaming(c: Context) {
  const payload = await c.req.json<ChatCompletionsPayload>()

  if (payload.stream) {
    const response = await chatCompletionsStream(payload)

    return streamSSE(c, async (stream) => {
      for await (const chunk of response) {
        await stream.writeSSE(chunk as SSEMessage)
      }
    })
  }

  const response = await chatCompletions(payload)
  return c.json(response)
}
