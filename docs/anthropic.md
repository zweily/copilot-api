# Claude API Reference

This document provides a condensed overview of the Anthropic Claude API, covering messages, token counting, and model management.

---

## Messages API

The Messages API is the primary way to interact with Claude for multi-turn conversations and single queries.

### Create a Message

Creates a model response for the given conversation.

**Endpoint:** `POST /v1/messages`

#### Request Body

The request body is a JSON object.

| Parameter        | Type            | Required | Description                                                                                                                                           |
| :--------------- | :-------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`          | string          | Yes      | The model that will complete your prompt. Example: `claude-3-7-sonnet-20250219`.                                                                      |
| `messages`       | array           | Yes      | A list of input messages comprising the conversation so far. See [The Message Object](https://www.google.com/search?q=%23the-message-object) below.   |
| `max_tokens`     | integer         | Yes      | The maximum number of tokens to generate. Different models have different maximum values for this parameter.                                          |
| `system`         | string or array | No       | A system prompt to provide context and instructions to Claude, such as specifying a role or goal.                                                     |
| `metadata`       | object          | No       | An object for metadata, such as a `user_id`, to help detect abuse. Do not include any personally identifying information.                             |
| `stop_sequences` | array           | No       | Custom text sequences that will cause the model to stop generating.                                                                                   |
| `stream`         | boolean         | No       | If set, the response will be incrementally streamed using server-sent events. Defaults to `false`.                                                    |
| `temperature`    | number          | No       | The amount of randomness injected into the response, ranging from `0.0` to `1.0`. Defaults to `1.0`.                                                  |
| `thinking`       | object          | No       | Configuration for enabling Claude's extended thinking process, which shows reasoning steps before the final answer.                                   |
| `top_p`          | number          | No       | Use nucleus sampling. The model considers tokens with `top_p` probability mass. You should alter `temperature` or `top_p`, but not both.              |
| `top_k`          | integer         | No       | Only sample from the top K options for each subsequent token. Recommended for advanced use cases only.                                                |
| `tools`          | array           | No       | A list of tools the model may use. See [The Tool Object](https://www.google.com/search?q=%23the-tool-object) below.                                   |
| `tool_choice`    | object          | No       | Controls how the model should use tools. Can be `{"type": "auto"}`, `{"type": "any"}`, `{"type": "tool", "name": "tool_name"}` or `{"type": "none"}`. |
| `service_tier`   | string          | No       | Can be set to `auto` or `standard_only` to determine whether to use priority capacity.                                                                |

#### The Message Object

The `messages` array consists of message objects, where each object has a `role` and `content`. Models are trained on alternating `user` and `assistant` conversational turns.

| Parameter | Type            | Required | Description                                                                                                 |
| :-------- | :-------------- | :------- | :---------------------------------------------------------------------------------------------------------- |
| `role`    | string          | Yes      | The role of the message author. Must be either `user` or `assistant`.                                       |
| `content` | string or array | Yes      | The content of the message. This can be a simple string or an array of content blocks for multimodal input. |

**Content Blocks:** For multimodal input, the `content` array can contain different types of blocks.

- **`text`**: A block with a `type` of "text" and a `text` field containing the string.
- **`image`**: Starting with Claude 3 models, you can send image content blocks. The `source` object must specify a `type` of "base64", a `media_type` (`image/jpeg`, `image/png`, `image/gif`, or `image/webp`), and the `data`.
- **`tool_result`**: A block used to return the output of a tool back to the model. It includes the `tool_use_id`, the `content` from the tool's execution, and an optional `is_error` flag.

#### The Tool Object

The `tools` array allows you to define client-side tools the model can call.

| Parameter      | Type   | Required | Description                                                                                                      |
| :------------- | :----- | :------- | :--------------------------------------------------------------------------------------------------------------- |
| `name`         | string | Yes      | The name of the tool, which must match the pattern `^[a-zA-Z0-9_-]{1,64}$`.                                      |
| `description`  | string | No       | A detailed, strongly-recommended description of what the tool does, which helps the model decide when to use it. |
| `input_schema` | object | Yes      | A [JSON Schema](https://json-schema.org/draft/2020-12) object describing the parameters the tool accepts.        |

#### Response (200 OK)

A successful **non-streaming** request returns a `Message` object.

| Parameter       | Type   | Description                                                                                                                               |
| :-------------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `id`            | string | A unique identifier for the message object.                                                                                               |
| `type`          | string | The object type, which is always `message`.                                                                                               |
| `role`          | string | The role of the author, which is always `assistant`.                                                                                      |
| `content`       | array  | An array of content blocks generated by the model (e.g., `text` or `tool_use`).                                                           |
| `model`         | string | The model that handled the request.                                                                                                       |
| `stop_reason`   | string | The reason the model stopped generating tokens. Can be `end_turn`, `max_tokens`, `stop_sequence`, `tool_use`, `pause_turn`, or `refusal`. |
| `stop_sequence` | string | If the model was stopped by a custom stop sequence, this field will contain which sequence was generated. Can be null.                    |
| `usage`         | object | An object containing token usage statistics. See [The Usage Object](https://www.google.com/search?q=%23the-usage-object).                 |

#### Streaming Response (200 OK)

If `stream: true` is set, the API streams back a sequence of server-sent events. The response is a series of JSON events that incrementally build the complete message object.

According to the documentation, the `stop_reason` provides insight into the stream's state: in the initial `message_start` event, the `stop_reason` field will be `null`. In all other events, it will be non-null once the stopping condition is known.

#### The Usage Object

The `usage` object details billing and rate-limit token counts.

| Parameter                     | Type    | Description                                                                 |
| :---------------------------- | :------ | :-------------------------------------------------------------------------- |
| `input_tokens`                | integer | The number of input tokens used.                                            |
| `output_tokens`               | integer | The number of output tokens generated.                                      |
| `cache_creation_input_tokens` | integer | The number of input tokens used to create a cache entry.                    |
| `cache_read_input_tokens`     | integer | The number of input tokens read from the cache.                             |
| `service_tier`                | string  | The service tier used for the request (`standard`, `priority`, or `batch`). |

### Count Message Tokens

Calculates the number of tokens for a given set of messages without creating it.

**Endpoint:** `POST /v1/messages/count_tokens`

#### Request Body

The request accepts a subset of the "Create a Message" parameters.

| Parameter  | Type            | Required | Description                          |
| :--------- | :-------------- | :------- | :----------------------------------- |
| `model`    | string          | Yes      | The model that would be used.        |
| `messages` | array           | Yes      | A list of input messages.            |
| `system`   | string or array | No       | A system prompt.                     |
| `tools`    | array           | No       | A list of tools the model could use. |

#### Response (200 OK)

A successful request returns a JSON object.

| Parameter      | Type    | Description                                                                                |
| :------------- | :------ | :----------------------------------------------------------------------------------------- |
| `input_tokens` | integer | The total number of tokens across the provided list of messages, system prompt, and tools. |

---

## Models API

The Models API allows you to list and retrieve information about available models.

### List Models

Lists the currently available models, with the most recently released models appearing first.

**Endpoint:** `GET /v1/models`

#### Response (200 OK)

A successful request returns a list of model objects.

| Parameter  | Type    | Description                                                                     |
| :--------- | :------ | :------------------------------------------------------------------------------ |
| `data`     | array   | A list of [Model Objects](https://www.google.com/search?q=%23the-model-object). |
| `has_more` | boolean | Indicates if there are more results in the requested page direction.            |

### Get a Model

Retrieves a specific model instance by its ID or alias.

**Endpoint:** `GET /v1/models/{model_id}`

#### Response (200 OK)

A successful request returns a single [Model Object](https://www.google.com/search?q=%23the-model-object).

#### The Model Object

| Parameter      | Type   | Description                                                         |
| :------------- | :----- | :------------------------------------------------------------------ |
| `id`           | string | The unique model identifier. Example: `claude-3-7-sonnet-20250219`. |
| `type`         | string | The object type, which is always `model`.                           |
| `display_name` | string | A human-readable name for the model. Example: `Claude 3.7 Sonnet`.  |
| `created_at`   | string | An RFC 3339 datetime string of when the model was released.         |
