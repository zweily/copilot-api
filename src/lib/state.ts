import type { ModelsResponse } from "~/services/copilot/get-models"

interface State {
  githubToken?: string
  copilotToken?: string
  models?: ModelsResponse
}

export const state: State = {}
