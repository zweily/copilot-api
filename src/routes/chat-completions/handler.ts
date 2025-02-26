import type { Context } from "hono"

import { streamSSE, type SSEMessage } from "hono/streaming"

import type { ChatCompletionsPayload } from "~/services/copilot/chat-completions/types"

import { logger } from "~/lib/logger"
import { chatCompletions } from "~/services/copilot/chat-completions/service"
import { chatCompletionsStream } from "~/services/copilot/chat-completions/service-streaming"

export async function handlerStreaming(c: Context) {
  const payload = await c.req.json<ChatCompletionsPayload>()

  // Log the request
  await logger.logRequest("/chat/completions", "POST", payload)

  if (payload.stream) {
    const response = await chatCompletionsStream(payload)

    // For streaming responses, we'll log the initial response setup
    await logger.logResponse("/chat/completions", {
      type: "stream",
      timestamp: new Date().toISOString(),
      model: payload.model,
    })

    return streamSSE(c, async (stream) => {
      for await (const chunk of response) {
        await stream.writeSSE(chunk as SSEMessage)
      }
    })
  }

  const response = await chatCompletions(payload)

  // Log the non-streaming response
  await logger.logResponse("/chat/completions", response)

  return c.json(response)
}
