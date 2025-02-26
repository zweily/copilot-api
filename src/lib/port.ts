import { getPort } from "get-port-please"

import { configManager } from "./config"

export async function initializePort(): Promise<number> {
  const config = configManager.getConfig()

  const port = await getPort({
    name: "copilot-api",
    port: config.PORT,
    portRange: config.PORT_RANGE,
    random: false,
  })

  configManager.setConfig({ PORT: port })

  return port
}
