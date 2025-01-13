import type { GetModelsResponse } from "./types"

import { copilot } from "../../api-instance"

export const getModels = () =>
  copilot<GetModelsResponse>("/models", {
    method: "GET",
  })
