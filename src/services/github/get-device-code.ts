import { GITHUB_BASE_URL, GITHUB_CLIENT_ID } from "~/lib/api-config"

export async function getDeviceCode(): Promise<DeviceCodeResponse> {
  const response = await fetch(`${GITHUB_BASE_URL}/login/device/code`, {
    method: "POST",
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to get device code", {
      cause: await response.json(),
    })
  }

  return (await response.json()) as DeviceCodeResponse
}

export interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}
