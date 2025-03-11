import { GITHUB_BASE_URL, GITHUB_CLIENT_ID } from "~/lib/api-config"
import { HTTPError } from "~/lib/http-error"

export async function getDeviceCode(): Promise<DeviceCodeResponse> {
  const response = await fetch(`${GITHUB_BASE_URL}/login/device/code`, {
    method: "POST",
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
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
