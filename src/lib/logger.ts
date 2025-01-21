import fs from "node:fs"

import { CONFIG } from "~/config/config"
import { PATHS } from "~/config/paths"

export function initializeLogger() {
  if (!CONFIG.LOGGING_ENABLED) return

  fs.mkdirSync(PATHS.LOG_PATH, { recursive: true })
}

export function logToFile(type: string, message: string) {
  if (!CONFIG.LOGGING_ENABLED) return

  const timestamp = new Date().toISOString()
  fs.appendFileSync(PATHS.LOG_FILE, `${timestamp} ${type}: ${message}\n`)
}
