#!/usr/bin/env node

import { serve, type ServerHandler } from "srvx"

import { getOptions } from "./lib/cli"
import { initializeApp } from "./lib/initialization"
import { server } from "./server"

const options = await getOptions()

const { port } = await initializeApp(options)

serve({
  fetch: server.fetch as ServerHandler,
  port,
})
