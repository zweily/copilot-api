#!/usr/bin/env node

import { defineCommand, runMain } from "citty"
import consola from "consola"
import { serve, type ServerHandler } from "srvx"

import { logger } from "./lib/logger"
import { cacheModels } from "./lib/models"
import { ensurePaths } from "./lib/paths"
import { setupCopilotToken, setupGitHubToken } from "./lib/token"
import { server } from "./server"

interface RunServerOptions {
  port: number
  verbose: boolean
  logFile?: string
}

export async function runServer(options: RunServerOptions): Promise<void> {
  if (options.verbose) {
    consola.level = 5
    consola.info("Verbose logging enabled")
  }

  await logger.initialize(options.logFile)

  await ensurePaths()
  await setupGitHubToken()
  await setupCopilotToken()
  await cacheModels()

  const serverUrl = `http://localhost:${options.port}`
  consola.box(`Server started at ${serverUrl}`)

  serve({
    fetch: server.fetch as ServerHandler,
    port: options.port,
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
    const port = Number.parseInt(args.port, 10)

    return runServer({
      port,
      verbose: args.verbose,
      logFile: args["log-file"],
    })
  },
})

await runMain(main)
