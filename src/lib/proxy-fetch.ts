import fetch from "node-fetch"

import { ProxyManager } from "./proxy-config"

/**
 * Custom fetch function that supports SOCKS5 and HTTP proxies
 */
export async function proxyFetch(
  url: string | Request,
  options: RequestInit = {},
): Promise<Response> {
  const proxyManager = ProxyManager.getInstance()

  if (proxyManager.isConfigured()) {
    const agent = proxyManager.createAgent()
    // Use node-fetch with the proxy agent
    const urlString = typeof url === "string" ? url : url.url
    return fetch(urlString, { ...options, agent }) as Promise<Response>
  }

  // Use node-fetch without agent for no proxy
  const urlString = typeof url === "string" ? url : url.url
  return fetch(urlString, options) as Promise<Response>
}

/**
 * Wrapper for fetch that automatically applies proxy settings
 * This can be used as a drop-in replacement for fetch
 */
export { proxyFetch as fetch }
