import { GITHUB_BASE_URL, GITHUB_CLIENT_ID } from "~/lib/api-config"
import { sleep } from "~/lib/sleep"

import type { DeviceCodeResponse } from "./get-device-code"

export async function pollAccessToken(
  deviceCode: DeviceCodeResponse,
): Promise<string> {
  while (true) {
    const response = await fetch(
      `${GITHUB_BASE_URL}/login/oauth/access_token`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          device_code: deviceCode.device_code,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        }),
      },
    )

    // Interval is in seconds, we need to multiply by 1000 to get milliseconds
    // I'm also adding another second, just to be safe
    const sleepDuration = (deviceCode.interval + 1) * 1000

    if (!response.ok) {
      await sleep(sleepDuration)
      continue
    }

    const { access_token } = (await response.json()) as AccessTokenResponse

    if (access_token) {
      return access_token
    } else {
      await sleep(sleepDuration)
    }
  }
}

interface AccessTokenResponse {
  access_token: string
  token_type: string
  scope: string
}
