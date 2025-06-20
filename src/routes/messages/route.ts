import { Hono } from "hono"

import { forwardError } from "~/lib/forward-error"

import { handleCompletion } from "./handler"

export const completionRoutes = new Hono()

completionRoutes.post("/", async (c) => {
  try {
    await handleCompletion(c)
    return
  } catch (error) {
    return await forwardError(c, error)
  }
})
