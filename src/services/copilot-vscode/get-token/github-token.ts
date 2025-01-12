import { execa } from "execa"

// @ts-expect-error TypeScript can't analyze timeout
export async function getGitHubToken(): Promise<string> {
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
    if (!line.includes("authorization: token")) continue

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const token = line
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .find((line) => line.includes("authorization: token"))!
      .split("authorization: token ")
      .at(1)!
      .trim()

    clearTimeout(timeout)

    await killVSCodeProcesses()
    mitmdump.kill()

    return token
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
