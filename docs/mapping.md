### **Comprehensive API Translation: Anthropic Messages & OpenAI Chat Completions**

This document provides a detailed, side-by-side technical mapping of the Anthropic Messages API and the OpenAI Chat Completions API, verified against their respective specifications.

---

### **1. Endpoints & Authentication**

| Feature              | Anthropic Messages API    | OpenAI Chat Completions API          |
| :------------------- | :------------------------ | :----------------------------------- |
| **Primary Endpoint** | `POST /v1/messages`       | `POST /v1/chat/completions`          |
| **Auth Header**      | `x-api-key: YOUR_API_KEY` | `Authorization: Bearer YOUR_API_KEY` |

---

### **2. Core Request Parameters**

This table outlines the translation of primary request body fields.

| Parameter           | Anthropic Messages API (`claude.md`)         | OpenAI Chat Completions API (`openapi.documented.yml`)              |
| :------------------ | :------------------------------------------- | :------------------------------------------------------------------ |
| **Model**           | `model` (e.g., `claude-3-7-sonnet-20250219`) | `model` (e.g., `gpt-4o`)                                            |
| **System Prompt**   | `system` (A top-level string)                | Prepending a message with `role: "system"` to the `messages` array. |
| **Max Tokens**      | `max_tokens` (integer)                       | `max_tokens` (integer)                                              |
| **Stop Sequences**  | `stop_sequences` (array of strings)          | `stop` (array of strings)                                           |
| **Streaming**       | `stream` (boolean)                           | `stream` (boolean)                                                  |
| **Temperature**     | `temperature` (0.0 to 1.0)                   | `temperature` (0.0 to 2.0)                                          |
| **Top P**           | `top_p` (0.0 to 1.0)                         | `top_p` (0.0 to 1.0)                                                |
| **Top K**           | `top_k` (integer)                            | **Not Supported**                                                   |
| **User Identifier** | `metadata.user_id` (string)                  | `user` (string)                                                     |

---

### **3. Message Structure**

Both APIs use a `messages` array, but the structure and content types differ.

#### **3.1. Message Roles**

| Role              | Anthropic Messages API                        | OpenAI Chat Completions API |
| :---------------- | :-------------------------------------------- | :-------------------------- |
| **User**          | `user`                                        | `user`                      |
| **Assistant**     | `assistant`                                   | `assistant`                 |
| **System**        | Handled via the top-level `system` parameter. | `system`                    |
| **Tool/Function** | A `user` message with `tool_result` content.  | `tool`                      |

#### **3.2. Message Content Types**

| Content Type    | Anthropic Messages API (`claude.md`)                                                                               | OpenAI Chat Completions API (`openapi.documented.yml`)                                                   |
| :-------------- | :----------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **Text**        | `content` can be a single string or an array with `{"type": "text", "text": "..."}`.                               | A message object's `content` is a string or an array with `{"type": "text", "text": "..."}`.             |
| **Image**       | `content` array can contain `{"type": "image", "source": {"type": "base64", "media_type": "...", "data": "..."}}`. | `content` array can contain `{"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,..."}}`. |
| **Tool Result** | A `user` message `content` array can contain `{"type": "tool_result", "tool_use_id": "...", "content": "..."}`.    | A distinct message object: `{"role": "tool", "tool_call_id": "...", "content": "..."}`.                  |

---

### **4. Tool & Function Handling**

| Feature                   | Anthropic Messages API (`claude.md`)                                                                                                 | OpenAI Chat Completions API (`openapi.documented.yml`)                                                                                                         |
| :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tool Definition**       | `tools` array. Each tool has `name`, `description`, and `input_schema`.                                                              | `tools` array. Each tool has `type: "function"` and a `function` object with `name`, `description`, and `parameters`.                                          |
| **Tool Choice**           | `tool_choice` object with `type`: \<br\> - `"auto"` \<br\> - `"any"` (Forces use of a tool) \<br\> - `"tool"` (Forces specific tool) | `tool_choice` string or object: \<br\> - `"auto"` \<br\> - `"required"` (Forces use of a tool) \<br\> - `{"type": "function", ...}` (Forces specific function) |
| **Tool Call in Response** | In `content` array as `{"type": "tool_use", "id": "...", "name": "...", "input": {...}}`.                                            | In `message` object as a `tool_calls` array, with `id` and `function` object (`name`, `arguments` as JSON string).                                             |

---

### **5. Response Structure**

| Feature              | Anthropic Messages API (`claude.md`)                                                           | OpenAI Chat Completions API (`openapi.documented.yml`)                           |
| :------------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| **Primary Object**   | A single response object.                                                                      | A `choices` array containing one or more message objects.                        |
| **Stop Reason**      | `stop_reason` field. Values: `end_turn`, `max_tokens`, `tool_use`, `stop_sequence`, `refusal`. | `finish_reason` field. Values: `stop`, `length`, `tool_calls`, `content_filter`. |
| **Usage Statistics** | `usage` object with `input_tokens` and `output_tokens`.                                        | `usage` object with `prompt_tokens`, `completion_tokens`, and `total_tokens`.    |

---

### **6. Model & Tokenization Endpoints**

#### **6.1. List Available Models**

| Feature           | Anthropic Messages API             | OpenAI Chat Completions API |
| :---------------- | :--------------------------------- | :-------------------------- |
| **Endpoint**      | `GET /v1/models`                   | `GET /v1/models`            |
| **Response**      | Paginated list in `data` array.    | List in `data` array.       |
| **Object Fields** | `id`, `display_name`, `created_at` | `id`, `created`, `owned_by` |

#### **6.2. Retrieve a Specific Model**

| Feature      | Anthropic Messages API       | OpenAI Chat Completions API |
| :----------- | :--------------------------- | :-------------------------- |
| **Endpoint** | `GET /v1/models/{model_id}`  | `GET /v1/models/{model}`    |
| **Response** | A single `ModelInfo` object. | A single `Model` object.    |

#### **6.3. Count Tokens**

| Feature           | Anthropic Messages API                                                                                 | OpenAI Chat Completions API                                                                                                                                        |
| :---------------- | :----------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Endpoint**      | `POST /v1/messages/count_tokens`                                                                       | **No Direct API Endpoint**                                                                                                                                         |
| **Functionality** | Counts tokens for a message payload (including images and tools) before making a full completion call. | Token counts are returned in the `usage` object only _after_ a completion is generated. Client-side libraries (e.g., `tiktoken`) must be used for pre-calculation. |
| **Response**      | `{"input_tokens": ...}`                                                                                | N/A                                                                                                                                                                |

---

### **7. Streaming**

Both APIs support streaming via Server-Sent Events (SSE), but the event structure is fundamentally different.

- **Anthropic:** Emits a sequence of distinct, named events such as `message_start`, `content_block_start`, `content_block_delta`, and `message_stop`. This provides a highly structured stream.
- **OpenAI:** Emits a series of unnamed `data:` events containing `chat.completion.chunk` objects with partial updates. The stream terminates with `data: [DONE]`.

A translation layer must buffer OpenAI's delta chunks to reconstruct Anthropic's structured event stream, including generating necessary IDs and calculating token usage for the final event.

---

### **8. Error Handling**

Error responses are structurally similar, containing a main `error` object. HTTP status codes generally correspond.

| HTTP Code | Anthropic `error.type`  | OpenAI `error.type`       |
| :-------- | :---------------------- | :------------------------ |
| 400       | `invalid_request_error` | `invalid_request_error`   |
| 401       | `authentication_error`  | `authentication_error`    |
| 403       | `permission_error`      | `permission_denied_error` |
| 429       | `rate_limit_error`      | `rate_limit_error`        |
| 500       | `api_error`             | `internal_server_error`   |

---

### **9. Summary of Key Asymmetrical Features**

- **`top_k` Sampling:** Supported by Anthropic, but not by OpenAI's Chat Completions API.
- **Partial Assistant Prefill:** Anthropic allows providing a prefix for the assistant's response, a feature OpenAI does not support.
- **Dedicated Token Counting:** Anthropic offers a specific API endpoint to count tokens before a call, whereas OpenAI does not.
