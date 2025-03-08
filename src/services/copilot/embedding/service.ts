import type { GetModelsResponse } from "~/services/copilot/get-models/types.ts"

import { copilot } from "../../api-instance"

export const embedding = () =>
  copilot<GetModelsResponse>("/embeddings", {
    method: "POST",
  })
