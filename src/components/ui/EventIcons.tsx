import type { ComponentType, SVGProps } from 'react'
import type { WeddingEvent } from '../../data/wedding'

/* ============================================================================
 * EVENT ICONS
 *
 * Custom line icons rather than lucide's set: each is drawn from the same
 * Mughal vocabulary as the ornaments (domes, cusped arches, hairline strokes)
 * so the event cards read as part of the same hand. No hearts.
 * ========================================================================== */

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 32 32',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

/** A domed chhatri — the pavilion where the Nikkah is solemnised. */
function NikkahIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M16 2.5v2.5" />
      <circle cx="16" cy="6" r="0.9" fill="currentColor" />
      <path d="M16 7c-4 2-7 4.5-6.5 7.5h13C23 11.5 20 9 16 7z" />
      <path d="M6 16.5l3-2h14l3 2z" />
      <path d="M8 16.5V27M24 16.5V27" />
      <path d="M11.5 27v-5.5q0-2 1.4-2.4q.6-1.6 3.1-2.1q2.5.5 3.1 2.1q1.4.4 1.4 2.4V27" opacity="0.8" />
      <path d="M4.5 27h23M3 29.5h26" opacity="0.5" />
    </svg>
  )
}

/** A lidded handi with rising steam — the dinner. */
function WalimaIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 6q-1.5 2 0 4M16 4.5q-1.5 2 0 4M20 6q-1.5 2 0 4" opacity="0.55" />
      <path d="M16 11.5v-1" />
      <circle cx="16" cy="10" r="0.9" fill="currentColor" />
      <path d="M9 15q7-4.5 14 0" />
      <path d="M8 15h16" />
      <path d="M9 15q-2.5 4 0 8.5q3 3 7 3t7-3q2.5-4.5 0-8.5" />
      <path d="M10.5 19.5q5.5 1.5 11 0" opacity="0.5" />
      <path d="M6 29h20" opacity="0.4" />
    </svg>
  )
}

const ICONS: Record<WeddingEvent['icon'], ComponentType<IconProps>> = {
  nikkah: NikkahIcon,
  walima: WalimaIcon,
}

export function EventIcon({ name, ...props }: { name: WeddingEvent['icon'] } & IconProps) {
  const Icon = ICONS[name]
  return <Icon {...props} />
}
