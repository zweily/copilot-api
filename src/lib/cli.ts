import { defineCommand, parseArgs, showUsage, type ArgsDef } from "citty"

const args = {
  help: {
    alias: "h",
    type: "boolean",
    default: false,
    description: "Show this help message",
  },
  "emulate-streaming": {
    type: "boolean",
    default: false,
    description: "Emulate streaming response for chat completions",
  },
  port: {
    alias: "p",
    type: "string",
    default: "4141",
    description: "Port to listen on",
  },
} satisfies ArgsDef

export async function parseCli() {
  const command = defineCommand({
    args,
    meta: {
      name: "copilot-api",
      description:
        "A wrapper around GitHub Copilot API to make it OpenAI compatible, making it usable for other tools.",
    },
  })
  const options = parseArgs<typeof args>(Bun.argv, args)

  if (options.help) {
    await showUsage(command)
    process.exit()
  }

  return options
}
