import { PATHS } from "./paths"

export async function saveGithubToken(token: string) {
  await Bun.write(PATHS.GITHUB_TOKEN_PATH, token)
}

export async function getGithubToken(): Promise<string> {
  return Bun.file(PATHS.GITHUB_TOKEN_PATH).text()
}
