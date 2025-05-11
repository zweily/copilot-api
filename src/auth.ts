#!/usr/bin/env node

import { defineCommand } from "citty"
import consola from "consola"

import { ensurePaths, PATHS } from "./lib/paths"
import { state } from "./lib/state"
import { setupGitHubToken } from "./lib/token"
import { cacheVSCodeVersion } from "./lib/vscode-version"

interface RunAuthOptions {
  verbose: boolean
  business: boolean
}

export async function runAuth(options: RunAuthOptions): Promise<void> {
  if (options.verbose) {
    consola.level = 5
    consola.info("Verbose logging enabled")
  }

  if (options.business) {
    state.accountType = "business"
    consola.info("Using business plan GitHub account")
  }

  await ensurePaths()
  await cacheVSCodeVersion()

  await setupGitHubToken({ force: true })
  consola.success("GitHub token written to", PATHS.GITHUB_TOKEN_PATH)
}

export const auth = defineCommand({
  meta: {
    name: "auth",
    description: "Run GitHub auth flow without running the server",
  },
  args: {
    verbose: {
      alias: "v",
      type: "boolean",
      default: false,
      description: "Enable verbose logging",
    },
    business: {
      type: "boolean",
      default: false,
      description: "Use a business plan GitHub Account",
    },
  },
  run({ args }) {
    return runAuth({
      verbose: args.verbose,
      business: args.business,
    })
  },
})
