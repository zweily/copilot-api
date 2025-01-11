import { getEnv } from "@echristian/env";

const GITHUB_AUTH_HEADER = getEnv('GITHUB_AUTH_HEADER')

export const ENV = {
  GITHUB_AUTH_HEADER
}