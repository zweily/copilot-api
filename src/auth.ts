#!/usr/bin/env node

import { defineCommand } from "citty";
import consola from "consola";

import { PATHS, ensurePaths } from "./lib/paths";
import {
  ProxyManager,
  getProxyFromEnv,
  parseProxyUrl,
} from "./lib/proxy-config";
import { state } from "./lib/state";
import { setupGitHubToken } from "./lib/token";

interface RunAuthOptions {
  verbose: boolean;
  showToken: boolean;
  proxyUrl?: string;
}

export async function runAuth(options: RunAuthOptions): Promise<void> {
  if (options.verbose) {
    consola.level = 5;
    consola.info("Verbose logging enabled");
  }

  state.showToken = options.showToken;

  // Setup proxy configuration
  const proxyManager = ProxyManager.getInstance();

  if (options.proxyUrl) {
    try {
      const proxyConfig = parseProxyUrl(options.proxyUrl);
      proxyManager.setConfig(proxyConfig);
      consola.info(
        `Using ${proxyConfig.type?.toUpperCase()} proxy: ${proxyConfig.host}:${proxyConfig.port}`,
      );
    } catch (error) {
      consola.error("Invalid proxy URL:", error.message);
      process.exit(1);
    }
  } else {
    // Try to get proxy from environment variables
    const envProxy = getProxyFromEnv();
    if (envProxy) {
      proxyManager.setConfig(envProxy);
      consola.info(
        `Using ${envProxy.type?.toUpperCase()} proxy from environment: ${envProxy.host}:${envProxy.port}`,
      );
    }
  }

  await ensurePaths();
  await setupGitHubToken({ force: true });
  consola.success("GitHub token written to", PATHS.GITHUB_TOKEN_PATH);
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
    "show-token": {
      type: "boolean",
      default: false,
      description: "Show GitHub token on auth",
    },
    "proxy-url": {
      type: "string",
      description: "Proxy URL (supports http:// and socks5:// protocols)",
    },
  },
  run({ args }) {
    return runAuth({
      verbose: args.verbose,
      showToken: args["show-token"],
      proxyUrl: args["proxy-url"],
    });
  },
});
