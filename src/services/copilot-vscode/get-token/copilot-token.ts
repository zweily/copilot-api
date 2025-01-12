import type { GetCopilotTokenResponse } from "./types"

import { github } from "../api-instance"

export const getCopilotToken = async () =>
  github<GetCopilotTokenResponse>("/copilot_internal/v2/token", {
    method: "GET",
  })
