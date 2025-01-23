import consola from "consola"
import { Hono } from "hono"
import { FetchError } from "ofetch"

import { APP_CONFIG } from "~/lib/config"

import { handler } from "./handler"
import { handlerStreaming } from "./handler-streaming"

export const completionRoutes = new Hono()

completionRoutes.post("/chat/completions", async (c) => {
  try {
    if (APP_CONFIG.EMULATE_STREAMING) {
      return await handler(c)
    }

    return await handlerStreaming(c)
  } catch (error) {
    if (error instanceof FetchError) {
      consola.error(`Request failed: ${error.message}`, error.response?._data)
    } else {
      consola.error("Error:", error)
    }

    throw error
  }
})
