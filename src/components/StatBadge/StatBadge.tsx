import type { ReactNode } from 'react'
import './StatBadge.css'

export interface StatBadgeProps {
  label: string
  value: ReactNode
}

export function StatBadge({ label, value }: StatBadgeProps) {
  return (
    <div className="stat-badge" role="group" aria-label={label}>
      <span className="stat-badge__label">{label}</span>
      <span className="stat-badge__divider" aria-hidden="true" />
      <span className="stat-badge__value">{value}</span>
    </div>
  )
}
