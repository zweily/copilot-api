import { events } from "fetch-event-stream"

import { copilotHeaders, copilotBaseUrl } from "~/lib/api-config"
import { HTTPError } from "~/lib/http-error"
import { state } from "~/lib/state"

export const createChatCompletions = async (
  payload: ChatCompletionsPayload,
) => {
  if (!state.copilotToken) throw new Error("Copilot token not found")

  for (const message of payload.messages) {
    intoCopilotMessage(message)
  }

  const visionEnable = payload.messages.some(
    (x) =>
      typeof x.content !== "string"
      && x.content.some((x) => x.type === "image_url"),
  )

  const response = await fetch(`${copilotBaseUrl(state)}/chat/completions`, {
    method: "POST",
    headers: copilotHeaders(state, visionEnable),
    body: JSON.stringify(payload),
  })

  if (!response.ok)
    throw new HTTPError("Failed to create chat completions", response)

  if (payload.stream) {
    return events(response)
  }

  return (await response.json()) as ChatCompletionResponse
}

const intoCopilotMessage = (message: Message) => {
  if (typeof message.content === "string") return false

  for (const part of message.content) {
    if (part.type === "input_image") part.type = "image_url"
  }
}

// Streaming types

export interface ChatCompletionChunk {
  choices: [Choice]
  created: number
  object: "chat.completion.chunk"
  id: string
  model: string
}

interface Delta {
  content?: string
  role?: string
}

interface Choice {
  index: number
  delta: Delta
  finish_reason: "stop" | null
  logprobs: null
}

// Non-streaming types

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: [ChoiceNonStreaming]
}

interface ChoiceNonStreaming {
  index: number
  message: Message
  logprobs: null
  finish_reason: "stop"
}

// Payload types

export interface ChatCompletionsPayload {
  messages: Array<Message>
  model: string
  temperature?: number
  top_p?: number
  max_tokens?: number
  stop?: Array<string>
  n?: number
  stream?: boolean
}

export interface Message {
  role: "user" | "assistant" | "system"
  content: string | Array<ContentPart>
}

// https://platform.openai.com/docs/api-reference

export interface ContentPart {
  type: "input_image" | "input_text" | "image_url"
  text?: string
  image_url?: string
}
// https://platform.openai.com/docs/guides/images-vision#giving-a-model-images-as-input
// Note: copilot use "image_url", but openai use "input_image"
