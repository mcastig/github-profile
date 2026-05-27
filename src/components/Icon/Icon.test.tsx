import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Icon } from './Icon'

describe('Icon', () => {
  it('renders a hidden decorative image by default', () => {
    const { container } = render(<Icon name="search" />)
    const img = container.querySelector('img')!
    expect(img).toBeInTheDocument()
    expect(img.getAttribute('aria-hidden')).toBe('true')
    expect(img.getAttribute('role')).toBe('presentation')
    expect(img.getAttribute('alt')).toBe('')
    expect(img.getAttribute('width')).toBe('20')
  })

  it('exposes accessible name when not decorative', () => {
    render(<Icon name="star" decorative={false} label="Star count" />)
    expect(screen.getByAltText('Star count')).toBeInTheDocument()
  })

  it('falls back to the icon name when no label is provided', () => {
    render(<Icon name="star" decorative={false} />)
    expect(screen.getByAltText('star')).toBeInTheDocument()
  })

  it('applies a custom size and className', () => {
    const { container } = render(<Icon name="forks" size={32} className="custom" />)
    const img = container.querySelector('img')!
    expect(img.getAttribute('width')).toBe('32')
    expect(img.className).toContain('custom')
    expect(img.className).toContain('icon')
  })
})
