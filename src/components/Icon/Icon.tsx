import './Icon.css'

import forks from '../../assets/icons/forks.svg'
import license from '../../assets/icons/license.svg'
import search from '../../assets/icons/search.svg'
import star from '../../assets/icons/star.svg'

export type IconName = 'forks' | 'license' | 'search' | 'star'

const SOURCES: Record<IconName, string> = {
  forks,
  license,
  search,
  star,
}

export interface IconProps {
  name: IconName
  size?: number
  className?: string
  decorative?: boolean
  label?: string
}

/**
 * Loads an SVG as an `<img>` so the file is cached and content-hashed by Vite.
 * Per project guidelines, SVG markup is never inlined into JSX.
 */
export function Icon({
  name,
  size = 20,
  className,
  decorative = true,
  label,
}: IconProps) {
  const altText = decorative ? '' : (label ?? name)
  const classes = ['icon', className].filter(Boolean).join(' ')

  return (
    <img
      src={SOURCES[name]}
      width={size}
      height={size}
      alt={altText}
      aria-hidden={decorative || undefined}
      role={decorative ? 'presentation' : undefined}
      className={classes}
      draggable={false}
    />
  )
}
