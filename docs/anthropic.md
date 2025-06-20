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

| Parameter        | Type            | Required | Description                                                                                                                                         |
| :--------------- | :-------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`          | string          | Yes      | The model that will complete your prompt. Example: `claude-3-7-sonnet-20250219`.                                                                    |
| `messages`       | array           | Yes      | A list of input messages comprising the conversation so far. See [The Message Object](https://www.google.com/search?q=%23the-message-object) below. |
| `max_tokens`     | integer         | Yes      | The maximum number of tokens to generate. Different models have different maximums.                                                                 |
| `system`         | string or array | No       | A system prompt to provide context and instructions to Claude, such as specifying a role or goal.                                                   |
| `metadata`       | object          | No       | An object for metadata, such as a `user_id`, to help detect abuse. Do not include any personally identifying information.                           |
| `stop_sequences` | array           | No       | Custom text sequences that will cause the model to stop generating.                                                                                 |
| `stream`         | boolean         | No       | If set, the response will be incrementally streamed using server-sent events. Defaults to `false`.                                                  |
| `temperature`    | number          | No       | The amount of randomness injected into the response, ranging from `0.0` to `1.0`. Defaults to `1.0`.                                                |
| `top_p`          | number          | No       | Use nucleus sampling. The model considers tokens with `top_p` probability mass. Should alter `temperature` or `top_p`, but not both.                |
| `top_k`          | integer         | No       | Only sample from the top K options for each subsequent token. Recommended for advanced use cases.                                                   |
| `tools`          | array           | No       | A list of tools the model may use. See [The Tool Object](https://www.google.com/search?q=%23the-tool-object) below.                                 |
| `tool_choice`    | object          | No       | Controls how the model should use the provided tools. Can be `auto`, `any`, `tool`, or `none`.                                                      |

#### The Message Object

The `messages` array consists of message objects, where each object has a `role` and `content`. Models are trained on alternating `user` and `assistant` turns.

| Parameter | Type            | Required | Description                                                                                                                         |
| :-------- | :-------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `role`    | string          | Yes      | The role of the message author. Must be either `user` or `assistant`.                                                               |
| `content` | string or array | Yes      | The content of the message. This can be a simple string or an array of content blocks for multimodal input (e.g., text and images). |

**Content Blocks:** For multimodal input, the `content` array can contain different types of blocks.

- **`text`**: A block with a `type` of "text" and a `text` field containing the string.
- **`image`**: A block with a `type` of "image" and a `source` object. The source must specify its `type` (e.g., "base64"), `media_type` (e.g., "image/jpeg"), and `data`.
- **`tool_result`**: A block used to return the output of a tool back to the model. It includes the `tool_use_id`, `content`, and an optional `is_error` flag.

#### The Tool Object

The `tools` array allows you to define client-side tools the model can call.

| Parameter      | Type   | Required | Description                                                                                               |
| :------------- | :----- | :------- | :-------------------------------------------------------------------------------------------------------- |
| `name`         | string | Yes      | The name of the tool, matching `^[a-zA-Z0-9_-]{1,64}$`.                                                   |
| `description`  | string | No       | A detailed description of what the tool does, which helps the model decide when to use it.                |
| `input_schema` | object | Yes      | A [JSON Schema](https://json-schema.org/draft/2020-12) object describing the parameters the tool accepts. |

#### Response (200 OK)

A successful non-streaming request returns a `Message` object.

| Parameter       | Type   | Description                                                                                                               |
| :-------------- | :----- | :------------------------------------------------------------------------------------------------------------------------ |
| `id`            | string | A unique identifier for the message object.                                                                               |
| `type`          | string | The object type, which is always `message`.                                                                               |
| `role`          | string | The role of the author, which is always `assistant`.                                                                      |
| `content`       | array  | An array of content blocks generated by the model (e.g., `text` or `tool_use`).                                           |
| `model`         | string | The model that handled the request.                                                                                       |
| `stop_reason`   | string | The reason the model stopped generating tokens. Can be `end_turn`, `max_tokens`, `stop_sequence`, or `tool_use`.          |
| `stop_sequence` | string | If the model was stopped by a stop sequence, this field will contain which sequence was generated. Can be null.           |
| `usage`         | object | An object containing token usage statistics. See [The Usage Object](https://www.google.com/search?q=%23the-usage-object). |

#### The Usage Object

The `usage` object details billing and rate-limit token counts.

| Parameter       | Type    | Description                            |
| :-------------- | :------ | :------------------------------------- |
| `input_tokens`  | integer | The number of input tokens used.       |
| `output_tokens` | integer | The number of output tokens generated. |

### Count Message Tokens

Calculates the number of tokens for a given set of messages without executing the model.

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

| Parameter      | Type    | Description                                                                     |
| :------------- | :------ | :------------------------------------------------------------------------------ |
| `input_tokens` | integer | The total number of tokens counted from the messages, system prompt, and tools. |

---

## Models API

The Models API allows you to list and retrieve information about available models.

### List Models

Lists the currently available models, with the most recent models appearing first.

**Endpoint:** `GET /v1/models`

#### Response (200 OK)

A successful request returns a list of model objects.

| Parameter  | Type    | Description                                                                     |
| :--------- | :------ | :------------------------------------------------------------------------------ |
| `data`     | array   | A list of [Model Objects](https://www.google.com/search?q=%23the-model-object). |
| `has_more` | boolean | Indicates if more results are available for pagination.                         |

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
