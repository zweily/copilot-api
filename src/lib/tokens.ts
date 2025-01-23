import fs from "node:fs/promises"

import { PATHS } from "./paths"

interface Tokens {
  GITHUB_TOKEN: string | undefined
  COPILOT_TOKEN: string | undefined
}

export const TOKENS: Tokens = {
  GITHUB_TOKEN: undefined,
  COPILOT_TOKEN: undefined,
}

export async function saveGithubToken(token: string) {
  await fs.writeFile(PATHS.GITHUB_TOKEN_PATH, token)
}

export async function getGithubToken(): Promise<string> {
  return fs.readFile(PATHS.GITHUB_TOKEN_PATH, "utf-8")
}
