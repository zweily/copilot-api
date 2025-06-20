import { type ChatCompletionChunk } from "~/services/copilot/create-chat-completions"

import {
  type AnthropicStreamEventData,
  type AnthropicStreamState,
} from "./anthropic-types"
import { mapOpenAIStopReasonToAnthropic } from "./utils"

function handleMessageStart(
  chunk: ChatCompletionChunk,
  state: AnthropicStreamState,
  inputTokens: number,
): AnthropicStreamEventData | undefined {
  if (chunk.choices[0].delta.role === "assistant" && !state.messageStartSent) {
    state.messageStartSent = true
    return {
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
    }
  }
}

function handleTextContent(
  chunk: ChatCompletionChunk,
  state: AnthropicStreamState,
): Array<AnthropicStreamEventData> {
  const events: Array<AnthropicStreamEventData> = []
  const { content } = chunk.choices[0].delta
  if (!content) {
    return events
  }

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
    delta: { type: "text_delta", text: content },
  })
  return events
}

function handleToolCalls(
  chunk: ChatCompletionChunk,
  state: AnthropicStreamState,
): Array<AnthropicStreamEventData> {
  const events: Array<AnthropicStreamEventData> = []
  const { tool_calls } = chunk.choices[0].delta
  if (!tool_calls) {
    return events
  }

  for (const toolCallDelta of tool_calls) {
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
  return events
}

function handleEndOfStream(
  chunk: ChatCompletionChunk,
  state: AnthropicStreamState,
): Array<AnthropicStreamEventData> {
  const events: Array<AnthropicStreamEventData> = []
  const { finish_reason } = chunk.choices[0]
  if (finish_reason === null) {
    return events
  }

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
      stop_reason: mapOpenAIStopReasonToAnthropic(finish_reason),
      stop_sequence: null,
    },
  })
  events.push({ type: "message_stop" })
  return events
}

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

  const messageStartEvent = handleMessageStart(chunk, state, inputTokens)
  if (messageStartEvent) {
    events.push(messageStartEvent)
  }

  events.push(...handleTextContent(chunk, state))
  events.push(...handleToolCalls(chunk, state))
  events.push(...handleEndOfStream(chunk, state))

  return events
}
