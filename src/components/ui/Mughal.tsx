import type { CSSProperties, SVGProps } from 'react'

/**
 * Mughal ornament set — the royal-court vocabulary for this invitation.
 *
 * The client's card is a Mughal garden scene: a domed chhatri, palms, a lake,
 * peacocks, all in champagne gold on ivory with charcoal shading. These pieces
 * carry that language through the rest of the site, drawn as line work so they
 * read as gold foil rather than clip art.
 */

/**
 * A multifoil (cusped) Mughal arch, the shape of every jharokha and iwan.
 * Width `w`, height `h`, springing at 58% of the height, five lobes to the
 * pointed crown. Closed along the bottom so it can be used as a clip-path.
 */
export function cuspedArchPath(w: number, h: number): string {
  // A pointed arch from two circles meeting at the crown, springing at half
  // height. Each side is divided into lobes; every lobe bows slightly outward
  // so the joins between them form the inward-pointing cusps.
  const spring = h * 0.5
  const half = w / 2
  const r = (half * half + spring * spring) / (2 * half) // circle through (0,spring) and crown
  const lobes = 5
  const bulge = 0.22
  const side = (mirror: boolean) => {
    const cx = mirror ? w - r : r
    const a0 = mirror ? 0 : Math.PI
    const raw = Math.atan2(-spring, half - cx)
    // Left side sweeps π → 3π/2 (up and over); right sweeps 0 → -π/2.
    const a1 = mirror ? raw : raw + 2 * Math.PI
    const pts: [number, number][] = []
    for (let i = 0; i <= lobes; i++) {
      const a = a0 + (a1 - a0) * (i / lobes)
      pts.push([cx + r * Math.cos(a), spring + r * Math.sin(a)])
    }
    return { pts, cx }
  }
  const seg = (from: [number, number], to: [number, number], cx: number) => {
    const mx = (from[0] + to[0]) / 2
    const my = (from[1] + to[1]) / 2
    const dx = mx - cx
    const dy = my - spring
    const len = Math.hypot(dx, dy)
    const chord = Math.hypot(to[0] - from[0], to[1] - from[1])
    const qx = mx + (dx / len) * chord * bulge
    const qy = my + (dy / len) * chord * bulge
    return `Q${qx.toFixed(1)} ${qy.toFixed(1)} ${to[0].toFixed(1)} ${to[1].toFixed(1)}`
  }
  const L = side(false)
  const R = side(true)
  const d: string[] = [`M0 ${h}`, `L0 ${spring}`]
  for (let i = 1; i < L.pts.length; i++) d.push(seg(L.pts[i - 1], L.pts[i], L.cx))
  const rev = [...R.pts].reverse()
  for (let i = 1; i < rev.length; i++) d.push(seg(rev[i - 1], rev[i], R.cx))
  d.push(`L${w} ${h}`, 'Z')
  return d.join(' ')
}

/** Gold outline of a cusped arch, stretched to its container. */
export function CuspedArch({ className, double = true }: { className?: string; double?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 300"
      preserveAspectRatio="none"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path d={cuspedArchPath(200, 300)} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      {double && (
        <path
          d={cuspedArchPath(184, 290)}
          transform="translate(8 10)"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.55"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  )
}

/** The date palm from the card — the couple's emblem. */
export function GoldPalm({ className, ...props }: SVGProps<SVGSVGElement>) {
  // Angles from vertical; every frond arcs up and over, then droops.
  const fronds = [-118, -95, -72, -50, -28, -10, 10, 28, 50, 72, 95, 118]
  return (
    <svg viewBox="0 0 100 120" className={className} fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeLinecap="round">
        {/* trunk, gently curved, with ring marks */}
        <path d="M50 36 C48 60 52 86 47 112" strokeWidth="2.6" />
        {[46, 54, 62, 70, 78, 86, 94, 102].map((y) => (
          <path key={y} d={`M46.8 ${y} Q50 ${y + 1.6} 52.6 ${y - 1}`} strokeWidth="0.7" opacity="0.75" />
        ))}
        {fronds.map((a) => {
          const r = (a * Math.PI) / 180
          const len = 40 - Math.abs(a) / 12
          const ex = 50 + Math.sin(r) * len
          const ey = 34 - Math.cos(r) * len * 0.3 + Math.abs(Math.sin(r)) * 18
          const cx = 50 + Math.sin(r) * len * 0.5
          const cy = 34 - len * (0.42 - Math.abs(a) / 600)
          return (
            <g key={a}>
              <path d={`M50 35 Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`} strokeWidth="1" />
              {[0.18, 0.3, 0.42, 0.54, 0.66, 0.78, 0.9].map((t) => {
                const x = (1 - t) * (1 - t) * 50 + 2 * (1 - t) * t * cx + t * t * ex
                const y = (1 - t) * (1 - t) * 35 + 2 * (1 - t) * t * cy + t * t * ey
                const l = 7.5 * (1 - t * 0.55)
                const side = Math.sign(a) || 1
                return (
                  <g key={t} strokeWidth="0.55" opacity="0.85">
                    <path d={`M${x.toFixed(2)} ${y.toFixed(2)} q${(side * l * 0.35).toFixed(2)} ${(l * 0.5).toFixed(2)} ${(side * l * 0.15).toFixed(2)} ${l.toFixed(2)}`} />
                    <path d={`M${x.toFixed(2)} ${y.toFixed(2)} q${(-side * l * 0.25).toFixed(2)} ${(l * 0.45).toFixed(2)} ${(-side * l * 0.05).toFixed(2)} ${(l * 0.85).toFixed(2)}`} />
                  </g>
                )
              })}
            </g>
          )
        })}
        {/* dates */}
        <path d="M47 40 q-2 6 -1 10 M53 40 q2 6 1 10" strokeWidth="0.8" />
        <circle cx="46" cy="51" r="1.4" fill="currentColor" />
        <circle cx="54" cy="51" r="1.4" fill="currentColor" />
        {/* ground */}
        <path d="M36 113 Q48 109 62 113" strokeWidth="0.9" />
      </g>
    </svg>
  )
}

/** A lotus finial — the small mark between "&" rules on the card. */
export function Lotus({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 24" className={className} fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round">
        <path d="M20 2 C15 8 15 15 20 21 C25 15 25 8 20 2Z" fill="currentColor" fillOpacity="0.25" />
        <path d="M20 21 C13 18 9 12 9 7 C13 9 17 14 20 21Z" />
        <path d="M20 21 C27 18 31 12 31 7 C27 9 23 14 20 21Z" />
        <path d="M20 21 C11 21 5 17 2 13 C8 13 15 16 20 21Z" />
        <path d="M20 21 C29 21 35 17 38 13 C32 13 25 16 20 21Z" />
        <path d="M8 23 H32" strokeWidth="0.6" />
      </g>
    </svg>
  )
}

/** Lotus flanked by fading rules — the section divider. */
export function LotusDivider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className ?? ''}`} aria-hidden="true">
      <span className="h-px w-20 bg-gradient-to-r from-transparent to-gold/70 md:w-32" />
      <Lotus className="h-5 w-8 text-gold" />
      <span className="h-px w-20 bg-gradient-to-l from-transparent to-gold/70 md:w-32" />
    </div>
  )
}

/**
 * Birds crossing the open sky (client request).
 *
 * Each bird is two wing strokes that flap on a CSS keyframe while its wrapper
 * glides across the container. Pure CSS: no JS timers, and it stops for
 * reduced motion via the stylesheet.
 */
const FLOCK: { top: string; delay: number; dur: number; size: number; dir: 1 | -1 }[] = [
  { top: '12%', delay: 0, dur: 26, size: 22, dir: 1 },
  { top: '16%', delay: 1.2, dur: 27, size: 15, dir: 1 },
  { top: '9%', delay: 2.1, dur: 25, size: 12, dir: 1 },
  { top: '22%', delay: 9, dur: 31, size: 18, dir: -1 },
  { top: '26%', delay: 10.4, dur: 30, size: 12, dir: -1 },
  { top: '6%', delay: 15, dur: 24, size: 14, dir: 1 },
]

export function Birds({ className, tone = 'text-ink/60' }: { className?: string; tone?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`} aria-hidden="true">
      {FLOCK.map((b, i) => (
        <span
          key={i}
          className={`bird-glide absolute ${b.dir < 0 ? 'is-left' : ''} ${tone}`}
          style={
            {
              top: b.top,
              width: b.size,
              '--dur': `${b.dur}s`,
              '--delay': `${b.delay}s`,
            } as CSSProperties
          }
        >
          <svg viewBox="0 0 40 20" className="bird-flap block w-full" style={{ animationDelay: `${i * 0.13}s` }}>
            <path
              d="M2 8 Q10 2 20 11 Q30 2 38 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ))}
    </div>
  )
}

/**
 * A domed Mughal chhatri (pavilion) in gold line — onion dome with finial,
 * a chhajja (eave), three cusped arches on slender columns, and a plinth.
 */
export function Chhatri({ className, ...props }: SVGProps<SVGSVGElement>) {
  const arch = (x: number) =>
    `M${x} 112 L${x} 84 Q${x} 72 ${x + 4} 70 Q${x + 6} 64 ${x + 10} 63 Q${x + 14} 64 ${x + 16} 70 Q${x + 20} 72 ${x + 20} 84 L${x + 20} 112`
  return (
    <svg viewBox="0 0 100 130" className={className} fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
        {/* finial */}
        <path d="M50 4 V12 M47 9 H53" strokeWidth="0.9" />
        <circle cx="50" cy="14" r="1.6" fill="currentColor" />
        {/* onion dome */}
        <path d="M50 16 C38 22 24 30 26 42 C27 48 34 50 50 50 C66 50 73 48 74 42 C76 30 62 22 50 16Z" strokeWidth="1.1" fill="currentColor" fillOpacity="0.12" />
        <path d="M50 18 C46 28 44 40 46 50 M50 18 C54 28 56 40 54 50 M50 18 V50" strokeWidth="0.5" opacity="0.7" />
        {/* drum and lotus band */}
        <path d="M30 50 H70 V55 H30Z" strokeWidth="0.9" />
        {[34, 40, 46, 52, 58, 64].map((x) => (
          <path key={x} d={`M${x} 55 q2 -4 4 0`} strokeWidth="0.5" />
        ))}
        {/* chhajja (sloping eave) */}
        <path d="M18 62 L30 55 H70 L82 62 Z" strokeWidth="1" fill="currentColor" fillOpacity="0.1" />
        <path d="M18 62 H82" strokeWidth="0.8" />
        {/* small corner kiosks */}
        <path d="M20 55 q4 -8 8 0 M72 55 q4 -8 8 0" strokeWidth="0.8" />
        {/* arches on columns */}
        {[19, 40, 61].map((x) => (
          <path key={x} d={arch(x)} strokeWidth="0.9" />
        ))}
        {[18, 39, 60, 81].map((x) => (
          <path key={x} d={`M${x} 62 V112 M${x + 2} 62 V112`} strokeWidth="0.6" />
        ))}
        {/* jaali hint inside centre arch */}
        <path d="M44 84 L56 96 M56 84 L44 96 M44 96 L56 108 M56 96 L44 108" strokeWidth="0.35" opacity="0.6" />
        {/* plinth and steps */}
        <path d="M14 112 H86 V117 H14Z" strokeWidth="0.9" />
        <path d="M10 117 H90 V122 H10Z M6 122 H94 V127 H6Z" strokeWidth="0.8" />
      </g>
    </svg>
  )
}

/** A short balustrade — the terrace rail from the card. */
export function Balustrade({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 30" preserveAspectRatio="none" className={className} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="0.8">
        <path d="M0 4 H200 M0 7 H200 M0 26 H200 M0 29 H200" />
        {Array.from({ length: 20 }, (_, i) => i * 10 + 5).map((x) => (
          <path key={x} d={`M${x} 7 C${x - 3} 12 ${x - 3} 16 ${x} 18 C${x + 3} 20 ${x + 3} 24 ${x} 26 M${x} 7 C${x + 3} 12 ${x + 3} 16 ${x} 18 C${x - 3} 20 ${x - 3} 24 ${x} 26`} />
        ))}
      </g>
    </svg>
  )
}

/**
 * The garden scene from the card, rebuilt in line: a chhatri, palms either
 * side, distant hills over still water, a sailboat, and the terrace rail.
 * Everything is `currentColor`, so it reads as gold foil on ivory or charcoal.
 */
export function GardenScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 240" className={className} fill="none" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* hills */}
        <path d="M0 150 Q40 118 80 136 Q120 100 170 128 Q215 96 260 126 Q300 108 340 130 Q370 120 400 138" strokeWidth="0.8" opacity="0.55" />
        <path d="M0 158 Q60 140 110 152 Q170 134 230 150 Q300 136 400 152" strokeWidth="0.6" opacity="0.4" />
        {/* water */}
        {[168, 176, 184, 192].map((y, i) => (
          <path key={y} d={`M${60 + i * 12} ${y} H${340 - i * 12}`} strokeWidth="0.5" opacity={0.5 - i * 0.08} strokeDasharray="14 8" />
        ))}
        {/* sailboat */}
        <path d="M222 166 Q234 172 248 166 Z" strokeWidth="0.9" fill="currentColor" fillOpacity="0.2" />
        <path d="M235 166 V132 M235 134 Q250 148 246 164 H235 M235 138 Q226 150 228 162 H235" strokeWidth="0.8" />
      </g>
      <Chhatri x="70" y="78" width="110" height="145" />
      <GoldPalm x="-18" y="40" width="120" height="190" />
      <GoldPalm x="262" y="96" width="70" height="120" />
      <g transform="translate(425 0) scale(-1 1)">
        <GoldPalm x="0" y="30" width="125" height="200" />
      </g>
      <svg x="0" y="206" width="400" height="30" viewBox="0 0 200 30" preserveAspectRatio="none">
        <Balustrade />
      </svg>
    </svg>
  )
}
