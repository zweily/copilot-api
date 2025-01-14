import type { Serve } from "bun"

import { ENV } from "./config/env"
import { parseCli } from "./lib/cli"
import { initialize } from "./lib/initialization"
import { server } from "./server"

const options = await parseCli()
ENV.ENABLE_STREAMING = options.stream

await initialize()

export default {
  fetch: server.fetch,
  port: parseInt(options.port, 10),
} satisfies Serve
