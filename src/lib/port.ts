import consola from "consola"
import { getPort } from "get-port-please"

export async function initializePort(requestedPort?: number): Promise<number> {
  const port = await getPort({
    name: "copilot-api",
    port: requestedPort,
    portRange: [4142, 4200],
    random: false,
  })

  if (port !== requestedPort) {
    consola.warn(
      `Default port ${requestedPort} is already in use. Using port ${port} instead.`,
    )
  }

  return port
}
