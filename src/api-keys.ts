import { defineCommand } from "citty"
import consola from "consola"

import { ApiKeyManager } from "./lib/api-auth"
import { ensurePaths } from "./lib/paths"

interface ManageKeysOptions {
  action: "list" | "add" | "remove" | "generate" | "enable" | "disable"
  key?: string
  verbose: boolean
}

export async function manageApiKeys(options: ManageKeysOptions): Promise<void> {
  if (options.verbose) {
    consola.level = 5
    consola.info("Verbose logging enabled")
  }

  await ensurePaths()
  const apiKeyManager = ApiKeyManager.getInstance()
  await apiKeyManager.loadKeysFromFile()

  switch (options.action) {
    case "list": {
      const keys = apiKeyManager.listKeys()
      if (keys.length === 0) {
        consola.info("No API keys configured")
      } else {
        consola.info(`Found ${keys.length} API key(s):`)
        for (const { masked } of keys) {
          consola.info(`  ${masked}`)
        }
      }
      consola.info(
        `Authentication: ${apiKeyManager.isEnabled() ? "enabled" : "disabled"}`,
      )
      break
    }

    case "add": {
      if (!options.key) {
        consola.error("Key is required for add action. Use --key <api-key>")
        process.exit(1)
      }
      await apiKeyManager.addKey(options.key)
      consola.success("API key added successfully")
      break
    }

    case "remove": {
      if (!options.key) {
        consola.error("Key is required for remove action. Use --key <api-key>")
        process.exit(1)
      }
      const removed = await apiKeyManager.removeKey(options.key)
      if (removed) {
        consola.success("API key removed successfully")
      } else {
        consola.error("API key not found")
      }
      break
    }

    case "generate": {
      const newKey = await apiKeyManager.generateAndAddKey()
      consola.success("New API key generated and added:")
      consola.info(`  ${newKey}`)
      consola.warn("⚠️  Save this key securely - it won't be shown again!")
      break
    }

    case "enable": {
      const keys = apiKeyManager.listKeys()
      if (keys.length === 0) {
        consola.error(
          "Cannot enable authentication: No API keys configured. Generate a key first.",
        )
        process.exit(1)
      }
      apiKeyManager.setConfig(
        keys.map((k) => k.key),
        true,
      )
      await apiKeyManager.saveKeysToFile()
      consola.success("API authentication enabled")
      break
    }

    case "disable": {
      const keys = apiKeyManager.listKeys()
      apiKeyManager.setConfig(
        keys.map((k) => k.key),
        false,
      )
      await apiKeyManager.saveKeysToFile()
      consola.success("API authentication disabled")
      break
    }

    default: {
      consola.error(`Unknown action: ${String(options.action)}`)
      process.exit(1)
    }
  }
}

export const apiKeys = defineCommand({
  meta: {
    name: "api-keys",
    description: "Manage API keys for server authentication",
  },
  args: {
    action: {
      type: "positional",
      description:
        "Action to perform (list|add|remove|generate|enable|disable)",
      required: true,
    },
    key: {
      alias: "k",
      type: "string",
      description: "API key (required for add/remove actions)",
    },
    verbose: {
      alias: "v",
      type: "boolean",
      default: false,
      description: "Enable verbose logging",
    },
  },
  run({ args }) {
    return manageApiKeys({
      action: args.action as ManageKeysOptions["action"],
      key: args.key,
      verbose: args.verbose,
    })
  },
})
