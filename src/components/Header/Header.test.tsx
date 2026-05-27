import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Header } from './Header'

describe('Header', () => {
  it('renders the search input', () => {
    render(<Header onSearch={vi.fn()} />)
    expect(screen.getByPlaceholderText('username')).toBeInTheDocument()
  })

  it('forwards an initial username into the search field', () => {
    render(<Header initialUsername="github" onSearch={vi.fn()} />)
    expect(screen.getByPlaceholderText('username')).toHaveValue('github')
  })

  it('relays search events', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<Header onSearch={onSearch} />)

    await user.type(screen.getByPlaceholderText('username'), 'octocat{Enter}')
    expect(onSearch).toHaveBeenCalledWith('octocat')
  })
})
