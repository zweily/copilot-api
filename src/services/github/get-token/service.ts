import consola from "consola"

import { ENV } from "~/config/env"
import { _github } from "~/services/api-instance"

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
  const response = await _github<DeviceCodeResponse>("/login/device/code", {
    method: "POST",
    body: {
      client_id: ENV.GITHUB_CLIENT_ID,
      scope: ENV.GITHUB_OAUTH_SCOPES,
    },
  })

  consola.info(
    `Please enter the code "${response.user_code}" in ${response.verification_uri}`,
  )

  while (true) {
    const pollResponse = await _github<AccessTokenResponse>(
      "/login/oauth/access_token",
      {
        method: "POST",
        body: {
          client_id: ENV.GITHUB_CLIENT_ID,
          device_code: response.device_code,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        },
      },
    )

    if (pollResponse.access_token) {
      consola.info(`Got token ${pollResponse.access_token.replace(/./g, "*")}`)
      return pollResponse
    } else {
      // Interval is in seconds, we need to multiply by 1000 to get milliseconds
      // I'm also adding another second, just to be safe
      await new Promise((resolve) =>
        setTimeout(resolve, (response.interval + 1) * 1000),
      )
    }
  }
}
