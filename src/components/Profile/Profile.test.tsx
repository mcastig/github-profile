import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Profile } from './Profile'
import { mockUser } from '../../test/fixtures'

describe('Profile', () => {
  it('renders the name, bio, and formatted stats', () => {
    render(<Profile user={mockUser} />)
    expect(screen.getByRole('heading', { name: 'GitHub' })).toBeInTheDocument()
    expect(screen.getByText('How people build software.')).toBeInTheDocument()
    expect(screen.getByText('27,839')).toBeInTheDocument()
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
  })

  it('falls back to login when name is missing', () => {
    render(<Profile user={{ ...mockUser, name: null }} />)
    expect(screen.getByRole('heading', { name: mockUser.login })).toBeInTheDocument()
  })

  it('shows "Unknown" when location is missing', () => {
    render(<Profile user={{ ...mockUser, location: null }} />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('omits the bio paragraph when no bio is present', () => {
    render(<Profile user={{ ...mockUser, bio: null }} />)
    expect(screen.queryByText('How people build software.')).not.toBeInTheDocument()
  })

  it('links the avatar to the user GitHub page in a new tab', () => {
    render(<Profile user={mockUser} />)
    const link = screen.getByRole('link', { name: /open github on github/i })
    expect(link).toHaveAttribute('href', mockUser.html_url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
