import { serve, type ServerHandler } from "srvx"

import { parseCli } from "./lib/cli"
import { initializeApp } from "./lib/initialization"
import { server } from "./server"

const options = await parseCli()

const { port } = await initializeApp(options)

serve({
  fetch: server.fetch as ServerHandler,
  port,
})
