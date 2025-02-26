import consola from "consola"
import { getPort } from "get-port-please"

import { configManager } from "./config"

export async function initializePort(requestedPort?: number): Promise<number> {
  const config = configManager.getConfig()

  const port = await getPort({
    name: "copilot-api",
    port: requestedPort ?? config.PORT,
    portRange: config.PORT_RANGE,
    random: false,
  })

  if (port !== requestedPort) {
    consola.warn(
      `Default port ${requestedPort} is already in use. Using port ${port} instead.`,
    )
  }

  configManager.setConfig({ PORT: port })

  return port
}
