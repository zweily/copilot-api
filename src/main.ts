import type { Serve } from "bun"

import { parseCli } from "./lib/cli"
import { initializeApp } from "./lib/initialization"
import { server } from "./server"

const options = await parseCli()

const { port } = await initializeApp(options)

export default {
  fetch: server.fetch,
  port,
} satisfies Serve
