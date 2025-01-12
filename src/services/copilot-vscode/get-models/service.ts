import type { GetModelsResponse } from "./types"

import { copilotVSCode } from "../api-instance"

export const getModels = () =>
  copilotVSCode<GetModelsResponse>("/models", {
    method: "GET",
  })
