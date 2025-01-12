export interface GetCopilotTokenResponse {
  annotations_enabled: boolean
  chat_enabled: boolean
  chat_jetbrains_enabled: boolean
  code_quote_enabled: boolean
  code_review_enabled: boolean
  codesearch: boolean
  copilotignore_enabled: boolean
  endpoints: {
    api: string
    "origin-tracker": string
    proxy: string
    telemetry: string
  }
  expires_at: number
  individual: boolean
  limited_user_quotas: null
  limited_user_reset_date: null
  nes_enabled: boolean
  prompt_8k: boolean
  public_suggestions: "disabled"
  refresh_in: number
  sku: "free_educational"
  snippy_load_test_enabled: boolean
  telemetry: "disabled"
  token: string
  tracking_id: string
  vsc_electron_fetcher_v2: boolean
  xcode: boolean
  xcode_chat: boolean
}
