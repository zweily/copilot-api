import type { Serve } from "bun"

import { initialize } from "./lib/initialization"
import { server } from "./server"

// Initialize the application
await initialize()

export default {
  fetch: server.fetch,
  port: 4141,
} satisfies Serve
