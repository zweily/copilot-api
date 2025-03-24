import type { ModelsResponse } from "~/services/copilot/get-models"

export interface State {
  githubToken?: string
  copilotToken?: string

  accountType: string
  models?: ModelsResponse
  vsCodeVersion?: string

  estimateToken: boolean
  manualApprove: boolean
}

export const state: State = {
  accountType: "individual",
  estimateToken: true,
  manualApprove: false,
}
