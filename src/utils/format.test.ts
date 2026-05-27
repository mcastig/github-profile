import { describe, expect, it } from 'vitest'
import { formatCount, formatRelativeUpdated } from './format'

describe('formatCount', () => {
  it('inserts thousands separators', () => {
    expect(formatCount(27839)).toBe('27,839')
    expect(formatCount(0)).toBe('0')
    expect(formatCount(1234567)).toBe('1,234,567')
  })
})

describe('formatRelativeUpdated', () => {
  const now = new Date('2026-05-27T12:00:00Z')

  it('renders days ago for recent updates', () => {
    const updated = '2026-05-23T12:00:00Z'
    expect(formatRelativeUpdated(updated, now)).toMatch(/updated.*4 days ago/)
  })

  it('renders "yesterday" via Intl when exactly one day prior', () => {
    const updated = '2026-05-26T12:00:00Z'
    expect(formatRelativeUpdated(updated, now)).toBe('updated yesterday')
  })

  it('renders "today" via Intl when same day', () => {
    expect(formatRelativeUpdated('2026-05-27T12:00:00Z', now)).toBe('updated today')
  })

  it('switches to months when more than 30 days apart', () => {
    const updated = '2026-01-15T12:00:00Z'
    expect(formatRelativeUpdated(updated, now)).toMatch(/updated.*months? ago/)
  })

  it('returns empty string for invalid dates', () => {
    expect(formatRelativeUpdated('not-a-date', now)).toBe('')
  })
})
