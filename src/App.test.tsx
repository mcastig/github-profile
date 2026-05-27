import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import * as api from './services/githubApi'
import { GithubApiError } from './services/githubApi'
import { mockRepos, mockUser } from './test/fixtures'

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(api, 'fetchUser').mockResolvedValue(mockUser)
    vi.spyOn(api, 'fetchRepos').mockResolvedValue(mockRepos)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches the default user on mount and shows their profile', async () => {
    render(<App />)
    expect(api.fetchUser).toHaveBeenCalledWith('github', expect.any(AbortSignal))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'GitHub' })).toBeInTheDocument()
    })
    expect(screen.getByText('27,839')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /open repository/i })).toHaveLength(
      mockRepos.length,
    )
  })

  it('searches for a different user and refetches', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'GitHub' })).toBeInTheDocument(),
    )

    const userMock = api.fetchUser as ReturnType<typeof vi.fn>
    userMock.mockClear()
    userMock.mockResolvedValue({ ...mockUser, login: 'octocat', name: 'Octocat' })

    const input = screen.getByPlaceholderText('username')
    await user.clear(input)
    await user.type(input, 'octocat{Enter}')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Octocat' })).toBeInTheDocument()
    })
    expect(userMock).toHaveBeenCalledWith('octocat', expect.any(AbortSignal))
  })

  it('shows an error state when the user does not exist', async () => {
    ;(api.fetchUser as ReturnType<typeof vi.fn>).mockRejectedValue(
      new GithubApiError('User not found', 404),
    )

    render(<App />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/user not found/i)
    })
  })
})
