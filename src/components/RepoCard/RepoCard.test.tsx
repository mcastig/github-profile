import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RepoCard } from './RepoCard'
import { mockRepos } from '../../test/fixtures'

const now = new Date('2026-05-27T12:00:00Z')

describe('RepoCard', () => {
  it('opens the repository in a new tab when clicked', () => {
    render(<RepoCard repo={mockRepos[0]!} now={now} />)
    const link = screen.getByRole('link', { name: /open repository .github/i })
    expect(link).toHaveAttribute('href', mockRepos[0]!.html_url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders forks, stars, and an "updated" timestamp', () => {
    render(<RepoCard repo={mockRepos[0]!} now={now} />)
    expect(screen.getByText('2,369')).toBeInTheDocument()
    expect(screen.getByText('703')).toBeInTheDocument()
    expect(screen.getByText(/updated.*4 days ago/)).toBeInTheDocument()
  })

  it('shows the license SPDX id when present', () => {
    render(<RepoCard repo={mockRepos[1]!} now={now} />)
    expect(screen.getByText('MIT')).toBeInTheDocument()
  })

  it('omits the license tag when the repo has none', () => {
    render(<RepoCard repo={mockRepos[0]!} now={now} />)
    expect(screen.queryByText('MIT')).not.toBeInTheDocument()
  })

  it('uses a placeholder description when none is provided', () => {
    const repo = { ...mockRepos[0]!, description: null }
    render(<RepoCard repo={repo} now={now} />)
    expect(screen.getByText(/no description provided/i)).toBeInTheDocument()
  })
})
