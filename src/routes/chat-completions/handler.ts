import type { Context } from "hono"

import { streamSSE, type SSEMessage } from "hono/streaming"

import type { ChatCompletionsPayload } from "~/services/copilot/chat-completions/types"

import { isNullish } from "~/lib/is-nullish"
import { state } from "~/lib/state"
import { createChatCompletions } from "~/services/copilot/chat-completions/service"
import { chatCompletionsStream } from "~/services/copilot/chat-completions/service-streaming"

function handleStreaming(c: Context, payload: ChatCompletionsPayload) {
  return streamSSE(c, async (stream) => {
    const response = await chatCompletionsStream(payload)

    for await (const chunk of response) {
      await stream.writeSSE(chunk as SSEMessage)
    }
  })
}

async function handleNonStreaming(c: Context, payload: ChatCompletionsPayload) {
  const response = await createChatCompletions(payload)
  return c.json(response)
}

export async function handleCompletion(c: Context) {
  let payload = await c.req.json<ChatCompletionsPayload>()

  if (isNullish(payload.max_tokens)) {
    const selectedModel = state.models?.data.find(
      (model) => model.id === payload.model,
    )

    payload = {
      ...payload,
      max_tokens: selectedModel?.capabilities.limits.max_output_tokens,
    }
  }

  if (payload.stream) {
    return handleStreaming(c, payload)
  }

  return handleNonStreaming(c, payload)
}
