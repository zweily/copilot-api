import fs from "node:fs/promises"

import { configManager } from "~/lib/config"
import { PATHS } from "~/lib/paths"

export function initializeLogger() {
  const config = configManager.getConfig()
  if (!config.LOGGING_ENABLED) return

  return fs.mkdir(PATHS.LOG_PATH, { recursive: true })
}

export async function logToFile(type: string, message: string) {
  const config = configManager.getConfig()
  if (!config.LOGGING_ENABLED) return

  const timestamp = new Date().toISOString()
  await fs.appendFile(PATHS.LOG_FILE, `${timestamp} ${type}: ${message}\n`)
}
