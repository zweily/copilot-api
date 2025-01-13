import os from "node:os"
import path from "pathe"

const DIR_CACHE = path.join(os.homedir(), ".cache", "copilot-api")

const PATH_CACHE_FILE = path.join(DIR_CACHE, "cache.json")

export const PATHS = {
  DIR_CACHE,
  PATH_CACHE_FILE,
}
