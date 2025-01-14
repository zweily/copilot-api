import { defineCommand, parseArgs, showUsage, type ArgsDef } from "citty"

const args = {
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
} satisfies ArgsDef

export interface CliOptions {
  help: boolean
  stream: boolean
  port: string
}

export async function parseCli() {
  const command = defineCommand({ args })
  const options = parseArgs<typeof args>(Bun.argv, args)

  if (options.help) {
    await showUsage(command)
    process.exit()
  }

  return options
}
