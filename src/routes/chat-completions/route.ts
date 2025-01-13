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

  consola.info(`Received request: ${JSON.stringify(payload).slice(0, 100)}`)

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

  let chunks: Array<ChatCompletionsChunk> = Array.from(segmentedMessages).map(
    (segment) => ({
      data: {
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
        // Aider expects the model to be the same as the one used in the request
        model: payload.model,
        usage: response.usage,
      },
    }),
  )

  const usagePerChunk: ChatCompletionsChunk["data"]["usage"] = {
    completion_tokens: Math.round(
      response.usage.completion_tokens / chunks.length,
    ),
    prompt_tokens: Math.round(response.usage.prompt_tokens / chunks.length),
    total_tokens: Math.round(response.usage.total_tokens / chunks.length),
  }

  chunks = chunks.map((chunk) => ({
    ...chunk,
    data: {
      ...chunk.data,
      usage: usagePerChunk,
    },
  }))

  chunks.push({
    data: {
      choices: [
        {
          delta: {},
          finish_reason: response.choices[0].finish_reason,
          index: 0,
        },
      ],
      created: response.created,
      id: response.id,
      // Aider expects the model to be the same as the one used in the request
      model: payload.model,
      usage: {
        completion_tokens: 0,
        prompt_tokens: 0,
        total_tokens: 0,
      },
    },
  })

  console.info(
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
