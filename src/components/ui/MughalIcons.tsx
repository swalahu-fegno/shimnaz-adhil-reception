import type { SVGProps } from 'react'

/* ============================================================================
 * MUGHAL DETAIL ICONS
 *
 * Small line icons for dates, times and places, drawn in the same hand as the
 * ornaments: cusped arches, onion domes, lotus petals. They take the same
 * props as the lucide icons they replace (className, strokeWidth).
 * ========================================================================== */

type IconProps = SVGProps<SVGSVGElement> & { strokeWidth?: number | string }

function base({ strokeWidth = 1.25, ...props }: IconProps) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  }
}

/** A tablet crowned with a cusped arch — the date. */
export function CalendarDays(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 21V10q0-1.5 1.6-1.8q.9-2.3 3.2-2.6Q10 3 12 2.5q2 .5 3.2 3.1q2.3.3 3.2 2.6Q20 8.5 20 10v11z" />
      <path d="M4 12h16" opacity="0.7" />
      <circle cx="8" cy="15.5" r="0.6" fill="currentColor" />
      <circle cx="12" cy="15.5" r="0.6" fill="currentColor" />
      <circle cx="16" cy="15.5" r="0.6" fill="currentColor" />
      <circle cx="8" cy="18.5" r="0.6" fill="currentColor" />
      <circle cx="12" cy="18.5" r="0.6" fill="currentColor" />
      <path d="M12 6v3" opacity="0.6" />
    </svg>
  )
}

/** A dial ringed with lotus petals — the time. */
export function Clock(props: IconProps) {
  const ticks = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="7" />
      {ticks.map((d) => (
        <path
          key={d}
          d="M12 1.6q1 1.4 0 2.8q-1-1.4 0-2.8z"
          transform={`rotate(${d} 12 12)`}
          fill="currentColor"
          fillOpacity="0.5"
        />
      ))}
      <path d="M12 8.2V12l2.6 1.8" />
      <circle cx="12" cy="12" r="0.7" fill="currentColor" />
    </svg>
  )
}

/** An onion dome with finial, narrowing to a point — the place. */
export function MapPin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 1.5v2" />
      <path d="M12 3.8C8 5.6 5 8.2 5.4 11.6C5.9 15.6 10 18.5 12 22C14 18.5 18.1 15.6 18.6 11.6C19 8.2 16 5.6 12 3.8Z" />
      <path d="M10 14v-2.2q0-1 .9-1.2q.3-.9 1.1-1.1q.8.2 1.1 1.1q.9.2.9 1.2V14z" opacity="0.8" />
    </svg>
  )
}

/** A rising stem tipped with a bud — "open". */
export function ArrowUpRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 18L16 8" />
      <path d="M18.5 5.5q-.4 4.6-3.5 5.7q-1.4-1.6-2.2-2.2q1.1-3.1 5.7-3.5z" fill="currentColor" fillOpacity="0.3" />
      <path d="M8.5 15.5q-2-.2-3-1.5M8.5 15.5q.2 2 1.5 3" opacity="0.6" />
    </svg>
  )
}

/** Two notes whose heads are lotus buds — music on. */
export function Music(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 18V5.5l11-2.5v12.5" />
      <path d="M9 9l11-2.5" opacity="0.6" />
      <path d="M6.5 15.5q3 .5 2.5 3q-.5 2.5-3 2t-2.5-2.5q.3-2.8 3-2.5z" fill="currentColor" fillOpacity="0.3" />
      <path d="M17.5 13q3 .5 2.5 3q-.5 2.5-3 2t-2.5-2.5q.3-2.8 3-2.5z" fill="currentColor" fillOpacity="0.3" />
    </svg>
  )
}

/** A bell-shaped horn, silenced — music off. */
export function VolumeX(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 9.5h3.5l5-4.5v14l-5-4.5H3.5z" />
      <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />
    </svg>
  )
}

/** Three blossoms joined by a vine — share. */
export function Share2(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7.5 11q4.5-1.5 8-5M7.5 13q4.5 1.5 8 5" opacity="0.8" />
      {[
        [18, 5],
        [5.5, 12],
        [18, 19],
      ].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <circle cx={x} cy={y} r="2.6" />
          <circle cx={x} cy={y} r="0.8" fill="currentColor" />
        </g>
      ))}
    </svg>
  )
}

/** A cusped arch with a rising stem — back to top. */
export function ArrowUp(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21V8" />
      <path d="M7 12q0-2.5 2-3q.6-2.5 3-4q2.4 1.5 3 4q2 .5 2 3" />
    </svg>
  )
}

/** A tick ending in a leaf — done. */
export function Check(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 12.5l4.5 4.5L19 7" />
      <path d="M19 7q1.5-2.5 1-4q-2 .5-3 2.5" fill="currentColor" fillOpacity="0.3" />
    </svg>
  )
}

/** Two arched tablets, one behind the other — copy. */
export function Copy(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 21V11q0-1.2 1.2-1.5q.7-1.8 2.8-2q2.1.2 2.8 2Q17 9.8 17 11v10z" />
      <path d="M6.5 17V7.5q0-1.2 1.2-1.5q.7-1.8 2.8-2q1.6.1 2.4 1.2" opacity="0.6" />
    </svg>
  )
}

/** A pointed bud hanging down — scroll on. */
export function ChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 9.5l6 6 6-6" />
      <path d="M12 15.5q-1 2 0 4q1-2 0-4z" fill="currentColor" />
    </svg>
  )
}

export function ChevronLeft(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14.5 6l-6 6 6 6" />
      <path d="M8.5 12q-2-1-4 0q2 1 4 0z" fill="currentColor" />
    </svg>
  )
}

export function ChevronRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9.5 6l6 6-6 6" />
      <path d="M15.5 12q2-1 4 0q-2 1-4 0z" fill="currentColor" />
    </svg>
  )
}

/** An envelope sealed with a fleur — email. */
export function Mail(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="6" width="18" height="13" rx="1" />
      <path d="M3 7l9 6.5L21 7" />
      <path d="M12 13.5q1.4 1.6 0 3.2q-1.4-1.6 0-3.2z" fill="currentColor" />
    </svg>
  )
}

/** A handset — phone. */
export function Phone(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 4.5h3.5l1.5 4-2 1.5q1.5 3.5 6 6l1.5-2 4 1.5V19q0 1.5-1.5 1.5C10.5 20 4 13.5 3.5 6q0-1.5 1.5-1.5z" />
    </svg>
  )
}

/** An arched window with a bud leaving it — open elsewhere. */
export function ExternalLink(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M11 4H6q-2 0-2 2v12q0 2 2 2h12q2 0 2-2v-5" />
      <path d="M11 13l9-9" />
      <path d="M20 4q-.5 4-3.5 4.5q-.5-3 3.5-4.5z" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}

/** A compass point shaped like a fleur — directions. */
export function Navigation(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2.5Q17 9 16 14q-1 4-4 7.5q-3-3.5-4-7.5Q7 9 12 2.5z" />
      <path d="M12 9v7M9.5 13h5" opacity="0.6" />
    </svg>
  )
}
