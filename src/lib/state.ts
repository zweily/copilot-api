import type { GetModelsResponse } from "~/services/copilot/get-models/types"

interface State {
  githubToken?: string
  copilotToken?: string
  models?: GetModelsResponse
}

export const state: State = {}
