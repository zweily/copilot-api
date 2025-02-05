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
  logs: {
    type: "boolean",
    default: false,
    description:
      "Write logs to the app directory. Only works with emulate-streaming",
  },
} satisfies ArgsDef

export async function getOptions() {
  const command = defineCommand({
    args,
    meta: {
      name: "copilot-api",
      description:
        "A wrapper around GitHub Copilot API to make it OpenAI compatible, making it usable for other tools.",
    },
  })
  const options = parseArgs<typeof args>(process.argv, args)

  if (options.help) {
    await showUsage(command)
    process.exit()
  }

  return options
}
