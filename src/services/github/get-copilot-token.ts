import { GITHUB_API_BASE_URL, githubHeaders } from "~/lib/api-config";
import { HTTPError } from "~/lib/error";
import { proxyFetch } from "~/lib/proxy-fetch";
import { state } from "~/lib/state";

export const getCopilotToken = async () => {
  const response = await proxyFetch(
    `${GITHUB_API_BASE_URL}/copilot_internal/v2/token`,
    {
      headers: githubHeaders(state),
    },
  );

  if (!response.ok)
    throw new HTTPError("Failed to get Copilot token", response);

  return (await response.json()) as GetCopilotTokenResponse;
};

// Trimmed for the sake of simplicity
interface GetCopilotTokenResponse {
  expires_at: number;
  refresh_in: number;
  token: string;
}
