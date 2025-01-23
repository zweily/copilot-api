import os from "node:os"
import path from "pathe"

const APP_DIR = path.join(os.homedir(), ".local", "share", "copilot-api")

const GITHUB_TOKEN_PATH = path.join(APP_DIR, "github_token")
const LOG_PATH = path.join(APP_DIR, "logs")
const LOG_FILE = path.join(LOG_PATH, "app.log")

export const PATHS = {
  APP_DIR,
  GITHUB_TOKEN_PATH,
  LOG_PATH,
  LOG_FILE,
}
