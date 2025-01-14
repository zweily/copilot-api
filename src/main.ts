import type { Serve } from "bun"

import { parseCli } from "./lib/cli"
import { initialize } from "./lib/initialization"
import { server } from "./server"

const options = await parseCli()
await initialize()

export default {
  fetch: server.fetch,
  port: parseInt(options.port, 10),
} satisfies Serve
