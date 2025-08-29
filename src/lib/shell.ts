import { execSync } from "node:child_process"
import process from "node:process"

type ShellName = "bash" | "zsh" | "fish" | "powershell" | "cmd" | "sh"
type EnvVars = Record<string, string | undefined>

function getShell(): ShellName {
  const { platform, ppid, env } = process

  if (platform === "win32") {
    // Check for PowerShell by looking at parent process and SHELL environment variable
    try {
      // Check if we're in PowerShell based on environment variables
      if (env.PSModulePath || env.POWERSHELL_DISTRIBUTION_CHANNEL) {
        return "powershell"
      }

      // Fallback to checking parent process
      const command = `wmic process get ParentProcessId,Name | findstr "${ppid}"`
      const parentProcess = execSync(command, { stdio: "pipe" }).toString()

      if (
        parentProcess.toLowerCase().includes("powershell.exe")
        || parentProcess.toLowerCase().includes("pwsh.exe")
      ) {
        return "powershell"
      }
    } catch {
      // If detection fails, default to cmd
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
 * Properly quotes a value for shell usage
 */
function quoteValue(value: string, shell: ShellName): string {
  if (shell === "powershell") {
    // Use double quotes and escape inner quotes
    return `"${value.replaceAll('"', '`"')}"`
  }

  if (shell === "cmd") {
    // CMD doesn't need quotes for most values, but wrap in quotes if contains spaces
    return value.includes(" ") ? `"${value}"` : value
  }

  // All POSIX-compatible shells (fish, bash, zsh, sh) use single quotes with escaping
  return `'${value.replaceAll("'", String.raw`'\''`)}'`
}

/**
 * Generates a copy-pasteable script to set multiple environment variables
 * and run a subsequent command.
 * @param {EnvVars} envVars - An object of environment variables to set.
 * @param {string} commandToRun - The command to run after setting the variables.
 * @returns {string} The formatted script string.
 */
export function generateEnvScript(
  envVars: EnvVars,
  commandToRun: string = "",
): string {
  const shell = getShell()
  const filteredEnvVars = Object.entries(envVars).filter(
    ([, value]) => value !== undefined,
  ) as Array<[string, string]>

  let commandBlock: string

  switch (shell) {
    case "powershell": {
      commandBlock = filteredEnvVars
        .map(([key, value]) => `$env:${key} = ${quoteValue(value, shell)}`)
        .join("; ")
      break
    }
    case "cmd": {
      commandBlock = filteredEnvVars
        .map(([key, value]) => `set ${key}=${quoteValue(value, shell)}`)
        .join(" & ")
      break
    }
    case "fish": {
      commandBlock = filteredEnvVars
        .map(([key, value]) => `set -gx ${key} ${quoteValue(value, shell)}`)
        .join("; ")
      break
    }
    default: {
      // bash, zsh, sh - use individual export statements for better readability
      commandBlock = filteredEnvVars
        .map(([key, value]) => `export ${key}=${quoteValue(value, shell)}`)
        .join("; ")
      break
    }
  }

  if (commandBlock && commandToRun) {
    const separator = shell === "cmd" ? " & " : "; "
    return `${commandBlock}${separator}${commandToRun}`
  }

  return commandBlock || commandToRun
}

/**
 * Generates commands for all supported platforms for reference
 */
export function generateAllPlatformCommands(
  envVars: EnvVars,
  commandToRun: string = "",
): Record<string, string> {
  const filteredEnvVars = Object.entries(envVars).filter(
    ([, value]) => value !== undefined,
  ) as Array<[string, string]>

  const commands: Record<string, string> = {}

  // PowerShell
  const powershellBlock = filteredEnvVars
    .map(([key, value]) => `$env:${key} = ${quoteValue(value, "powershell")}`)
    .join("; ")
  commands.PowerShell =
    powershellBlock + (commandToRun ? `; ${commandToRun}` : "")

  // Command Prompt
  const cmdBlock = filteredEnvVars
    .map(([key, value]) => `set ${key}=${quoteValue(value, "cmd")}`)
    .join(" & ")
  commands["Command Prompt"] =
    cmdBlock + (commandToRun ? ` & ${commandToRun}` : "")

  // Bash/Zsh
  const bashBlock = filteredEnvVars
    .map(([key, value]) => `export ${key}=${quoteValue(value, "bash")}`)
    .join("; ")
  commands["Bash/Zsh"] = bashBlock + (commandToRun ? `; ${commandToRun}` : "")

  // Fish
  const fishBlock = filteredEnvVars
    .map(([key, value]) => `set -gx ${key} ${quoteValue(value, "fish")}`)
    .join("; ")
  commands.Fish = fishBlock + (commandToRun ? `; ${commandToRun}` : "")

  return commands
}

/**
 * Gets the detected shell name for display purposes
 */
export function getDetectedShell(): string {
  const shell = getShell()
  const shellNames: Record<ShellName, string> = {
    powershell: "PowerShell",
    cmd: "Command Prompt",
    bash: "Bash",
    zsh: "Zsh",
    fish: "Fish",
    sh: "Shell",
  }
  return shellNames[shell] || "Unknown"
}
