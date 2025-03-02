import { stream } from "fetch-event-stream"
import { x } from "tinyexec"
import { describe, it, beforeAll, afterAll, expect } from "vitest"

import type { ChatCompletionsPayload } from "../src/services/copilot/chat-completions/types"

import { ChatCompletionChunkSchema } from "../src/services/copilot/chat-completions/types-streaming"

describe("Server API Tests", () => {
  const TEST_PORT = 4142
  const BASE_URL = `http://localhost:${TEST_PORT}`

  let serverProcess: ReturnType<typeof x>

  beforeAll(async () => {
    // Start the server as a separate process
    serverProcess = x("bun", ["run", "start", "--port", TEST_PORT.toString()])

    // Wait a bit for server to be ready
    await new Promise((resolve) => setTimeout(resolve, 5000))
  })

  afterAll(() => {
    serverProcess.kill("SIGTERM")
  })

  it("POST /chat/completions should return valid completion (streaming)", async () => {
    const payload: ChatCompletionsPayload = {
      messages: [{ role: "user", content: "Write a short greeting" }],
      model: "gpt-3.5-turbo",
      stream: true, // Make sure to set stream to true
    }

    let receivedChunks = 0
    let hasContent = false
    let hasFinishReason = false

    try {
      const response = await stream(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      for await (const chunk of response) {
        console.log(chunk)

        if (chunk.data === "[DONE]") break

        // Validate each chunk against our schema
        const parseResult = ChatCompletionChunkSchema.safeParse(
          JSON.parse(chunk.data ?? "{}"),
        )

        if (!parseResult.success) {
          console.error("Invalid chunk format:", parseResult.error)
          throw new Error(`Invalid chunk format: ${parseResult.error.message}`)
        }

        receivedChunks++

        // Check if we're getting content in the delta
        if (parseResult.data.choices[0]?.delta?.content) {
          hasContent = true
        }

        // Check if we get a finish reason (indicates completion)
        if (parseResult.data.choices[0]?.finish_reason) {
          hasFinishReason = true
        }
      }

      // Add assertions to verify the response was correct
      expect(receivedChunks).toBeGreaterThan(0)
      expect(hasContent).toBe(true)
      expect(hasFinishReason).toBe(true)
    } catch (error) {
      console.error("Streaming test failed:", error)
      throw error
    }
  })
})
