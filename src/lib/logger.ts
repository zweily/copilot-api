import fs from "node:fs/promises"

import { APP_CONFIG } from "~/lib/config"
import { PATHS } from "~/lib/paths"

export function initializeLogger() {
  if (!APP_CONFIG.LOGGING_ENABLED) return

  return fs.mkdir(PATHS.LOG_PATH, { recursive: true })
}

export async function logToFile(type: string, message: string) {
  if (!APP_CONFIG.LOGGING_ENABLED) return

  const timestamp = new Date().toISOString()
  await fs.appendFile(PATHS.LOG_FILE, `${timestamp} ${type}: ${message}\n`)
}
