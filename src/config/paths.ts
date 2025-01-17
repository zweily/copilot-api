import os from "node:os"
import path from "pathe"

const APP_DIR = path.join(os.homedir(), ".local", "share", "copilot-api")

const CACHE_PATH = path.join(APP_DIR, "cache.json")

export const PATHS = {
  APP_DIR,
  CACHE_PATH,
}
