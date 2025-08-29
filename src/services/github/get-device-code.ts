import {
  GITHUB_APP_SCOPES,
  GITHUB_BASE_URL,
  GITHUB_CLIENT_ID,
  standardHeaders,
} from "~/lib/api-config"
import { HTTPError } from "~/lib/error"
import { proxyFetch } from "~/lib/proxy-fetch"

export async function getDeviceCode(): Promise<DeviceCodeResponse> {
  const response = await proxyFetch(`${GITHUB_BASE_URL}/login/device/code`, {
    method: "POST",
    headers: standardHeaders(),
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      scope: GITHUB_APP_SCOPES,
    }),
  })

  if (!response.ok) throw new HTTPError("Failed to get device code", response)

  return (await response.json()) as DeviceCodeResponse
}

export interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}
