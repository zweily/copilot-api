import os from "node:os"
import path from "pathe"

const APP_DIR = path.join(os.homedir(), ".local", "share", "copilot-api")

const CACHE_PATH = path.join(APP_DIR, "cache.json")
const LOG_PATH = path.join(APP_DIR, "logs")
const LOG_FILE = path.join(LOG_PATH, "app.log")

export const PATHS = {
  APP_DIR,
  CACHE_PATH,
  LOG_PATH,
  LOG_FILE,
}
