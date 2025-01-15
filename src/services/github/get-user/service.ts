import { github } from "~/services/api-instance"

export async function getGitHubUser() {
  return github<GithubUser>("/user", {
    method: "GET",
  })
}

interface GithubUser {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: "User"
  user_view_type: "private"
  site_admin: boolean
  name: string
  company: string | null
  blog: string
  location: string
  email: null
  hireable: null
  bio: string
  twitter_username: string | null
  notification_email: null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  private_gists: number
  total_private_repos: number
  owned_private_repos: number
  disk_usage: number
  collaborators: number
  two_factor_authentication: boolean
  plan: {
    name: "pro"
    space: number
    collaborators: number
    private_repos: number
  }
}
