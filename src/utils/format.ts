/**
 * Formats integer counts with locale-aware thousands separators.
 * GitHub returns numbers like 27839 — we want "27,839".
 */
const NUMBER_FORMATTER = new Intl.NumberFormat('en-US')

export function formatCount(value: number): string {
  return NUMBER_FORMATTER.format(value)
}

const DAY_MS = 24 * 60 * 60 * 1000
const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/**
 * Returns "updated 4 days ago" / "updated yesterday" — matches the design.
 * Anchored against a `now` argument so tests are deterministic.
 */
export function formatRelativeUpdated(isoDate: string, now: Date = new Date()): string {
  const updated = new Date(isoDate)
  if (Number.isNaN(updated.getTime())) return ''

  const diffMs = updated.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / DAY_MS)

  if (Math.abs(diffDays) >= 30) {
    const months = Math.round(diffDays / 30)
    return `updated ${RELATIVE_FORMATTER.format(months, 'month')}`
  }
  return `updated ${RELATIVE_FORMATTER.format(diffDays, 'day')}`
}
