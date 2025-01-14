import type { Serve } from "bun"

import { defineCommand, parseArgs, showUsage, type ArgsDef } from "citty"

import { initialize } from "./lib/initialization"
import { server } from "./server"

const args: ArgsDef = {
  help: {
    alias: "h",
    type: "boolean",
    default: false,
    description: "Show this help message",
  },
  stream: {
    alias: "s",
    type: "boolean",
    default: false,
    description: "Enable streaming response for chat completions",
  },
  port: {
    alias: "p",
    type: "string",
    default: "4141",
    description: "Port to listen on",
  },
}

const command = defineCommand({ args })
const options = parseArgs(Bun.argv, args)

if (options.help) {
  await showUsage(command)
  process.exit()
}

await initialize()

export default {
  fetch: server.fetch,
  port: parseInt(options.port as string),
} satisfies Serve
