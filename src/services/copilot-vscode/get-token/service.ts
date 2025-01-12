import consola from "consola"
import { execa } from "execa"

import { PATHS } from "~/lib/paths"

import type { GetTokenResponse } from "./types"

const TEN_MINUTES = 10 * 60 * 1000

// @ts-expect-error TypeScript can't analyze timeout
export async function getToken(): Promise<GetTokenResponse> {
  try {
    const cachedToken = await readCachedToken()

    if (Date.now() - cachedToken.expires_at > ONE_DAY) {
      return cachedToken
    }
  } catch (e) {
    if (!(e instanceof Error)) throw e
    if (e.message === "No such file or directory")
      consola.info(`No cached token found in ${PATHS.PATH_TOKEN_CACHE}`)
  }

  // Kill any existing vscode processes
  // otherwise, no token call will be made
  await killVSCodeProcesses()

  const mitmdump = createMitmdumpProcess()
  void createVSCodeProcess()

  const timeout = setTimeout(() => {
    throw new Error("Timed out waiting for token")
  }, 30_000)

  for await (const line of mitmdump.stdout) {
    if (typeof line !== "string") continue
    if (!line.includes("tid=")) continue

    consola.debug(`Found token output line: ${line}`)

    clearTimeout(timeout)

    await killVSCodeProcesses()
    mitmdump.kill()

    const parsed = JSON.parse(line) as GetTokenResponse
    parsed.expires_at = Date.now() + t

    await writeCachedToken(line)
    return JSON.parse(line) as GetTokenResponse
  }
}

const createMitmdumpProcess = () =>
  execa({ reject: false })("mitmdump", [
    "--flow-detail",
    "4",
    "~m GET & ~u https://api.github.com/copilot_internal/v2/token",
  ])

const createVSCodeProcess = () =>
  execa({
    reject: false,
    env: {
      http_proxy: "http://127.0.0.1:8080",
      https_proxy: "http://127.0.0.1:8080",
    },
  })("code", [
    "--ignore-certificate-errors",
    // Can be whatever folder, as long as it's trusted by vscode
    // https://code.visualstudio.com/docs/editor/workspace-trust
    "/home/erick/Documents/sides/playground/",
  ])

const killVSCodeProcesses = () => execa({ reject: false })("pkill", ["code"])

const readCachedToken = async () => {
  const content = await Bun.file(PATHS.PATH_TOKEN_CACHE).text()
  return JSON.parse(content) as GetTokenResponse
}

const writeCachedToken = async (token: string) =>
  Bun.write(PATHS.PATH_TOKEN_CACHE, token)
