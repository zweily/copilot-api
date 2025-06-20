import {
  type ChatCompletionChunk,
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

// Anthropic Stream Event Types
export interface AnthropicMessageStartEvent {
  type: "message_start"
  message: Omit<
    AnthropicResponse,
    "stop_reason" | "stop_sequence" | "content"
  > & {
    content: []
  }
}

export interface AnthropicContentBlockStartEvent {
  type: "content_block_start"
  index: number
  content_block:
    | { type: "text"; text: string }
    | (Omit<AnthropicToolUseBlock, "input"> & {
        input: Record<string, unknown>
      })
}

export interface AnthropicContentBlockDeltaEvent {
  type: "content_block_delta"
  index: number
  delta:
    | { type: "text_delta"; text: string }
    | { type: "input_json_delta"; partial_json: string }
}

export interface AnthropicContentBlockStopEvent {
  type: "content_block_stop"
  index: number
}

export interface AnthropicMessageDeltaEvent {
  type: "message_delta"
  delta: {
    stop_reason: AnthropicResponse["stop_reason"]
    stop_sequence: string | null
  }
  // OpenAI does not provide token usage per chunk, so this is omitted.
  // usage: { output_tokens: number }
}

export interface AnthropicMessageStopEvent {
  type: "message_stop"
}

export type AnthropicStreamEventData =
  | AnthropicMessageStartEvent
  | AnthropicContentBlockStartEvent
  | AnthropicContentBlockDeltaEvent
  | AnthropicContentBlockStopEvent
  | AnthropicMessageDeltaEvent
  | AnthropicMessageStopEvent

// State for streaming translation
export interface AnthropicStreamState {
  messageStartSent: boolean
  contentBlockIndex: number
  contentBlockOpen: boolean
  toolCalls: {
    [openAIToolIndex: number]: {
      id: string
      name: string
      anthropicBlockIndex: number
    }
  }
}

// Payload translation

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

// Response translation

// Stream response translation

/**
 * Translates a single OpenAI ChatCompletionChunk to a series of Anthropic-style stream events.
 * This function is stateful and requires a state object to be maintained across calls.
 *
 * @param chunk The OpenAI chunk to translate.
 * @param state The current state of the stream translation.
 * @param inputTokens The number of tokens in the prompt, required for the initial message_start event.
 * @returns An array of Anthropic stream event data objects.
 */
export function translateChunkToAnthropicEvents(
  chunk: ChatCompletionChunk,
  state: AnthropicStreamState,
  inputTokens: number,
): Array<AnthropicStreamEventData> {
  const events: Array<AnthropicStreamEventData> = []
  const delta = chunk.choices[0].delta

  // 1. Handle message_start
  if (delta.role === "assistant" && !state.messageStartSent) {
    events.push({
      type: "message_start",
      message: {
        id: chunk.id,
        type: "message",
        role: "assistant",
        content: [],
        model: chunk.model,
        usage: {
          input_tokens: inputTokens,
          output_tokens: 1, // Placeholder, not updated in subsequent events
        },
      },
    })
    state.messageStartSent = true
  }

  // 2. Handle text content
  if (delta.content) {
    if (!state.contentBlockOpen) {
      // Start a new text block if no block is open
      events.push({
        type: "content_block_start",
        index: state.contentBlockIndex,
        content_block: { type: "text", text: "" },
      })
      state.contentBlockOpen = true
    }
    events.push({
      type: "content_block_delta",
      index: state.contentBlockIndex,
      delta: { type: "text_delta", text: delta.content },
    })
  }

  // 3. Handle tool calls
  if (delta.tool_calls) {
    for (const toolCallDelta of delta.tool_calls) {
      // A new tool call is starting
      if (toolCallDelta.id && toolCallDelta.function?.name) {
        if (state.contentBlockOpen) {
          // Close the previous content block (which must be a text block)
          events.push({
            type: "content_block_stop",
            index: state.contentBlockIndex,
          })
          state.contentBlockIndex++
        }
        const anthropicBlockIndex = state.contentBlockIndex
        state.toolCalls[toolCallDelta.index] = {
          id: toolCallDelta.id,
          name: toolCallDelta.function.name,
          anthropicBlockIndex,
        }
        events.push({
          type: "content_block_start",
          index: anthropicBlockIndex,
          content_block: {
            type: "tool_use",
            id: toolCallDelta.id,
            name: toolCallDelta.function.name,
            input: {},
          },
        })
        state.contentBlockOpen = true
      }

      // Argument chunks for the tool call
      if (toolCallDelta.function?.arguments) {
        const toolInfo = state.toolCalls[toolCallDelta.index]
        if (toolInfo) {
          events.push({
            type: "content_block_delta",
            index: toolInfo.anthropicBlockIndex,
            delta: {
              type: "input_json_delta",
              partial_json: toolCallDelta.function.arguments,
            },
          })
        }
      }
    }
  }

  // 4. Handle end of stream
  const finishReason = chunk.choices[0].finish_reason
  if (finishReason) {
    if (state.contentBlockOpen) {
      events.push({
        type: "content_block_stop",
        index: state.contentBlockIndex,
      })
      state.contentBlockOpen = false
    }
    events.push({
      type: "message_delta",
      delta: {
        stop_reason: mapOpenAIStopReasonToAnthropic(finishReason),
        stop_sequence: null,
      },
    })
    events.push({ type: "message_stop" })
  }

  return events
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
