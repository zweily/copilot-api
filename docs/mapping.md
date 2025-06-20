Of course. Here is the updated and corrected mapping document, now including the "Models" and "Token Count" endpoints.

---

### **Comprehensive API Translation: Anthropic Messages & OpenAI Chat Completions**

This document provides a detailed, side-by-side technical mapping of the Anthropic Messages API and the OpenAI Chat Completions API, based on the provided API specifications.

---

### **1. API Endpoints & Authentication**

| Feature         | Anthropic Messages API    | OpenAI Chat Completions API          |
| :-------------- | :------------------------ | :----------------------------------- |
| **Endpoint**    | `POST /v1/messages`       | `POST /v1/chat/completions`          |
| **Auth Header** | `x-api-key: YOUR_API_KEY` | `Authorization: Bearer YOUR_API_KEY` |

---

### **2. Core Request Parameters**

| Parameter           | Anthropic Messages API                       | OpenAI Chat Completions API                                         |
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

| Content Type    | Anthropic Messages API                                                                                             | OpenAI Chat Completions API                                                                                  |
| :-------------- | :----------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Text**        | `content` can be a single string or an array containing `{"type": "text", "text": "..."}`.                         | A message object's `content` property is a string, or an array containing `{"type": "text", "text": "..."}`. |
| **Image**       | `content` array can contain `{"type": "image", "source": {"type": "base64", "media_type": "...", "data": "..."}}`. | `content` array can contain `{"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,..."}}`.     |
| **Tool Result** | A `user` message `content` array can contain `{"type": "tool_result", "tool_use_id": "...", "content": "..."}`.    | A distinct message object with `{"role": "tool", "tool_call_id": "...", "content": "..."}`.                  |

---

### **4. Tool & Function Handling**

| Feature                   | Anthropic Messages API                                                                                                                                       | OpenAI Chat Completions API                                                                                                                                                             |
| :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tool Definition**       | `tools` array. Each tool has `name`, `description`, and `input_schema`.                                                                                      | `tools` array. Each tool has `type: "function"` and a `function` object with `name`, `description`, and `parameters` (JSON Schema).                                                     |
| **Tool Choice**           | `tool_choice` object with `type`: \<br\> - `"auto"`: Model decides. \<br\> - `"any"`: Forces model to use a tool. \<br\> - `"tool"`: Forces a specific tool. | `tool_choice` string or object: \<br\> - `"auto"`: Model decides. \<br\> - `"required"`: Forces model to call a tool. \<br\> - `{"type": "function", ...}`: Forces a specific function. |
| **Tool Call in Response** | Appears in the `content` array as `{"type": "tool_use", "id": "...", "name": "...", "input": {...}}`.                                                        | Appears in the `message` object as a `tool_calls` array, with each call having an `id` and a `function` object with `name` and `arguments` (as a JSON string).                          |

---

### **5. Response Structure**

| Feature              | Anthropic Messages API                                                                                 | OpenAI Chat Completions API                                                                                  |
| :------------------- | :----------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Primary Object**   | A single response object.                                                                              | A `choices` array containing one or more message objects.                                                    |
| **Stop Reason**      | `stop_reason` field with values like `end_turn`, `max_tokens`, `tool_use`, `stop_sequence`, `refusal`. | `finish_reason` field within each choice, with values like `stop`, `length`, `tool_calls`, `content_filter`. |
| **Usage Statistics** | `usage` object with `input_tokens` and `output_tokens`.                                                | `usage` object with `prompt_tokens`, `completion_tokens`, and `total_tokens`.                                |

---

### **6. Model & Tokenization Endpoints**

#### **6.1. List Available Models**

| Feature           | Anthropic Messages API                      | OpenAI Chat Completions API            |
| :---------------- | :------------------------------------------ | :------------------------------------- |
| **Endpoint**      | `GET /v1/models`                            | `GET /v1/models`                       |
| **Response**      | Paginated list in `data` array.             | List in `data` array.                  |
| **Object Fields** | `id`, `display_name`, `created_at`, `type`. | `id`, `created`, `owned_by`, `object`. |

#### **6.2. Retrieve a Specific Model**

| Feature           | Anthropic Messages API                      | OpenAI Chat Completions API            |
| :---------------- | :------------------------------------------ | :------------------------------------- |
| **Endpoint**      | `GET /v1/models/{model_id}`                 | `GET /v1/models/{model}`               |
| **Response**      | A single `ModelInfo` object.                | A single `Model` object.               |
| **Object Fields** | `id`, `display_name`, `created_at`, `type`. | `id`, `created`, `owned_by`, `object`. |

#### **6.3. Count Tokens**

| Feature           | Anthropic Messages API                                                                                  | OpenAI Chat Completions API                                                                                                                              |
| :---------------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Endpoint**      | `POST /v1/messages/count_tokens`                                                                        | **No Direct API Endpoint**                                                                                                                               |
| **Functionality** | Counts tokens for a given message payload, including images and tools, without generating a completion. | Token counts are returned in the `usage` object only after a completion is generated. Client-side libraries like `tiktoken` must be used for estimation. |
| **Response**      | `{"input_tokens": ...}`                                                                                 | N/A                                                                                                                                                      |

---

### **7. Streaming & Error Handling**

- **Streaming:** Both APIs use Server-Sent Events (SSE). A translation layer must convert OpenAI's stream of `chat.completion.chunk` objects into Anthropic's more granular, named-event stream (`message_start`, `content_block_delta`, etc.).
- **Error Handling:** Error responses are structurally similar, containing a main `error` object. HTTP status codes generally correspond (e.g., 400 for bad requests, 401 for auth issues, 429 for rate limits).

---

### **8. Summary of Key Differences**

- **Token Counting:** Anthropic provides a dedicated API endpoint for counting tokens before sending a request, while OpenAI does not.
- **`top_k`:** Supported by Anthropic for request sampling, but not by OpenAI's Chat Completions API.
- **Model Information:** The APIs return different metadata for their models. Anthropic provides a `display_name`, whereas OpenAI provides `owned_by`.
- **Partial Assistant Prefill:** Anthropic allows providing a prefix for the assistant's response, a feature OpenAI does not support.
