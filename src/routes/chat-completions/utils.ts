import type { ChatCompletionResponse } from "~/services/copilot/chat-completions/types"
import type { ChatCompletionsChunk } from "~/services/copilot/chat-completions/types.streaming"

export function createContentChunk(
  segment: string,
  response: ChatCompletionResponse,
  model: string,
): ChatCompletionsChunk {
  return {
    data: {
      object: "chat.completion.chunk",
      choices: [
        {
          delta: {
            content: segment,
            role: response.choices[0].message.role,
          },
          index: 0,
        },
      ],
      created: response.created,
      id: response.id,
      model,
      usage: null,
      system_fingerprint: "fp_44709d6fcb",
    },
  }
}

export function createFinalChunk(
  response: ChatCompletionResponse,
  model: string,
): ChatCompletionsChunk {
  return {
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
      model,
      usage: response.usage,
      system_fingerprint: "fp_44709d6fcb",
    },
  }
}

export function segmentResponse(content: string): Array<string> {
  const segmenter = new Intl.Segmenter("en", { granularity: "word" })
  return Array.from(segmenter.segment(content)).map(
    (segment) => segment.segment,
  )
}
