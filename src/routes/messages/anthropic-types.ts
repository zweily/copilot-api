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
    type: "auto" | "any" | "tool" | "none"
    name?: string
  }
}

export interface AnthropicMessage {
  role: "user" | "assistant"
  content: string | Array<AnthropicContentBlock>
}

export type AnthropicContentBlock =
  | AnthropicTextBlock
  | AnthropicImageBlock
  | AnthropicToolResultBlock

export interface AnthropicTextBlock {
  type: "text"
  text: string
}

export interface AnthropicImageBlock {
  type: "image"
  source: {
    type: "base64"
    media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
    data: string
  }
}

export interface AnthropicToolResultBlock {
  type: "tool_result"
  tool_use_id: string
  content: string
  is_error?: boolean
}

export interface AnthropicTool {
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

export interface AnthropicToolUseBlock {
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
