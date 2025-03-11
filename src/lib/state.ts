import type { ModelsResponse } from "~/services/copilot/get-models"

export interface State {
  githubToken?: string
  copilotToken?: string

  models?: ModelsResponse
  vsCodeVersion?: string
}

export const state: State = {}
