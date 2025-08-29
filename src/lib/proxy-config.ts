import { ProxyAgent } from "proxy-agent";

export interface ProxyConfig {
  type?: "http" | "socks5";
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  url?: string;
}

export class ProxyManager {
  private static instance: ProxyManager;
  private config: ProxyConfig | null = null;

  private constructor() {}

  public static getInstance(): ProxyManager {
    if (!ProxyManager.instance) {
      ProxyManager.instance = new ProxyManager();
    }
    return ProxyManager.instance;
  }

  public setConfig(config: ProxyConfig | null): void {
    this.config = config;

    // Configure global agents for Node.js
    if (config) {
      this.setupGlobalProxy();
    }
  }

  public getConfig(): ProxyConfig | null {
    return this.config;
  }

  public createAgent(): any {
    if (!this.config) {
      return undefined;
    }

    // Use proxy-agent which supports multiple proxy types including SOCKS5
    const proxyUrl = this.config.url || this.buildProxyUrl();
    return new ProxyAgent(proxyUrl);
  }

  private setupGlobalProxy(): void {
    if (!this.config) return;

    // Set environment variables that Node.js will automatically pick up
    const proxyUrl = this.config.url || this.buildProxyUrl();

    if (this.config.type === "socks5") {
      process.env.HTTPS_PROXY = proxyUrl;
      process.env.HTTP_PROXY = proxyUrl;
    } else {
      process.env.HTTPS_PROXY = proxyUrl;
      process.env.HTTP_PROXY = proxyUrl;
    }

    // Also set the global agent for older Node.js modules
    try {
      const http = require("node:http");
      const https = require("node:https");
      const agent = this.createAgent();

      if (agent) {
        https.globalAgent = agent;
        http.globalAgent = agent;
      }
    } catch (error) {
      console.debug("Could not set global agents:", error);
    }
  }

  private buildProxyUrl(): string {
    if (!this.config || !this.config.host || !this.config.port) {
      throw new Error("Invalid proxy configuration");
    }

    const protocol = this.config.type || "http";
    const auth =
      this.config.username && this.config.password
        ? `${this.config.username}:${this.config.password}@`
        : "";

    return `${protocol}://${auth}${this.config.host}:${this.config.port}`;
  }

  public isConfigured(): boolean {
    return this.config !== null;
  }
}

// Utility function to parse proxy URL
export function parseProxyUrl(url: string): ProxyConfig {
  try {
    const parsed = new URL(url);

    return {
      type: parsed.protocol.replace(":", "") as "http" | "socks5",
      host: parsed.hostname,
      port: parsed.port ? Number.parseInt(parsed.port) : undefined,
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      url: url,
    };
  } catch {
    throw new Error(`Invalid proxy URL: ${url}`);
  }
}

// Environment variable parsing
export function getProxyFromEnv(): ProxyConfig | null {
  // Check for SOCKS5 proxy first
  const socks5Proxy = process.env.SOCKS5_PROXY || process.env.socks5_proxy;
  if (socks5Proxy) {
    return parseProxyUrl(socks5Proxy);
  }

  // Check for HTTP proxy
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  if (httpProxy) {
    return parseProxyUrl(httpProxy);
  }

  // Check for HTTPS proxy
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (httpsProxy) {
    return parseProxyUrl(httpsProxy);
  }

  return null;
}
