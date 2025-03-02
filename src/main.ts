#!/usr/bin/env node

import { defineCommand, runMain } from "citty"
import consola from "consola"
import { serve, type ServerHandler } from "srvx"

import { initializeApp } from "./lib/initialization"
import { logger } from "./lib/logger"
import { initializePort } from "./lib/port"
import { server } from "./server"

async function runServer(options: {
  port: number
  verbose: boolean
  logFile?: string
}) {
  if (options.verbose) {
    consola.level = 5
    consola.info("Verbose logging enabled")
  }

  const port = await initializePort(options.port)
  await logger.initialize(options.logFile)

  await initializeApp()

  const serverUrl = `http://localhost:${port}`
  consola.box(`Server started at ${serverUrl}`)

  serve({
    fetch: server.fetch as ServerHandler,
    port,
  })
}

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
  run({ args }) {
    const port = parseInt(args.port, 10)

    return runServer({
      port,
      verbose: args.verbose,
      logFile: args["log-file"],
    })
  },
})

await runMain(main)
