import fs from "node:fs/promises"

import { CONFIG } from "~/config/config"
import { PATHS } from "~/config/paths"

export function initializeLogger() {
  if (!CONFIG.LOGGING_ENABLED) return

  return fs.mkdir(PATHS.LOG_PATH, { recursive: true })
}

export async function logToFile(type: string, message: string) {
  if (!CONFIG.LOGGING_ENABLED) return

  const timestamp = new Date().toISOString()
  await fs.appendFile(PATHS.LOG_FILE, `${timestamp} ${type}: ${message}\n`)
}
