import { GITHUB_API_BASE_URL } from "~/lib/api-config"
import { state } from "~/lib/state"

export const getCopilotToken = async () => {
  const response = await fetch(
    `${GITHUB_API_BASE_URL}/copilot_internal/v2/token`,
    {
      headers: {
        authorization: `token ${state.githubToken}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error("Failed to get Copilot token", {
      cause: await response.json(),
    })
  }

  return (await response.json()) as GetCopilotTokenResponse
}

// Trimmed for the sake of simplicity
interface GetCopilotTokenResponse {
  expires_at: number
  refresh_in: number
  token: string
}
