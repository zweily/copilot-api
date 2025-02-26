import consola from "consola"
import fs from "node:fs/promises"
import path from "pathe"

export interface LoggerOptions {
  enabled: boolean
  filePath?: string
}

export const logger = {
  options: {
    enabled: false,
    filePath: undefined,
  } as LoggerOptions,

  async initialize(filePath?: string): Promise<void> {
    if (!filePath) {
      this.options.enabled = false
      return
    }

    try {
      // Ensure the directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true })

      // Initialize the log file with a header
      const timestamp = new Date().toISOString()
      await fs.writeFile(
        filePath,
        `# API Request/Response Log\n# Started: ${timestamp}\n\n`,
        { flag: "w" },
      )

      this.options.enabled = true
      this.options.filePath = filePath
      consola.info(`Logging enabled to: ${filePath}`)
    } catch (error) {
      consola.error(`Failed to initialize log file`, error)
      this.options.enabled = false
    }
  },

  async logRequest(
    endpoint: string,
    method: string,
    payload: unknown,
  ): Promise<void> {
    if (!this.options.enabled || !this.options.filePath) return

    const timestamp = new Date().toISOString()
    const logEntry = [
      `## Request - ${timestamp}`,
      `Endpoint: ${endpoint}`,
      `Method: ${method}`,
      `Payload:`,
      `\`\`\`json`,
      JSON.stringify(payload, null, 2),
      `\`\`\``,
      `\n`,
    ].join("\n")

    try {
      await fs.appendFile(this.options.filePath, logEntry)
    } catch (error) {
      consola.error(`Failed to write to log file`, error)
    }
  },

  async logResponse(endpoint: string, response: unknown): Promise<void> {
    if (!this.options.enabled || !this.options.filePath) return

    const timestamp = new Date().toISOString()
    const logEntry = [
      `## Response - ${timestamp}`,
      `Endpoint: ${endpoint}`,
      `Response:`,
      `\`\`\`json`,
      JSON.stringify(response, null, 2),
      `\`\`\``,
      `\n`,
    ].join("\n")

    try {
      await fs.appendFile(this.options.filePath, logEntry)
    } catch (error) {
      consola.error(`Failed to write to log file`, error)
    }
  },
}
