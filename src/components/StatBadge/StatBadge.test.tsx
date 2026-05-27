import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatBadge } from './StatBadge'

describe('StatBadge', () => {
  it('renders the label and value', () => {
    render(<StatBadge label="Followers" value="27,839" />)
    expect(screen.getByText('Followers')).toBeInTheDocument()
    expect(screen.getByText('27,839')).toBeInTheDocument()
  })

  it('uses the label as the group name for assistive tech', () => {
    render(<StatBadge label="Location" value="San Francisco" />)
    expect(screen.getByRole('group', { name: 'Location' })).toBeInTheDocument()
  })
})
