import {
  type ChatCompletionResponse,
  type ChatCompletionsPayload,
  type ContentPart,
  type Message,
  type TextPart,
  type Tool,
  type ToolCall,
} from "~/services/copilot/create-chat-completions"

// Anthropic API Types

export interface AnthropicMessagesPayload {
  model: string
  messages: Array<AnthropicMessage>
  max_tokens: number
  system?: string | Array<AnthropicTextBlock>
  metadata?: {
    user_id?: string
  }
  stop_sequences?: Array<string>
  stream?: boolean
  temperature?: number
  top_p?: number
  top_k?: number
  tools?: Array<AnthropicTool>
  tool_choice?: {
    type: "auto" | "any" | "tool"
    name?: string
  }
}

interface AnthropicMessage {
  role: "user" | "assistant"
  content: string | Array<AnthropicContentBlock>
}

type AnthropicContentBlock =
  | AnthropicTextBlock
  | AnthropicImageBlock
  | AnthropicToolResultBlock

interface AnthropicTextBlock {
  type: "text"
  text: string
}

interface AnthropicImageBlock {
  type: "image"
  source: {
    type: "base64"
    media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
    data: string
  }
}

interface AnthropicToolResultBlock {
  type: "tool_result"
  tool_use_id: string
  content: string
}

interface AnthropicTool {
  name: string
  description?: string
  input_schema: Record<string, unknown>
}

export interface AnthropicResponse {
  id: string
  type: "message"
  role: "assistant"
  content: Array<AnthropicResponseContentBlock>
  model: string
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence" | "tool_use" | null
  stop_sequence: string | null
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export type AnthropicResponseContentBlock =
  | AnthropicTextBlock
  | AnthropicToolUseBlock

interface AnthropicToolUseBlock {
  type: "tool_use"
  id: string
  name: string
  input: Record<string, unknown>
}

// Translation functions

function getAnthropicTextBlocks(
  messageContent: Message["content"],
): Array<AnthropicTextBlock> {
  if (typeof messageContent === "string") {
    return [{ type: "text", text: messageContent }]
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .filter((part): part is TextPart => part.type === "text")
      .map((part) => ({ type: "text", text: part.text }))
  }

  return []
}

function getAnthropicToolUseBlocks(
  toolCalls: Array<ToolCall> | undefined,
): Array<AnthropicToolUseBlock> {
  if (!toolCalls) {
    return []
  }
  return toolCalls.map((toolCall) => ({
    type: "tool_use",
    id: toolCall.id,
    name: toolCall.function.name,
    input: JSON.parse(toolCall.function.arguments) as Record<string, unknown>,
  }))
}

function mapOpenAIStopReasonToAnthropic(
  finishReason: ChatCompletionResponse["choices"][0]["finish_reason"],
): AnthropicResponse["stop_reason"] {
  const stopReasonMap = {
    stop: "end_turn",
    length: "max_tokens",
    tool_calls: "tool_use",
    content_filter: "end_turn",
  } as const
  return stopReasonMap[finishReason]
}

function mapContent(
  content: string | Array<AnthropicContentBlock>,
): string | Array<ContentPart> | null {
  if (typeof content === "string") {
    return content
  }
  if (!Array.isArray(content)) {
    return null
  }

  const contentParts: Array<ContentPart> = []
  for (const block of content) {
    if (block.type === "text") {
      contentParts.push({ type: "text", text: block.text })
    } else if (block.type === "image") {
      contentParts.push({
        type: "image_url",
        image_url: {
          url: `data:${block.source.media_type};base64,${block.source.data}`,
        },
      })
    }
  }
  return contentParts
}

function translateAnthropicMessagesToOpenAI(
  anthropicMessages: Array<AnthropicMessage>,
  system: string | Array<AnthropicTextBlock> | undefined,
): Array<Message> {
  const messages: Array<Message> = []

  if (system) {
    if (typeof system === "string") {
      messages.push({ role: "system", content: system })
    } else {
      const systemText = system.map((block) => block.text).join("\n\n")
      messages.push({ role: "system", content: systemText })
    }
  }

  for (const message of anthropicMessages) {
    if (message.role === "user" && Array.isArray(message.content)) {
      const toolResultBlocks = message.content.filter(
        (block): block is AnthropicToolResultBlock =>
          block.type === "tool_result",
      )
      const otherBlocks = message.content.filter(
        (block) => block.type !== "tool_result",
      )

      if (otherBlocks.length > 0) {
        messages.push({
          role: "user",
          content: mapContent(otherBlocks),
        })
      }

      for (const block of toolResultBlocks) {
        messages.push({
          role: "tool",
          tool_call_id: block.tool_use_id,
          content: block.content,
        })
      }
    } else {
      messages.push({
        role: message.role,
        content: mapContent(message.content),
      })
    }
  }
  return messages
}

function translateAnthropicToolsToOpenAI(
  anthropicTools: Array<AnthropicTool> | undefined,
): Array<Tool> | undefined {
  if (!anthropicTools) {
    return undefined
  }
  return anthropicTools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema,
    },
  }))
}

function translateAnthropicToolChoiceToOpenAI(
  anthropicToolChoice: AnthropicMessagesPayload["tool_choice"],
): ChatCompletionsPayload["tool_choice"] {
  if (!anthropicToolChoice) {
    return undefined
  }

  switch (anthropicToolChoice.type) {
    case "auto": {
      return "auto"
    }
    case "any": {
      // The type definition for tool_choice is missing "required", but it's a valid value.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return "required"
    }
    case "tool": {
      if (anthropicToolChoice.name) {
        return {
          type: "function",
          function: { name: anthropicToolChoice.name },
        }
      }
      return undefined
    }
    default: {
      return undefined
    }
  }
}

export function translateToOpenAI(
  payload: AnthropicMessagesPayload,
): ChatCompletionsPayload {
  return {
    model: payload.model,
    messages: translateAnthropicMessagesToOpenAI(
      payload.messages,
      payload.system,
    ),
    max_tokens: payload.max_tokens,
    stop: payload.stop_sequences,
    stream: payload.stream,
    temperature: payload.temperature,
    top_p: payload.top_p,
    user: payload.metadata?.user_id,
    tools: translateAnthropicToolsToOpenAI(payload.tools),
    tool_choice: translateAnthropicToolChoiceToOpenAI(payload.tool_choice),
  }
}

export function translateToAnthropic(
  response: ChatCompletionResponse,
): AnthropicResponse {
  const choice = response.choices[0]
  const textBlocks = getAnthropicTextBlocks(choice.message.content)
  const toolUseBlocks = getAnthropicToolUseBlocks(choice.message.tool_calls)

  return {
    id: response.id,
    type: "message",
    role: "assistant",
    model: response.model,
    content: [...textBlocks, ...toolUseBlocks],
    stop_reason: mapOpenAIStopReasonToAnthropic(choice.finish_reason),
    stop_sequence: null,
    usage: {
      input_tokens: response.usage?.prompt_tokens ?? 0,
      output_tokens: response.usage?.completion_tokens ?? 0,
    },
  }
}
