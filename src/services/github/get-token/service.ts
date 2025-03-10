import consola from "consola"

import { getDeviceCode } from "../get-device-code"
import { pollAccessToken } from "../poll-access-token"

export async function getGitHubToken() {
  const response = await getDeviceCode()

  consola.info(
    `Please enter the code "${response.user_code}" in ${response.verification_uri}`,
  )

  return await pollAccessToken(response)
}
