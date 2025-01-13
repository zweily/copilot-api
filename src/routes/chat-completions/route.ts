import { Hono } from "hono"
import { streamSSE } from "hono/streaming"

import type { ChatCompletionsPayload } from "~/services/copilot-vscode/chat-completions/types"
import type { ChatCompletionsChunk } from "~/services/copilot-vscode/chat-completions/types.streaming"

import { chatCompletions } from "~/services/copilot-vscode/chat-completions/service"

export const chatCompletionsRoutes = new Hono()

chatCompletionsRoutes.post("/chat/completions", async (c) => {
  const payload = await c.req.json<ChatCompletionsPayload>()

  payload.stream = false

  await Bun.write("payload.json", JSON.stringify(payload))

  const response = await chatCompletions(payload)
  await Bun.write("response.json", JSON.stringify(response))

  const chunks: Array<ChatCompletionsChunk> = [
    {
      data: {
        choices: [
          {
            delta: {
              content: response.choices[0].message.content,
              role: response.choices[0].message.role,
            },
            finish_reason: response.choices[0].finish_reason,
            index: 0,
          },
        ],
        created: response.created,
        id: response.id,
        model: response.model,
      },
    },
    {
      data: "[DONE]",
    },
  ]

  return streamSSE(c, async (stream) => {
    for (const chunk of chunks) {
      await stream.writeSSE({
        data: JSON.stringify(chunk.data),
      })
    }
  })
})
