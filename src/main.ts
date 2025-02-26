#!/usr/bin/env node

import { defineCommand, runMain } from "citty"
import consola from "consola"
import { serve, type ServerHandler } from "srvx"

import { initializeApp } from "./lib/initialization"
import { logger } from "./lib/logger"
import { initializePort } from "./lib/port"
import { server } from "./server"

const main = defineCommand({
  args: {
    port: {
      alias: "p",
      type: "string",
      default: "4141",
      description: "Port to listen on",
    },
    verbose: {
      alias: "v",
      type: "boolean",
      default: false,
      description: "Enable verbose logging",
    },
    "log-file": {
      type: "string",
      description: "File to log request/response details",
    },
  },
  async run({ args }) {
    if (args.verbose) {
      consola.level = 5
      consola.info("Verbose logging enabled")
    }

    const portInt = parseInt(args.port, 10)

    const port = await initializePort(portInt)
    await logger.initialize(args["log-file"])

    await initializeApp()

    const serverUrl = `http://localhost:${port}`
    consola.box(`Server started at ${serverUrl}`)

    serve({
      fetch: server.fetch as ServerHandler,
      port,
    })
  },
})

await runMain(main)
