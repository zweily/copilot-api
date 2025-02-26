interface Config {
  PORT: number
  PORT_RANGE: [number, number]
}

const DEFAULT_CONFIG: Config = {
  PORT: 4141,
  PORT_RANGE: [4142, 4200],
}

export class ConfigManager {
  private static instance: ConfigManager | null = null
  private config: Config = DEFAULT_CONFIG

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  getConfig(): Config {
    return this.config
  }

  setConfig(newConfig: Partial<Config>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    }
  }
}

export const configManager = ConfigManager.getInstance()
