#!/usr/bin/env node

import { defineCommand } from "citty"
import clipboard from "clipboardy"
import consola from "consola"
import { serve, type ServerHandler } from "srvx"
import invariant from "tiny-invariant"

import { ensurePaths } from "./lib/paths"
import {
  ProxyManager,
  getProxyFromEnv,
  parseProxyUrl,
} from "./lib/proxy-config"
import {
  generateEnvScript,
  generateAllPlatformCommands,
  getDetectedShell,
} from "./lib/shell"
import { state } from "./lib/state"
import { setupCopilotToken, setupGitHubToken } from "./lib/token"
import { cacheModels, cacheVSCodeVersion } from "./lib/utils"
import { server } from "./server"

interface RunServerOptions {
  port: number
  verbose: boolean
  accountType: string
  manual: boolean
  rateLimit?: number
  rateLimitWait: boolean
  githubToken?: string
  claudeCode: boolean
  showToken: boolean
  proxyUrl?: string
  proxyType?: string
  apiKeys?: Array<string>
  disableAuth: boolean
}

/**
 * Handle Claude Code integration setup
 */
async function handleClaudeCodeSetup(serverUrl: string): Promise<void> {
  invariant(state.models, "Models should be loaded by now")

  const selectedModel = await consola.prompt(
    "Select a model to use with Claude Code",
    {
      type: "select",
      options: state.models.data.map((model) => model.id),
    },
  )

  const selectedSmallModel = await consola.prompt(
    "Select a small model to use with Claude Code",
    {
      type: "select",
      options: state.models.data.map((model) => model.id),
    },
  )

  // Check if API authentication is enabled
  const { ApiKeyManager } = await import("./lib/api-auth")
  const apiKeyManager = ApiKeyManager.getInstance()

  let authToken = "dummy"

  if (apiKeyManager.isEnabled()) {
    const availableKeys = apiKeyManager.listKeys()
    if (availableKeys.length > 0) {
      // Use the first available API key
      authToken = availableKeys[0].key
      consola.info("ℹ️  Using API key authentication for Claude Code")
    } else {
      consola.warn(
        "⚠️  Authentication is enabled but no API keys found. Using dummy token.",
      )
      consola.warn("   Generate an API key with: copilot-api api-keys generate")
    }
  } else {
    consola.info("ℹ️  API authentication is disabled - using dummy token")
  }

  const envVars = {
    ANTHROPIC_BASE_URL: serverUrl,
    ANTHROPIC_AUTH_TOKEN: authToken,
    ANTHROPIC_MODEL: selectedModel,
    ANTHROPIC_SMALL_FAST_MODEL: selectedSmallModel,
  }

  const detectedShell = getDetectedShell()
  const primaryCommand = generateEnvScript(envVars, "claude")
  const allCommands = generateAllPlatformCommands(envVars, "claude")

  try {
    clipboard.writeSync(primaryCommand)
    consola.success(
      `Copied Claude Code command to clipboard! (Detected: ${detectedShell})`,
    )
  } catch {
    consola.warn(
      "Failed to copy to clipboard. Here are the Claude Code commands:",
    )
  }

  // Show authentication status in the box
  const authStatus =
    apiKeyManager.isEnabled() ?
      "🔐 Authentication: Enabled (API key included)"
    : "🔓 Authentication: Disabled (dummy token)"

  // Always show the commands for all platforms
  consola.box(
    [
      `🚀 Claude Code Commands (Detected: ${detectedShell})`,
      authStatus,
      "",
      "📋 PowerShell:",
      allCommands.PowerShell,
      "",
      "📋 Command Prompt:",
      allCommands["Command Prompt"],
      "",
      "📋 Bash/Zsh (Linux/Mac):",
      allCommands["Bash/Zsh"],
      "",
      "📋 Fish Shell:",
      allCommands.Fish,
    ].join("\n"),
  )
}

export async function runServer(options: RunServerOptions): Promise<void> {
  if (options.verbose) {
    consola.level = 5
    consola.info("Verbose logging enabled")
  }

  await ensurePaths()

  state.accountType = options.accountType
  if (options.accountType !== "individual") {
    consola.info(`Using ${options.accountType} plan GitHub account`)
  }

  state.manualApprove = options.manual
  state.rateLimitSeconds = options.rateLimit
  state.rateLimitWait = options.rateLimitWait
  state.showToken = options.showToken

  // Setup API key authentication
  const { ApiKeyManager } = await import("./lib/api-auth")
  const apiKeyManager = ApiKeyManager.getInstance()

  await apiKeyManager.loadKeysFromFile()

  if (options.disableAuth) {
    apiKeyManager.setConfig([], false)
    consola.warn(
      "⚠️  API authentication disabled - server is open to all requests!",
    )
  } else if (options.apiKeys && options.apiKeys.length > 0) {
    apiKeyManager.setConfig(options.apiKeys, true)
  } else {
    // Try to use existing keys from file
    const existingKeys = apiKeyManager.listKeys()
    if (existingKeys.length === 0) {
      consola.warn(
        "⚠️  No API keys configured. Run 'copilot-api api-keys generate' to create one, or use --disable-auth for local development",
      )
      apiKeyManager.setConfig([], false)
    }
  }

  // Setup proxy configuration
  const proxyManager = ProxyManager.getInstance()

  if (options.proxyUrl) {
    try {
      const proxyConfig = parseProxyUrl(options.proxyUrl)
      proxyManager.setConfig(proxyConfig)
      consola.info(
        `Using ${proxyConfig.type?.toUpperCase()} proxy: ${proxyConfig.host}:${proxyConfig.port}`,
      )
    } catch (error) {
      consola.error(
        "Invalid proxy URL:",
        error instanceof Error ? error.message : String(error),
      )
      process.exit(1)
    }
  } else {
    // Try to get proxy from environment variables
    const envProxy = getProxyFromEnv()
    if (envProxy) {
      proxyManager.setConfig(envProxy)
      consola.info(
        `Using ${envProxy.type?.toUpperCase()} proxy from environment: ${envProxy.host}:${envProxy.port}`,
      )
    }
  }

  await ensurePaths()
  await cacheVSCodeVersion()

  if (options.githubToken) {
    state.githubToken = options.githubToken
    consola.info("Using provided GitHub token")
  } else {
    await setupGitHubToken()
  }

  await setupCopilotToken()
  await cacheModels()

  consola.info(
    `Available models: \n${state.models?.data.map((model) => `- ${model.id}`).join("\n")}`,
  )

  const serverUrl = `http://localhost:${options.port}`

  if (options.claudeCode) {
    await handleClaudeCodeSetup(serverUrl)
  }

  consola.box(
    `🌐 Usage Viewer: https://ericc-ch.github.io/copilot-api?endpoint=${serverUrl}/usage`,
  )

  serve({
    fetch: server.fetch as ServerHandler,
    port: options.port,
  })
}

export const start = defineCommand({
  meta: {
    name: "start",
    description: "Start the Copilot API server",
  },
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
    "account-type": {
      alias: "a",
      type: "string",
      default: "individual",
      description: "Account type to use (individual, business, enterprise)",
    },
    manual: {
      type: "boolean",
      default: false,
      description: "Enable manual request approval",
    },
    "rate-limit": {
      alias: "r",
      type: "string",
      description: "Rate limit in seconds between requests",
    },
    wait: {
      alias: "w",
      type: "boolean",
      default: false,
      description:
        "Wait instead of error when rate limit is hit. Has no effect if rate limit is not set",
    },
    "github-token": {
      alias: "g",
      type: "string",
      description:
        "Provide GitHub token directly (must be generated using the `auth` subcommand)",
    },
    "claude-code": {
      alias: "c",
      type: "boolean",
      default: false,
      description:
        "Generate a command to launch Claude Code with Copilot API config",
    },
    "show-token": {
      type: "boolean",
      default: false,
      description: "Show GitHub and Copilot tokens on fetch and refresh",
    },
    "proxy-url": {
      type: "string",
      description: "Proxy URL (supports http:// and socks5:// protocols)",
    },
    "api-keys": {
      type: "string",
      description:
        "Comma-separated list of API keys (alternative to file-based keys)",
    },
    "disable-auth": {
      type: "boolean",
      default: false,
      description: "Disable API key authentication (for local development)",
    },
  },
  run({ args }) {
    const rateLimitRaw = args["rate-limit"]
    const rateLimit =
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      rateLimitRaw === undefined ? undefined : Number.parseInt(rateLimitRaw, 10)

    return runServer({
      port: Number.parseInt(args.port, 10),
      verbose: args.verbose,
      accountType: args["account-type"],
      manual: args.manual,
      rateLimit,
      rateLimitWait: args.wait,
      githubToken: args["github-token"],
      claudeCode: args["claude-code"],
      showToken: args["show-token"],
      proxyUrl: args["proxy-url"],
      apiKeys:
        args["api-keys"] ?
          args["api-keys"].split(",").map((k) => k.trim())
        : undefined,
      disableAuth: args["disable-auth"],
    })
  },
})
