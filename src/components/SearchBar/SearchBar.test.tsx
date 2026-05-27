import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchBar } from './SearchBar'
import * as api from '../../services/githubApi'
import { GithubApiError } from '../../services/githubApi'
import { mockUser } from '../../test/fixtures'

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.spyOn(api, 'fetchUser').mockResolvedValue(mockUser)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('submits the trimmed username when Enter is pressed', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onSubmit = vi.fn()
    render(<SearchBar onSubmit={onSubmit} />)

    const input = screen.getByPlaceholderText('username')
    await user.type(input, '  octocat  {Enter}')

    expect(onSubmit).toHaveBeenCalledWith('octocat')
  })

  it('does not expose a submit button', () => {
    render(<SearchBar onSubmit={vi.fn()} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('ignores Enter when the input is empty or whitespace only', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onSubmit = vi.fn()
    render(<SearchBar onSubmit={onSubmit} />)

    const input = screen.getByPlaceholderText('username')
    await user.type(input, '{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()

    await user.type(input, '   {Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('honors initialValue and does not render a preview on mount', () => {
    render(<SearchBar initialValue="github" onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText('username')).toHaveValue('github')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders a preview card after the debounced fetch resolves', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<SearchBar onSubmit={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('username'), 'github')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })

    await waitFor(() => {
      expect(screen.getByText('GitHub')).toBeInTheDocument()
    })
    expect(screen.getByText('How people build software.')).toBeInTheDocument()
    expect(api.fetchUser).toHaveBeenLastCalledWith('github', expect.any(AbortSignal))
  })

  it('selects the previewed user when its card is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onSubmit = vi.fn()
    render(<SearchBar onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText('username'), 'github')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })

    const previewButton = await screen.findByRole('button', {
      name: /open profile for github/i,
    })
    await user.click(previewButton)

    expect(onSubmit).toHaveBeenCalledWith('github')
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /open profile for github/i }),
      ).not.toBeInTheDocument()
    })
  })

  it('hides the preview after submitting via Enter', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onSubmit = vi.fn()
    render(<SearchBar onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText('username'), 'github')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })
    await screen.findByRole('button', { name: /open profile for github/i })

    await user.type(screen.getByPlaceholderText('username'), '{Enter}')

    expect(onSubmit).toHaveBeenCalledWith('github')
    expect(
      screen.queryByRole('button', { name: /open profile for github/i }),
    ).not.toBeInTheDocument()
  })

  it('does not fetch a preview for inputs shorter than the minimum length', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<SearchBar onSubmit={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('username'), 'g')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })

    expect(api.fetchUser).not.toHaveBeenCalled()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('does not render a preview when the fetch fails', async () => {
    ;(api.fetchUser as ReturnType<typeof vi.fn>).mockRejectedValue(
      new GithubApiError('User not found', 404),
    )
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<SearchBar onSubmit={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('username'), 'ghost')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })

    await waitFor(() => expect(api.fetchUser).toHaveBeenCalled())
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('falls back to the login when the preview has no display name', async () => {
    ;(api.fetchUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockUser,
      name: null,
      bio: null,
    })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<SearchBar onSubmit={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('username'), 'github')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /open profile for github/i }),
      ).toBeInTheDocument()
    })
    expect(screen.queryByText('How people build software.')).not.toBeInTheDocument()
  })
})
