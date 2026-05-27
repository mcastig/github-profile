import type { GithubRepo, GithubUser } from '../types/github'

export const mockUser: GithubUser = {
  login: 'github',
  name: 'GitHub',
  avatar_url: 'https://avatars.githubusercontent.com/u/9919',
  html_url: 'https://github.com/github',
  bio: 'How people build software.',
  location: 'San Francisco, CA',
  followers: 27839,
  following: 0,
  public_repos: 12,
}

export const mockRepos: GithubRepo[] = [
  {
    id: 1,
    name: '.github',
    description: 'Community health files for the @GitHub organization',
    html_url: 'https://github.com/github/.github',
    stargazers_count: 703,
    forks_count: 2369,
    updated_at: '2026-05-23T12:00:00Z',
    license: null,
  },
  {
    id: 2,
    name: 'accessibility-alt-text-bot',
    description:
      'An action to remind users to add alt text on Issues, Pull Requests, and Discussions',
    html_url: 'https://github.com/github/accessibility-alt-text-bot',
    stargazers_count: 50,
    forks_count: 7,
    updated_at: '2026-05-24T12:00:00Z',
    license: { spdx_id: 'MIT', name: 'MIT License' },
  },
]
