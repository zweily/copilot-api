import os from "node:os"
import path from "pathe"

const DIR_CACHE = path.join(os.homedir(), ".cache", "copilot-api")

const PATH_TOKEN_CACHE = path.join(DIR_CACHE, "token")

export const PATHS = {
  DIR_CACHE,
  PATH_TOKEN_CACHE,
}
