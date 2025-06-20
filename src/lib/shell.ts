import { execSync } from "node:child_process"
import process from "node:process"

type ShellName = "bash" | "zsh" | "fish" | "powershell" | "cmd" | "sh"
type EnvVars = Record<string, string | undefined>

function getShell(): ShellName {
  const { platform, ppid, env } = process

  if (platform === "win32") {
    try {
      const command = `wmic process get ParentProcessId,Name | findstr "${ppid}"`
      const parentProcess = execSync(command, { stdio: "pipe" }).toString()

      if (parentProcess.toLowerCase().includes("powershell.exe")) {
        return "powershell"
      }
    } catch {
      return "cmd"
    }

    return "cmd"
  } else {
    const shellPath = env.SHELL
    if (shellPath) {
      if (shellPath.endsWith("zsh")) return "zsh"
      if (shellPath.endsWith("fish")) return "fish"
      if (shellPath.endsWith("bash")) return "bash"
    }

    return "sh"
  }
}

/**
 * Generates a copy-pasteable script to set multiple environment variables
 * and run a subsequent command.
 * @param {EnvVars} envVars - An object of environment variables to set.
 * @param {string} commandToRun - The command to run after setting the variables.
 * @returns {string} The formatted script string.
 */
// eslint-disable-next-line complexity
function generateEnvScript(
  envVars: EnvVars,
  commandToRun: string = "",
): string {
  const shell = getShell()
  const commands: Array<string> = []

  for (const [key, value] of Object.entries(envVars)) {
    if (value === undefined) {
      continue // Skip undefined values
    }

    // Best-effort quoting to handle spaces and special characters.
    // PowerShell and cmd handle quotes differently from Unix shells.
    let escapedValue: string
    if (shell === "cmd") {
      // CMD is tricky with quotes. Often it's safer without them if no spaces.
      escapedValue = value.includes(" ") ? `"${value}"` : value
    } else {
      // For PowerShell and Unix shells, wrapping in double quotes is generally safe.
      // We escape any internal double quotes for robustness.
      escapedValue = `"${value.replaceAll('"', String.raw`\"`)}"`
    }

    switch (shell) {
      case "powershell": {
        commands.push(`$env:${key} = ${escapedValue}`)
        break
      }
      case "cmd": {
        commands.push(`set ${key}=${escapedValue}`)
        break
      }
      case "fish": {
        // Fish prefers 'set -gx KEY VALUE' syntax.
        commands.push(`set -gx ${key} ${escapedValue}`)
        break
      }
      default: {
        commands.push(`export ${key}=${escapedValue}`)
        break
      }
    }
  }

  const intro = `# Paste the following into your terminal (${shell}) to set environment variables and run the command:\n`
  const finalCommand = commandToRun ? `\n${commandToRun}` : ""
  const commandBlock = commands.join("\n")

  if (shell === "cmd") {
    // For cmd, chaining is difficult. Presenting a block to copy is most reliable.
    const runInstruction =
      finalCommand ? `\n\n# Now, run the command:\n${commandToRun}` : ""
    return `${intro}${commandBlock}${runInstruction}`
  }

  return `${intro}${commandBlock}${finalCommand}`
}

// --- Example Usage ---

// 1. Define the environment variables and the final command.
const serverUrl = "http://localhost:1234/v1"
const selectedModel = "claude-3-opus-20240229"
const selectedSmallModel = "claude-3-haiku-20240307"

const envVariables: EnvVars = {
  ANTHROPIC_BASE_URL: serverUrl,
  ANTHROPIC_AUTH_TOKEN: "your-secret-token",
  ANTHROPIC_MODEL: selectedModel,
  ANTHROPIC_SMALL_FAST_MODEL: selectedSmallModel,
  // You can include undefined values; the function will safely skip them.
  OPTIONAL_SETTING: undefined,
}

const command = 'claude "What is the airspeed velocity of an unladen swallow?"'

// 2. Generate and print the script.
const scriptString = generateEnvScript(envVariables, command)
console.log(scriptString)
