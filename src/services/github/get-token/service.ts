import { sleep } from "bun"
import consola from "consola"

import { GITHUB_CLIENT_ID, GITHUB_BASE_URL } from "~/lib/constants"

interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

interface AccessTokenResponse {
  access_token: string
  token_type: string
  scope: string
}

export async function getGitHubToken() {
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

  const { user_code, verification_uri, device_code, interval } =
    (await response.json()) as DeviceCodeResponse

  consola.info(`Please enter the code "${user_code}" in ${verification_uri}`)

  while (true) {
    const response = await fetch(
      `${GITHUB_BASE_URL}/login/oauth/access_token`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          device_code,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        }),
      },
    )

    // Interval is in seconds, we need to multiply by 1000 to get milliseconds
    // I'm also adding another second, just to be safe
    const sleepDuration = (interval + 1) * 1000

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
