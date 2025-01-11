import { Context, Layer } from "effect"

import { createThread } from "./create-thread/create-thread"

export class Copilot extends Context.Tag("Copilot")<
  Copilot,
  {
    readonly createThread: typeof createThread
  }
>() {}

export const CopilotLive = Layer.succeed(
  Copilot,
  Copilot.of({
    createThread,
  }),
)
