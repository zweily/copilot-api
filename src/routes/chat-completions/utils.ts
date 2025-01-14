import type { ChatCompletionResponse } from "~/services/copilot/chat-completions/types"
import type { ChatCompletionsChunk } from "~/services/copilot/chat-completions/types.streaming"

export function createContentChunk(
  segment: string,
  response: ChatCompletionResponse,
  model: string,
): ChatCompletionsChunk {
  return {
    data: {
      id: response.id,
      object: "chat.completion.chunk",
      created: response.created,
      model,
      system_fingerprint: response.system_fingerprint,
      choices: [
        {
          index: 0,
          delta: {
            role: response.choices[0].message.role,
            content: segment,
          },
          finish_reason: null,
        },
      ],
      usage: null,
    },
  }
}

export function createFinalChunk(
  response: ChatCompletionResponse,
  model: string,
): ChatCompletionsChunk {
  return {
    data: {
      id: response.id,
      object: "chat.completion.chunk",
      created: response.created,
      model,
      system_fingerprint: response.system_fingerprint,
      choices: [
        {
          index: 0,
          delta: {},
          finish_reason: response.choices[0].finish_reason,
        },
      ],
      usage: response.usage,
    },
  }
}

export function segmentResponse(content: string): Array<string> {
  const segmenter = new Intl.Segmenter("en", { granularity: "word" })
  return Array.from(segmenter.segment(content)).map(
    (segment) => segment.segment,
  )
}
