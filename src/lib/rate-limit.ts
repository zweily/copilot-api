import consola from "consola"

import type { State } from "./state"

import { HTTPError } from "./http-error"

export function checkRateLimit(state: State) {
  if (state.rateLimitSeconds === undefined) return

  const now = Date.now()

  if (!state.lastRequestTimestamp) {
    state.lastRequestTimestamp = now
    return
  }

  const elapsedSeconds = (now - state.lastRequestTimestamp) / 1000

  if (elapsedSeconds > state.rateLimitSeconds) {
    state.lastRequestTimestamp = now
    return
  }

  const waitTimeSeconds = Math.round(state.rateLimitSeconds - elapsedSeconds)
  consola.warn(
    `Rate limit exceeded. Need to wait ${waitTimeSeconds} more seconds.`,
  )

  throw new HTTPError("Rate limit exceeded", Response.json({ status: 429 }))
}
