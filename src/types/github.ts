export interface GithubUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  bio: string | null
  location: string | null
  followers: number
  following: number
  public_repos: number
}

export interface GithubLicense {
  spdx_id: string | null
  name: string | null
}

export interface GithubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  updated_at: string
  license: GithubLicense | null
}
