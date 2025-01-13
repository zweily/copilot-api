import consola from "consola"
import { Hono } from "hono"
import { streamSSE } from "hono/streaming"
import { FetchError } from "ofetch"

import type { ChatCompletionsPayload } from "~/services/copilot/chat-completions/types"
import type { ChatCompletionsChunk } from "~/services/copilot/chat-completions/types.streaming"

import { chatCompletions } from "~/services/copilot/chat-completions/service"

export const chatCompletionsRoutes = new Hono()

chatCompletionsRoutes.post("/chat/completions", async (c) => {
  const payload = await c.req.json<ChatCompletionsPayload>()

  payload.stream = false

  consola.info(`Received request: ${JSON.stringify(payload).slice(0, 500)}`)

  const response = await chatCompletions(payload).catch((error: unknown) => {
    if (error instanceof FetchError) {
      consola.error(
        // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
        `Request failed: ${JSON.stringify(payload)} \n ${error} \n ${error.response?._data}`,
      )
    }

    throw error
  })

  consola.info(`Response from Copilot: ${JSON.stringify(response)}`)

  const segmenter = new Intl.Segmenter("en", { granularity: "word" })

  const segmentedMessages = segmenter.segment(
    response.choices[0].message.content,
  )

  const chunks: Array<ChatCompletionsChunk> = Array.from(segmentedMessages).map(
    (segment) => ({
      data: {
        object: "chat.completion.chunk",
        choices: [
          {
            delta: {
              content: segment.segment,
              role: response.choices[0].message.role,
            },
            index: 0,
          },
        ],
        created: response.created,
        id: response.id,
        model: payload.model,
        usage: null,
        system_fingerprint: "fp_44709d6fcb",
      },
    }),
  )

  chunks.push({
    data: {
      object: "chat.completion.chunk",
      choices: [
        {
          delta: {},
          finish_reason: response.choices[0].finish_reason,
          index: 0,
        },
      ],
      created: response.created,
      id: response.id,
      model: payload.model,
      usage: response.usage,
      system_fingerprint: "fp_44709d6fcb",
    },
  })

  consola.info(
    `Streaming response, first chunk: ${JSON.stringify(chunks.at(0))}`,
  )

  return streamSSE(c, async (stream) => {
    for (const chunk of chunks) {
      await stream.writeSSE({
        data: JSON.stringify(chunk.data),
      })

      // Fake latency lol
      await stream.sleep(1)
    }
  })
})
