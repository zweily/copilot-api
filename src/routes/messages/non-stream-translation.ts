import {
  type ChatCompletionResponse,
  type ChatCompletionsPayload,
  type ContentPart,
  type Message,
  type TextPart,
  type Tool,
  type ToolCall,
} from "~/services/copilot/create-chat-completions"

import {
  type AnthropicContentBlock,
  type AnthropicMessage,
  type AnthropicMessagesPayload,
  type AnthropicResponse,
  type AnthropicTextBlock,
  type AnthropicTool,
  type AnthropicToolResultBlock,
  type AnthropicToolUseBlock,
} from "./anthropic-types"
import { mapOpenAIStopReasonToAnthropic } from "./utils"

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
    case "none": {
      return "none"
    }
    default: {
      return undefined
    }
  }
}

// Response translation

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
