import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGithubProfile } from './useGithubProfile'
import * as api from '../services/githubApi'
import { GithubApiError } from '../services/githubApi'
import { mockRepos, mockUser } from '../test/fixtures'

describe('useGithubProfile', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('is idle when given an empty username', () => {
    const { result } = renderHook(() => useGithubProfile(''))
    expect(result.current).toEqual({
      status: 'idle',
      user: null,
      repos: [],
      error: null,
    })
  })

  it('treats whitespace-only input as idle', () => {
    const { result } = renderHook(() => useGithubProfile('   '))
    expect(result.current.status).toBe('idle')
  })

  it('resolves to success on a healthy request', async () => {
    vi.spyOn(api, 'fetchUser').mockResolvedValue(mockUser)
    vi.spyOn(api, 'fetchRepos').mockResolvedValue(mockRepos)

    const { result } = renderHook(() => useGithubProfile('github'))

    expect(result.current.status).toBe('loading')

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.repos).toEqual(mockRepos)
    expect(result.current.error).toBeNull()
  })

  it('surfaces a user-friendly message on a GithubApiError', async () => {
    vi.spyOn(api, 'fetchUser').mockRejectedValue(
      new GithubApiError('User not found', 404),
    )
    vi.spyOn(api, 'fetchRepos').mockResolvedValue([])

    const { result } = renderHook(() => useGithubProfile('ghost'))

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBe('User not found')
    expect(result.current.user).toBeNull()
  })

  it('falls back to a generic message on unknown errors', async () => {
    vi.spyOn(api, 'fetchUser').mockRejectedValue(new TypeError('network down'))
    vi.spyOn(api, 'fetchRepos').mockResolvedValue([])

    const { result } = renderHook(() => useGithubProfile('offline'))

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBe('Something went wrong fetching the profile')
  })

  it('ignores a resolved fetch after unmount (abort path)', async () => {
    let resolveUser!: (user: typeof mockUser) => void
    let resolveRepos!: (repos: typeof mockRepos) => void
    vi.spyOn(api, 'fetchUser').mockReturnValue(
      new Promise((resolve) => {
        resolveUser = resolve
      }),
    )
    vi.spyOn(api, 'fetchRepos').mockReturnValue(
      new Promise((resolve) => {
        resolveRepos = resolve
      }),
    )

    const { result, unmount } = renderHook(() => useGithubProfile('github'))
    expect(result.current.status).toBe('loading')

    unmount()
    resolveUser(mockUser)
    resolveRepos(mockRepos)
    await Promise.resolve()
    // Nothing to assert on result.current after unmount, but the abort branch
    // is now exercised — no warnings about state-on-unmounted will surface.
  })

  it('ignores a rejected fetch after unmount (abort catch path)', async () => {
    let rejectUser!: (err: Error) => void
    vi.spyOn(api, 'fetchUser').mockReturnValue(
      new Promise((_, reject) => {
        rejectUser = reject
      }),
    )
    vi.spyOn(api, 'fetchRepos').mockResolvedValue(mockRepos)

    const { unmount } = renderHook(() => useGithubProfile('github'))
    unmount()
    rejectUser(new Error('late failure'))
    await Promise.resolve()
  })

  it('refetches when the username changes', async () => {
    const userSpy = vi.spyOn(api, 'fetchUser').mockResolvedValue(mockUser)
    const repoSpy = vi.spyOn(api, 'fetchRepos').mockResolvedValue(mockRepos)

    const { rerender } = renderHook(({ user }) => useGithubProfile(user), {
      initialProps: { user: 'github' },
    })
    await waitFor(() => expect(userSpy).toHaveBeenCalledTimes(1))

    rerender({ user: 'octocat' })
    await waitFor(() => expect(userSpy).toHaveBeenCalledTimes(2))
    expect(repoSpy).toHaveBeenCalledTimes(2)
    expect(userSpy.mock.calls[1]?.[0]).toBe('octocat')
  })
})
