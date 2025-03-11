import consola from "consola"

import type { GetModelsResponse } from "~/services/copilot/get-models/types"

import { getModels } from "~/services/copilot/get-models/service"

import { state } from "./state"

export const modelsCache = {
  _models: null as GetModelsResponse | null,

  setModels(models: GetModelsResponse) {
    this._models = models
  },

  getModels() {
    return this._models
  },
}

export async function cacheModels(): Promise<void> {
  const models = await getModels()
  state.models = models

  consola.info(
    `Available models: \n${models.data.map((model) => `- ${model.id}`).join("\n")}`,
  )
}
