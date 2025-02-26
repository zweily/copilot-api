import consola from "consola"
import { Hono } from "hono"
import { FetchError } from "ofetch"

import { handlerStreaming } from "./handler"

export const completionRoutes = new Hono()

completionRoutes.post("/", async (c) => {
  try {
    return await handlerStreaming(c)
  } catch (error) {
    if (error instanceof FetchError) {
      consola.error(`Request failed: ${error.message}`, error.response?._data)
    }
    if (error instanceof Response) {
      consola.error(
        `Request failed: ${error.status} ${error.statusText}: ${await error.text()}`,
      )
    } else if (error instanceof Error) {
      consola.error("Error:", error.message)
    } else {
      consola.error("Error:", error)
    }
  }
})
