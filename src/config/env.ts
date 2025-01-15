// VSCode client ID
const GITHUB_CLIENT_ID = "01ab8ac9400c4e429b23"
const GITHUB_OAUTH_SCOPES = [
  "read:org",
  "read:user",
  "repo",
  "user:email",
  "workflow",
].join(" ")

export const ENV = {
  GITHUB_CLIENT_ID,
  GITHUB_OAUTH_SCOPES,
  EMULATE_STREAMING: false,
}
