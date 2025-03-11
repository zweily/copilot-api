import { GITHUB_API_BASE_URL } from "~/lib/constants"
import { state } from "~/lib/state"

export async function getGitHubUser() {
  const response = await fetch(`${GITHUB_API_BASE_URL}/user`, {
    headers: {
      authorization: `token ${state.githubToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get GitHub user", {
      cause: await response.json(),
    })
  }

  return (await response.json()) as GithubUser
}

// Trimmed for the sake of simplicity
interface GithubUser {
  login: string
}
