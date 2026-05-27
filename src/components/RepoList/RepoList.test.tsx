import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RepoList } from './RepoList'
import { mockRepos, mockUser } from '../../test/fixtures'

const now = new Date('2026-05-27T12:00:00Z')

describe('RepoList', () => {
  it('renders one card per repository', () => {
    render(<RepoList user={mockUser} repos={mockRepos} now={now} />)
    expect(screen.getAllByRole('link', { name: /open repository/i })).toHaveLength(
      mockRepos.length,
    )
  })

  it('shows the "View all repositories" link when there are more', () => {
    render(<RepoList user={mockUser} repos={mockRepos} now={now} />)
    const link = screen.getByRole('link', { name: /view all repositories/i })
    expect(link).toHaveAttribute('href', `${mockUser.html_url}?tab=repositories`)
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('hides the "View all" link when all repos are already shown', () => {
    render(
      <RepoList
        user={{ ...mockUser, public_repos: mockRepos.length }}
        repos={mockRepos}
        now={now}
      />,
    )
    expect(
      screen.queryByRole('link', { name: /view all repositories/i }),
    ).not.toBeInTheDocument()
  })

  it('renders an empty state when the user has no public repos', () => {
    render(<RepoList user={{ ...mockUser, public_repos: 0 }} repos={[]} now={now} />)
    expect(screen.getByText(/doesn't have any public repositories/i)).toBeInTheDocument()
  })
})
