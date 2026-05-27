import type { GithubRepo, GithubUser } from '../types/github'

const API_BASE = 'https://api.github.com'

/** Custom error so the UI can branch on 404 vs. rate-limit vs. transport. */
export class GithubApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'GithubApiError'
    this.status = status
  }
}

const DEFAULT_HEADERS: HeadersInit = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: DEFAULT_HEADERS,
    signal,
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new GithubApiError('User not found', 404)
    }
    if (response.status === 403) {
      throw new GithubApiError('GitHub API rate limit reached', 403)
    }
    throw new GithubApiError(`Request failed (${response.status})`, response.status)
  }

  return (await response.json()) as T
}

export function fetchUser(username: string, signal?: AbortSignal): Promise<GithubUser> {
  return request<GithubUser>(`/users/${encodeURIComponent(username)}`, signal)
}

export function fetchRepos(
  username: string,
  signal?: AbortSignal,
): Promise<GithubRepo[]> {
  return request<GithubRepo[]>(
    `/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=4`,
    signal,
  )
}
