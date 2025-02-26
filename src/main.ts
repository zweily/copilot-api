#!/usr/bin/env node

import { defineCommand, runMain } from "citty"
import consola from "consola"
import { serve, type ServerHandler } from "srvx"

import { initializeApp } from "./lib/initialization"
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
  },
  async run({ args }) {
    const portInt = parseInt(args.port, 10)

    const port = await initializePort(portInt)

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
