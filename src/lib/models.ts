import type { GetModelsResponse } from "~/services/copilot/get-models/types"

export const modelsCache = {
  _models: null as GetModelsResponse | null,

  setModels(models: GetModelsResponse) {
    this._models = models
  },

  getModels() {
    return this._models
  },
}
