import consola from "consola"
import { Hono } from "hono"
import { FetchError } from "ofetch"

import { ENV } from "~/config/env"

import { handler } from "./handler"
import { handlerStreaming } from "./handler-streaming"

export const completionRoutes = new Hono()

completionRoutes.post("/chat/completions", (c) => {
  try {
    if (ENV.EMULATE_STREAMING) {
      return handler(c)
    } else {
      return handlerStreaming(c)
    }
  } catch (error) {
    if (error instanceof FetchError) {
      consola.error(`Request failed: ${error.message}`, error.response?._data)
    }
    consola.error(error)

    throw error
  }
})
