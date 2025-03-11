#!/usr/bin/env node

import { defineCommand, runMain } from "citty"
import consola from "consola"
import { serve, type ServerHandler } from "srvx"

import { cacheModels } from "./lib/models"
import { ensurePaths } from "./lib/paths"
import { setupCopilotToken, setupGitHubToken } from "./lib/token"
import { cacheVSCodeVersion } from "./lib/vscode-version"
import { server } from "./server"

interface RunServerOptions {
  port: number
  verbose: boolean
}

export async function runServer(options: RunServerOptions): Promise<void> {
  if (options.verbose) {
    consola.level = 5
    consola.info("Verbose logging enabled")
  }

  await ensurePaths()
  await cacheVSCodeVersion()
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
  },
  run({ args }) {
    const port = Number.parseInt(args.port, 10)

    return runServer({
      port,
      verbose: args.verbose,
    })
  },
})

await runMain(main)
