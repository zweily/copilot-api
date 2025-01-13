const GITHUB_CLIENT_ID = "Ov23liPrT8UUsoQGbZiX"
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
}
