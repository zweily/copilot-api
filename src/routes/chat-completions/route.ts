import consola from "consola"
import { Hono } from "hono"

import { handleCompletion } from "./handler"

export const completionRoutes = new Hono()

completionRoutes.post("/", async (c) => {
  try {
    return await handleCompletion(c)
  } catch (error) {
    consola.error("Error occurred:", error)

    if (error instanceof Response) {
      return c.json(
        {
          error: {
            message: error.message,
            type: "error",
          },
        },
        500,
      )
    }

    return c.json(
      {
        error: {
          message: error.message,
          type: "error",
        },
      },
      500,
    )
  }
})
