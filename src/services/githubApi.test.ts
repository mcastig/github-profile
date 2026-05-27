import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GithubApiError, fetchRepos, fetchUser } from './githubApi'
import { mockRepos, mockUser } from '../test/fixtures'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('githubApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('fetches a user and sends the correct headers', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse(mockUser),
    )

    const user = await fetchUser('github')
    expect(user).toEqual(mockUser)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.github.com/users/github',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/vnd.github+json',
        }),
      }),
    )
  })

  it('fetches repositories sorted by updated, capped at 4', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse(mockRepos),
    )

    const repos = await fetchRepos('github')
    expect(repos).toEqual(mockRepos)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.github.com/users/github/repos?sort=updated&per_page=4',
      expect.any(Object),
    )
  })

  it('encodes the username so unusual characters are safe', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse(mockUser),
    )

    await fetchUser('foo bar/baz')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.github.com/users/foo%20bar%2Fbaz',
      expect.any(Object),
    )
  })

  it('throws GithubApiError with status 404 for missing users', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response('', { status: 404 }),
    )

    await expect(fetchUser('nope')).rejects.toMatchObject({
      name: 'GithubApiError',
      status: 404,
      message: 'User not found',
    })
  })

  it('throws GithubApiError with a rate-limit message on 403', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response('', { status: 403 }),
    )

    await expect(fetchUser('rate-limited')).rejects.toMatchObject({
      status: 403,
      message: 'GitHub API rate limit reached',
    })
  })

  it('throws a generic GithubApiError on other failures', async () => {
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response('', { status: 500 }),
    )

    await expect(fetchUser('boom')).rejects.toMatchObject({
      status: 500,
      message: 'Request failed (500)',
    })
  })

  it('GithubApiError preserves the message and status', () => {
    const err = new GithubApiError('nope', 418)
    expect(err.message).toBe('nope')
    expect(err.status).toBe(418)
    expect(err.name).toBe('GithubApiError')
  })
})
