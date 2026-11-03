import type { CSSProperties, SVGProps } from 'react'
import { useDrawIn } from './Effects'

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
export function CuspedArch({
  className,
  double = true,
  draw = true,
}: {
  className?: string
  double?: boolean
  /** Draw the outline in on scroll; off where a static copy paints first */
  draw?: boolean
}) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 1.1, stagger: 0.1, enabled: draw })
  return (
    <svg
      ref={ref}
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

/** Deterministic per-palm tempo, so neighbouring palms sway out of step. */
let palmCount = 0
function nextSway() {
  const n = palmCount++
  return { dur: 5 + ((n * 37) % 23) / 10, delay: -((n * 53) % 41) / 10 }
}

/** The date palm from the card — the couple's emblem. */
export function GoldPalm({ className, ...props }: SVGProps<SVGSVGElement>) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 1.2, stagger: 0.004 })
  // Angles from vertical; every frond arcs up and over, then droops.
  const fronds = [-118, -95, -72, -50, -28, -10, 10, 28, 50, 72, 95, 118]
  const sway = nextSway()
  return (
    <svg ref={ref} viewBox="0 0 100 120" className={className} fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeLinecap="round">
        {/* trunk, gently curved, with ring marks */}
        <path d="M50 36 C48 60 52 86 47 112" strokeWidth="2.6" />
        {[46, 54, 62, 70, 78, 86, 94, 102].map((y) => (
          <path key={y} d={`M46.8 ${y} Q50 ${y + 1.6} 52.6 ${y - 1}`} strokeWidth="0.7" opacity="0.75" />
        ))}
        {/* The crown sways on the breeze, pivoting where it meets the trunk.
            Each palm gets its own tempo so a row never moves in unison. */}
        <g className="palm-sway" style={{ animationDuration: `${sway.dur}s`, animationDelay: `${sway.delay}s` }}>
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
        </g>
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
  const ref = useDrawIn<HTMLDivElement>({ duration: 1.2 })
  return (
    <div ref={ref} className={`lotus-divider flex items-center justify-center gap-4 ${className ?? ''}`} aria-hidden="true">
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
  const ref = useDrawIn<SVGSVGElement>({ duration: 1.2, stagger: 0.02 })
  const arch = (x: number) =>
    `M${x} 112 L${x} 84 Q${x} 72 ${x + 4} 70 Q${x + 6} 64 ${x + 10} 63 Q${x + 14} 64 ${x + 16} 70 Q${x + 20} 72 ${x + 20} 84 L${x + 20} 112`
  return (
    <svg ref={ref} viewBox="0 0 100 130" className={className} fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
        {/* finial */}
        <path d="M50 8 V12" strokeWidth="0.9" />
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
  const ref = useDrawIn<SVGSVGElement>({ duration: 1.3, stagger: 0.01 })
  return (
    <svg ref={ref} viewBox="0 0 400 240" className={className} fill="none" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* hills */}
        <path d="M0 150 Q40 118 80 136 Q120 100 170 128 Q215 96 260 126 Q300 108 340 130 Q370 120 400 138" strokeWidth="0.8" opacity="0.55" />
        <path d="M0 158 Q60 140 110 152 Q170 134 230 150 Q300 136 400 152" strokeWidth="0.6" opacity="0.4" />
        {/* water: the lines flow slowly toward the right */}
        {[168, 176, 184, 192].map((y, i) => (
          <path
            key={y}
            data-nodraw
            className="water-flow"
            style={{ animationDuration: `${7 + i * 2.5}s` }}
            d={`M${60 + i * 12} ${y} H${340 - i * 12}`}
            strokeWidth="0.5"
            opacity={0.5 - i * 0.08}
            strokeDasharray="14 8"
          />
        ))}
        {/* glints of light on the water */}
        {[
          [120, 172, 0],
          [205, 181, 1.3],
          [290, 175, 2.4],
          [160, 189, 3.1],
          [255, 190, 0.7],
        ].map(([x, y, d]) => (
          <path
            key={`${x}${y}`}
            data-nodraw
            className="water-glint"
            style={{ animationDelay: `${d}s` }}
            d={`M${x} ${y} h7`}
            strokeWidth="0.9"
          />
        ))}
        {/* sailboat: drifts across the lake and rocks on the swell */}
        <g className="boat-drift">
          <g className="boat-rock">
            <path d="M222 166 Q234 172 248 166 Z" strokeWidth="0.9" fill="currentColor" fillOpacity="0.2" />
            <path d="M235 166 V132 M235 134 Q250 148 246 164 H235 M235 138 Q226 150 228 162 H235" strokeWidth="0.8" />
          </g>
          {/* its reflection, broken by the water */}
          <path data-nodraw className="boat-reflect" d="M226 172 h18 M229 176 h12 M232 180 h6" strokeWidth="0.5" opacity="0.35" />
        </g>
      </g>
      <Chhatri x="70" y="78" width="110" height="145" />
      <GoldPalm x="-18" y="40" width="120" height="190" />
      <GoldPalm x="262" y="96" width="70" height="120" />
      <g transform="translate(425 0) scale(-1 1)">
        <GoldPalm x="0" y="30" width="125" height="200" />
      </g>
      {/* mist drifting low over the lake */}
      <defs>
        <filter id="garden-mist" x="-30%" y="-100%" width="160%" height="300%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <g data-nodraw filter="url(#garden-mist)" aria-hidden="true">
        <ellipse data-nodraw className="mist mist-a" cx="140" cy="160" rx="90" ry="7" fill="#e3d3ae" fillOpacity="0.18" />
        <ellipse data-nodraw className="mist mist-b" cx="280" cy="172" rx="110" ry="6" fill="#f8f5ef" fillOpacity="0.14" />
        <ellipse data-nodraw className="mist mist-c" cx="200" cy="150" rx="140" ry="5" fill="#e3d3ae" fillOpacity="0.1" />
      </g>
      <svg x="0" y="206" width="400" height="30" viewBox="0 0 200 30" preserveAspectRatio="none">
        <Balustrade />
      </svg>
    </svg>
  )
}

/** A five-petal blossom for the vines (the Ornaments one is module-private). */
function VineBlossom({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g className="blossom-turn" style={{ animationDelay: `${-((x * 7 + y * 3) % 23)}s` }}>
      {[0, 72, 144, 216, 288].map((d) => (
        <ellipse
          key={d}
          cx={x}
          cy={y - r * 0.55}
          rx={r * 0.32}
          ry={r * 0.55}
          transform={`rotate(${d} ${x} ${y})`}
          fill="currentColor"
          fillOpacity="0.18"
        />
      ))}
      <circle cx={x} cy={y} r={r * 0.22} fill="currentColor" />
    </g>
  )
}

/**
 * A tall flowering vine, as climbs the borders of the family's printed card:
 * a sinuous stem rising from a lotus, with leaves, curling tendrils and
 * blossoms branching off on alternate sides. Draws itself in on view and
 * sways very slightly from its root.
 */
export function FloralVine({ className, flip = false }: { className?: string; flip?: boolean }) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 1.6, stagger: 0.008 })
  const H = 600
  const stemX = (y: number) => 60 + 16 * Math.sin(y / 62)
  const stem = Array.from({ length: 61 }, (_, i) => {
    const y = H - 18 - i * 9.4
    return `${i ? 'L' : 'M'}${stemX(y).toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  const branches = Array.from({ length: 10 }, (_, i) => {
    const y = H - 70 - i * 52
    const x = stemX(y)
    const side = i % 2 ? -1 : 1
    return { x, y, side, big: i % 3 !== 1 }
  })
  return (
    <svg
      ref={ref}
      viewBox="0 0 120 600"
      className={className}
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <g className="vine-sway" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d={stem} strokeWidth="1.2" />
        {branches.map(({ x, y, side, big }, i) => {
          const ex = x + side * 34
          const ey = y - 26
          return (
            <g key={i}>
              {/* branch curling outward */}
              <path d={`M${x} ${y} Q${x + side * 18} ${y - 2} ${ex} ${ey}`} strokeWidth="0.9" />
              {/* two leaves on the branch */}
              <path
                d={`M${x + side * 10} ${y - 3} q${side * 6} -12 ${side * 16} -12 q${-side * 4} 10 ${-side * 16} 12z`}
                strokeWidth="0.7"
                fill="currentColor"
                fillOpacity="0.14"
              />
              <path
                d={`M${x + side * 4} ${y + 6} q${-side * 14} 2 ${-side * 18} 12 q${side * 12} 2 ${side * 18} -12z`}
                strokeWidth="0.7"
                fill="currentColor"
                fillOpacity="0.14"
              />
              {/* tendril */}
              <path
                d={`M${x} ${y - 18} q${-side * 12} -4 ${-side * 12} -14 q0 -6 ${side * 5} -6 q4 0 4 4`}
                strokeWidth="0.55"
                opacity="0.7"
              />
              {big ? <VineBlossom x={ex} y={ey} r={9} /> : <circle cx={ex} cy={ey} r="2.4" fill="currentColor" />}
            </g>
          )
        })}
        {/* crowning bud */}
        <path d="M44 22 q6 -14 0 -20 q-6 6 0 20z" strokeWidth="0.8" fill="currentColor" fillOpacity="0.25" />
        {/* lotus at the root */}
        <g strokeWidth="0.9">
          <path d="M60 584 q-6 -16 0 -26 q6 10 0 26z" fill="currentColor" fillOpacity="0.2" />
          <path d="M60 584 q-18 -4 -24 -18 q14 2 24 18z M60 584 q18 -4 24 -18 q-14 2 -24 18z" />
          <path d="M60 584 q-26 4 -36 -6 q18 -4 36 6z M60 584 q26 4 36 -6 q-18 -4 -36 6z" />
          <path d="M28 592 H92" strokeWidth="0.7" />
        </g>
      </g>
    </svg>
  )
}

/**
 * A peacock in gold line, from the card — standing on a lotus plinth, its
 * crested head raised and its long train of eyed feathers sweeping behind.
 * Faces right; flip it to face left. The train shimmers very softly.
 */
export function Peacock({ className, flip = false }: { className?: string; flip?: boolean }) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 0.9, stagger: 0.01 })
  // A full train fanning down and back along the ground
  const feathers = [
    { ex: 4, ey: 150 },
    { ex: 0, ey: 168 },
    { ex: 2, ey: 186 },
    { ex: 10, ey: 202 },
    { ex: 22, ey: 214 },
    { ex: 38, ey: 222 },
    { ex: 56, ey: 225 },
  ]
  return (
    <svg
      ref={ref}
      viewBox="0 0 200 230"
      className={className}
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* the train: eyed feathers sweeping down and back */}
        <g className="peacock-train">
          {feathers.map(({ ex, ey }, i) => (
            <g key={i}>
              <path d={`M78 150 C ${60 - i * 4} ${168 + i * 2}, ${ex + 30} ${ey - 10}, ${ex + 8} ${ey - 4}`} strokeWidth="0.8" />
              {[0.45, 0.75].map((t) => {
                const x = 78 + (ex + 8 - 78) * t
                const y = 150 + (ey - 4 - 150) * t + Math.sin(t * Math.PI) * 6
                return <path key={t} d={`M${x} ${y} l-5 3 M${x} ${y} l-3 -5`} strokeWidth="0.45" opacity="0.7" />
              })}
              <ellipse cx={ex + 8} cy={ey - 4} rx="7.5" ry="5.2" strokeWidth="0.8" transform={`rotate(-25 ${ex + 8} ${ey - 4})`} />
              <ellipse
                cx={ex + 8}
                cy={ey - 4}
                rx="3.2"
                ry="2.3"
                fill="currentColor"
                fillOpacity="0.55"
                transform={`rotate(-25 ${ex + 8} ${ey - 4})`}
              />
            </g>
          ))}
        </g>
        {/* body */}
        <path
          d="M74 150 C66 124 84 98 104 102 C124 106 128 136 112 156 C100 170 82 168 74 150Z"
          strokeWidth="1.1"
          fill="currentColor"
          fillOpacity="0.1"
        />
        {/* folded wing, scalloped */}
        <path d="M84 128 Q96 120 112 128 M86 138 Q98 130 114 138 M90 148 Q100 141 112 148" strokeWidth="0.6" opacity="0.8" />
        {/* neck, head and crest — a gentle nod */}
        <g className="peacock-head">
        {/* neck */}
        <path d="M100 104 C96 86 104 66 116 56" strokeWidth="1.1" />
        <path d="M112 108 C108 90 114 72 124 61" strokeWidth="1.1" />
        <path d="M104 92 q6 -2 12 0 M106 80 q6 -2 11 0" strokeWidth="0.45" opacity="0.6" />
        {/* head, beak, eye */}
        <circle cx="120" cy="54" r="6.5" strokeWidth="1.1" />
        <path d="M126 52 L134 54.5 L126 57" strokeWidth="0.9" />
        <circle cx="121.5" cy="52.5" r="1" fill="currentColor" />
        {/* crest */}
        {[
          [-4, -13],
          [0, -14],
          [4, -13],
        ].map(([dx, dy]) => (
          <g key={dx}>
            <path d={`M120 47 l${dx} ${dy}`} strokeWidth="0.6" />
            <circle cx={120 + dx} cy={47 + dy} r="1.5" fill="currentColor" />
          </g>
        ))}
        </g>
        {/* legs and feet */}
        <path d="M96 164 L94 186 M104 164 L106 186 M94 186 l-5 3 M94 186 l4 3 M106 186 l-4 3 M106 186 l5 3" strokeWidth="0.9" />
        {/* lotus plinth */}
        <path d="M100 196 q-5 -10 0 -16 q5 6 0 16z" fill="currentColor" fillOpacity="0.2" strokeWidth="0.8" />
        <path d="M100 196 q-16 -2 -22 -12 q12 0 22 12z M100 196 q16 -2 22 -12 q-12 0 -22 12z" strokeWidth="0.8" />
        <path d="M72 200 H128 M78 205 H122" strokeWidth="0.8" />
      </g>
    </svg>
  )
}

/**
 * A flowering spray arching out of a corner — the blossom branch in the top
 * corner of the family's card. Drawn for the top-left; rotate or flip it.
 */
export function BlossomSpray({ className, flip = false }: { className?: string; flip?: boolean }) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 1.5, stagger: 0.03 })
  return (
    <svg
      ref={ref}
      viewBox="0 0 160 160"
      className={className}
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <g className="spray-sway" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* main branch sweeping in from the corner, with a falling sprig */}
        <path d="M2 6 C40 10 74 22 104 50 C120 66 128 84 130 104" strokeWidth="1.1" />
        <path d="M58 20 C62 44 58 70 46 92" strokeWidth="0.8" />
        <path d="M96 44 C108 40 122 42 136 52" strokeWidth="0.7" />
        {/* leaves */}
        {[
          'M24 9 q10 -12 22 -8 q-10 9 -22 8z',
          'M40 14 q6 14 -2 24 q-6 -12 2 -24z',
          'M78 30 q14 -6 22 2 q-12 6 -22 -2z',
          'M88 40 q-4 14 -16 18 q2 -12 16 -18z',
          'M118 76 q12 2 16 12 q-12 0 -16 -12z',
          'M56 56 q-12 0 -16 10 q12 0 16 -10z',
          'M52 74 q10 4 12 14 q-10 -2 -12 -14z',
        ].map((d) => (
          <path key={d} d={d} strokeWidth="0.7" fill="currentColor" fillOpacity="0.16" />
        ))}
        <VineBlossom x={104} y={50} r={10} />
        <VineBlossom x={130} y={106} r={8} />
        <VineBlossom x={46} y={94} r={8} />
        <VineBlossom x={138} y={52} r={6} />
        {/* buds */}
        <path d="M66 22 q4 -8 0 -12 q-4 4 0 12z M120 92 q8 -2 10 -8 q-6 0 -10 8z" strokeWidth="0.7" fill="currentColor" fillOpacity="0.3" />
        <circle cx="30" cy="22" r="1.6" fill="currentColor" />
        <circle cx="36" cy="28" r="1.2" fill="currentColor" />
      </g>
    </svg>
  )
}

/**
 * A lotus medallion: an open lotus seated in a scalloped roundel — the crest
 * of the invitation card.
 */
export function LotusMedallion({ className }: { className?: string }) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 0.9, stagger: 0.02 })
  return (
    <svg ref={ref} viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* scalloped roundel, slowly turning */}
        <g className="medallion-turn">
        <path
          d={Array.from({ length: 16 }, (_, i) => {
            const a0 = (i / 16) * Math.PI * 2
            const a1 = ((i + 1) / 16) * Math.PI * 2
            const am = (a0 + a1) / 2
            const p = (a: number, r: number) => `${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`
            return `${i ? '' : `M${p(a0, 44)} `}Q${p(am, 49)} ${p(a1, 44)}`
          }).join(' ')}
          strokeWidth="0.9"
        />
        <circle cx="50" cy="50" r="39" strokeWidth="0.5" strokeDasharray="0.5 2.5" />
        </g>
        {/* lotus */}
        <path d="M50 22 C43 32 43 46 50 60 C57 46 57 32 50 22Z" strokeWidth="1" fill="currentColor" fillOpacity="0.22" />
        <path d="M50 60 C38 54 32 42 33 32 C41 37 47 47 50 60Z M50 60 C62 54 68 42 67 32 C59 37 53 47 50 60Z" strokeWidth="0.9" />
        <path d="M50 60 C34 60 24 52 20 44 C32 43 43 50 50 60Z M50 60 C66 60 76 52 80 44 C68 43 57 50 50 60Z" strokeWidth="0.8" />
        <path d="M30 66 Q50 72 70 66 M36 72 Q50 76 64 72" strokeWidth="0.7" />
      </g>
    </svg>
  )
}

/**
 * The lotus lake: distant hills over still water, lotus blooms and pads
 * floating, flowering shrubs at either bank and a terrace rail with urn
 * finials in front — the foot of the invitation card.
 */
export function LotusLake({ className }: { className?: string }) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 1.4, stagger: 0.01 })
  const blooms: [number, number, number][] = [
    [120, 132, 1],
    [210, 142, 1.2],
    [290, 128, 0.9],
    [160, 150, 0.8],
  ]
  return (
    <svg ref={ref} viewBox="0 0 400 210" className={className} fill="none" aria-hidden="true">
      <defs>
        <filter id="lake-mist" x="-30%" y="-150%" width="160%" height="400%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* hills */}
        <path d="M0 104 Q36 76 74 92 Q110 60 154 86 Q196 58 236 84 Q280 66 318 88 Q356 74 400 96" strokeWidth="0.8" opacity="0.55" />
        <path d="M0 112 Q70 96 130 108 Q200 92 270 106 Q340 96 400 108" strokeWidth="0.6" opacity="0.4" />
        {/* water */}
        {[118, 128, 138, 150, 162].map((y, i) => (
          <path
            key={y}
            data-nodraw
            className="water-flow"
            style={{ animationDuration: `${8 + i * 2}s` }}
            d={`M${40 + i * 6} ${y} H${360 - i * 6}`}
            strokeWidth="0.5"
            opacity={0.45 - i * 0.06}
            strokeDasharray="16 9"
          />
        ))}
        {/* lotus pads and blooms, bobbing on the water */}
        {blooms.map(([x, y, s], i) => (
          <g key={x} className="lotus-bob" style={{ animationDelay: `${-i * 1.1}s` }}>
            <ellipse cx={x + 10 * s} cy={y + 4 * s} rx={9 * s} ry={2.6 * s} strokeWidth="0.6" />
            <path
              d={`M${x} ${y} q${-3 * s} ${-6 * s} 0 ${-11 * s} q${3 * s} ${5 * s} 0 ${11 * s}z M${x} ${y} q${-8 * s} ${-2 * s} ${-9 * s} ${-8 * s} q${6 * s} 1 ${9 * s} ${8 * s}z M${x} ${y} q${8 * s} ${-2 * s} ${9 * s} ${-8 * s} q${-6 * s} 1 ${-9 * s} ${8 * s}z`}
              strokeWidth="0.7"
              fill="currentColor"
              fillOpacity="0.2"
            />
          </g>
        ))}
        {/* flowering shrubs on either bank */}
        {[
          [10, 1],
          [390, -1],
        ].map(([x0, d]) => (
          <g key={x0} className="shrub-sway" style={{ transformOrigin: `${x0}px 178px`, animationDelay: `${d * -1.7}s` }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${x0} 178 Q${x0 + d * (6 + i * 7)} ${150 - i * 6} ${x0 + d * (10 + i * 9)} ${126 - i * 4}`}
                strokeWidth="0.8"
              />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={`l${i}`}
                d={`M${x0 + d * (8 + i * 8)} ${150 - i * 5} q${d * 8} -6 ${d * 14} -2 q${-d * 6} 6 ${-d * 14} 2z`}
                strokeWidth="0.6"
                fill="currentColor"
                fillOpacity="0.15"
              />
            ))}
          </g>
        ))}
        <VineBlossom x={24} y={124} r={7} />
        <VineBlossom x={46} y={112} r={6} />
        <VineBlossom x={376} y={124} r={7} />
        <VineBlossom x={354} y={112} r={6} />
        {/* mist drifting low over the water */}
        <g data-nodraw filter="url(#lake-mist)" stroke="none">
          <ellipse className="mist mist-a" cx="150" cy="122" rx="90" ry="6" fill="currentColor" fillOpacity="0.14" />
          <ellipse className="mist mist-b" cx="270" cy="140" rx="100" ry="5" fill="currentColor" fillOpacity="0.12" />
        </g>
        {/* terrace rail with urn finials */}
        <path d="M0 176 H400 M0 180 H400 M0 200 H400 M0 204 H400" strokeWidth="0.8" />
        {Array.from({ length: 39 }, (_, i) => 10 + i * 10).map((x) => (
          <path key={x} d={`M${x} 180 C${x - 3} 185 ${x - 3} 189 ${x} 191 C${x + 3} 193 ${x + 3} 197 ${x} 200 M${x} 180 C${x + 3} 185 ${x + 3} 189 ${x} 191 C${x - 3} 193 ${x - 3} 197 ${x} 200`} strokeWidth="0.6" />
        ))}
        {[60, 200, 340].map((x) => (
          <g key={x} strokeWidth="0.9">
            <path d={`M${x - 7} 176 V168 H${x + 7} V176`} />
            <path d={`M${x - 6} 168 Q${x - 9} 160 ${x - 4} 156 H${x + 4} Q${x + 9} 160 ${x + 6} 168 M${x} 156 V151`} fill="currentColor" fillOpacity="0.15" />
            <circle cx={x} cy={149} r="1.8" fill="currentColor" />
          </g>
        ))}
      </g>
    </svg>
  )
}

/**
 * A Mughal palace on the skyline: a great onion dome over an arched iwan,
 * flanking half-domes and chhatris, four slender minarets — the footer's
 * farewell view. Wide (800×200); sits on a rail.
 */
export function PalaceSkyline({ className }: { className?: string }) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 1.8, stagger: 0.012 })
  const minaret = (x: number, h: number) => (
    <g key={x}>
      <path d={`M${x - 5} 196 V${196 - h} M${x + 5} 196 V${196 - h}`} strokeWidth="0.9" />
      {[0.35, 0.65].map((t) => (
        <path key={t} d={`M${x - 8} ${196 - h * t} H${x + 8} M${x - 7} ${196 - h * t + 3} H${x + 7}`} strokeWidth="0.6" />
      ))}
      <path d={`M${x - 7} ${196 - h} H${x + 7} M${x - 6} ${196 - h} Q${x - 7} ${186 - h} ${x} ${180 - h} Q${x + 7} ${186 - h} ${x + 6} ${196 - h}`} strokeWidth="0.8" />
      <path d={`M${x} ${180 - h} V${174 - h}`} strokeWidth="0.7" />
    </g>
  )
  const chhatri = (x: number, y: number, w: number) => (
    <g key={x}>
      <path d={`M${x - w} ${y} H${x + w} M${x - w + 2} ${y} V${y + w * 1.1} M${x + w - 2} ${y} V${y + w * 1.1}`} strokeWidth="0.7" />
      <path d={`M${x - w} ${y} Q${x - w} ${y - w * 1.2} ${x} ${y - w * 1.6} Q${x + w} ${y - w * 1.2} ${x + w} ${y}`} strokeWidth="0.8" />
      <path d={`M${x} ${y - w * 1.6} V${y - w * 2}`} strokeWidth="0.6" />
    </g>
  )
  return (
    <svg ref={ref} viewBox="0 0 800 200" className={className} fill="none" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* platform */}
        <path d="M150 196 H650 M170 190 H630" strokeWidth="0.8" />
        {/* main block with arcade */}
        <path d="M250 190 V112 H550 V190" strokeWidth="0.9" />
        {Array.from({ length: 5 }, (_, i) => 268 + i * 26).concat(Array.from({ length: 5 }, (_, i) => 428 + i * 26)).map((x) => (
          <path key={x} d={`M${x} 190 V160 Q${x} 150 ${x + 4} 148 Q${x + 8} 142 ${x + 9} 141 Q${x + 10} 142 ${x + 14} 148 Q${x + 18} 150 ${x + 18} 160 V190`} strokeWidth="0.6" />
        ))}
        {/* central iwan */}
        <path d="M368 190 V112 H432 V190" strokeWidth="0.9" />
        <path d="M378 190 V140 Q378 124 388 118 Q394 108 400 106 Q406 108 412 118 Q422 124 422 140 V190" strokeWidth="0.9" />
        <path d="M388 190 V152 Q400 136 412 152 V190" strokeWidth="0.6" opacity="0.7" />
        {/* drum and great onion dome */}
        <path d="M360 112 V100 H440 V112" strokeWidth="0.8" />
        <path d="M362 100 C350 76 368 52 400 40 C432 52 450 76 438 100 Z" strokeWidth="1.1" fill="currentColor" fillOpacity="0.08" />
        <path d="M400 40 V100 M382 46 Q376 72 384 100 M418 46 Q424 72 416 100" strokeWidth="0.45" opacity="0.6" />
        <path d="M400 40 V32" strokeWidth="0.8" />
        {/* flanking domes */}
        {[300, 500].map((x) => (
          <g key={x}>
            <path d={`M${x - 26} 112 V104 H${x + 26} V112`} strokeWidth="0.7" />
            <path d={`M${x - 24} 104 C${x - 30} 88 ${x - 18} 74 ${x} 68 C${x + 18} 74 ${x + 30} 88 ${x + 24} 104 Z`} strokeWidth="0.9" fill="currentColor" fillOpacity="0.06" />
            <path d={`M${x} 68 V60`} strokeWidth="0.7" />
          </g>
        ))}
        {chhatri(262, 112, 10)}
        {chhatri(538, 112, 10)}
        {/* minarets */}
        {minaret(200, 120)}
        {minaret(232, 92)}
        {minaret(568, 92)}
        {minaret(600, 120)}
        {/* reflecting water channel */}
        <path data-nodraw className="water-flow" d="M190 199 H610" strokeWidth="0.5" strokeDasharray="12 8" opacity="0.5" />
      </g>
    </svg>
  )
}

/** A hanging Mughal lantern — the footer's crest, a light left burning. */
export function Lantern({ className }: { className?: string }) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 1.4, stagger: 0.06 })
  return (
    <svg ref={ref} viewBox="0 0 60 120" className={className} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 0 V14" strokeWidth="0.8" />
        <circle cx="30" cy="16" r="2.4" strokeWidth="0.8" />
        <path d="M22 26 Q30 16 38 26 Z" strokeWidth="0.9" fill="currentColor" fillOpacity="0.2" />
        <path d="M18 30 H42 M20 26 H40" strokeWidth="0.9" />
        {/* body: cusped panes */}
        <path d="M18 30 Q14 52 20 74 H40 Q46 52 42 30" strokeWidth="1" />
        <path d="M30 30 V74 M24 30 Q21 52 25 74 M36 30 Q39 52 35 74" strokeWidth="0.5" opacity="0.7" />
        <path d="M22 44 Q26 38 30 44 Q34 38 38 44" strokeWidth="0.6" />
        {/* glowing flame */}
        <path className="lantern-flame" d="M30 64 q-4 -6 0 -12 q4 6 0 12z" fill="currentColor" fillOpacity="0.55" strokeWidth="0.6" />
        <path d="M20 74 H40 L36 82 H24 Z" strokeWidth="0.9" fill="currentColor" fillOpacity="0.15" />
        <path d="M30 82 V92 M27 94 Q30 100 33 94" strokeWidth="0.8" />
        <circle cx="30" cy="102" r="1.8" fill="currentColor" />
      </g>
    </svg>
  )
}

/**
 * A toran: a festive garland of swags hung across a doorway, with blossoms at
 * the knots and tasselled drops between — strung across the top of each arch.
 */
export function Toran({ className }: { className?: string }) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 0.8, stagger: 0.01 })
  const knots = [0, 40, 80, 120, 160, 200]
  return (
    <svg ref={ref} viewBox="0 0 200 60" className={className} fill="none" aria-hidden="true" preserveAspectRatio="none">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {knots.slice(0, -1).map((x) => (
          <g key={x}>
            <path d={`M${x} 6 Q${x + 20} 30 ${x + 40} 6`} strokeWidth="0.9" />
            <path d={`M${x + 4} 8 Q${x + 20} 24 ${x + 36} 8`} strokeWidth="0.5" opacity="0.6" />
            {/* tasselled drop at the low point of the swag, swinging */}
            <g className="tassel-swing" style={{ transformOrigin: `${x + 20}px 18px`, animationDelay: `${-x / 40}s` }}>
            <path d={`M${x + 20} 18 V30`} strokeWidth="0.6" />
            <path d={`M${x + 20} 30 q-3 5 0 10 q3 -5 0 -10z`} strokeWidth="0.6" fill="currentColor" fillOpacity="0.3" />
            <path d={`M${x + 18} 42 l-1 5 M${x + 20} 42 v6 M${x + 22} 42 l1 5`} strokeWidth="0.4" />
            </g>
          </g>
        ))}
        {knots.map((x) => (
          <VineBlossom key={x} x={x} y={6} r={5} />
        ))}
      </g>
    </svg>
  )
}

/**
 * A cypress (sarv) — the tall, flame-shaped tree that lines every Mughal
 * garden, drawn as layered tiers of foliage on a slim trunk.
 */
export function Cypress({ className }: { className?: string }) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 0.8, stagger: 0.01 })
  return (
    <svg ref={ref} viewBox="0 0 60 200" className={className} fill="none" aria-hidden="true">
      <g className="cypress-sway" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* flame silhouette */}
        <path d="M30 4 C22 30 12 70 12 120 C12 150 20 168 30 172 C40 168 48 150 48 120 C48 70 38 30 30 4Z" strokeWidth="1" fill="currentColor" fillOpacity="0.08" />
        {/* foliage tiers */}
        {[30, 52, 74, 96, 118, 140, 158].map((y, i) => {
          const w = 6 + i * 2.6
          return <path key={y} d={`M${30 - w} ${y + 6} Q30 ${y - 4} ${30 + w} ${y + 6}`} strokeWidth="0.6" opacity="0.75" />
        })}
        <path d="M30 20 V172" strokeWidth="0.5" opacity="0.5" />
        {/* trunk and ground */}
        <path d="M28 172 V192 M32 172 V192" strokeWidth="0.9" />
        <path d="M14 194 Q30 188 46 194" strokeWidth="0.8" />
      </g>
    </svg>
  )
}

/** An urn of flowers on a little foot — set at the base of each arch. */
export function FlowerUrn({ className, flip = false }: { className?: string; flip?: boolean }) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 0.8, stagger: 0.01 })
  return (
    <svg
      ref={ref}
      viewBox="0 0 80 100"
      className={className}
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <g className="urn-flowers">
        {/* stems */}
        <path d="M40 58 C38 44 30 34 22 26 M40 58 C41 42 44 30 46 18 M40 58 C44 46 54 38 62 34 M40 58 C36 50 28 48 18 46" strokeWidth="0.8" />
        {/* leaves */}
        {['M30 40 q-10 -2 -12 -10 q8 2 12 10z', 'M44 36 q8 -6 14 -4 q-6 6 -14 4z', 'M36 48 q-8 4 -14 0 q6 -4 14 0z', 'M48 46 q6 6 4 12 q-6 -4 -4 -12z'].map((d) => (
          <path key={d} d={d} strokeWidth="0.6" fill="currentColor" fillOpacity="0.15" />
        ))}
        <VineBlossom x={22} y={26} r={7} />
        <VineBlossom x={46} y={16} r={8} />
        <VineBlossom x={62} y={34} r={6} />
        <VineBlossom x={18} y={46} r={5} />
        </g>
        {/* urn */}
        <path d="M24 58 H56 M26 58 Q22 72 32 80 H48 Q58 72 54 58" strokeWidth="1" fill="currentColor" fillOpacity="0.1" />
        <path d="M28 66 Q40 70 52 66" strokeWidth="0.5" opacity="0.7" />
        <path d="M34 80 V86 H46 V80 M28 90 H52 M30 86 H50" strokeWidth="0.9" />
      </g>
    </svg>
  )
}

/** A carved plinth with a band of lotus buds — what the arches stand on. */
export function LotusPlinth({ className }: { className?: string }) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 0.7, stagger: 0.004 })
  return (
    <svg ref={ref} viewBox="0 0 400 30" className={className} fill="none" aria-hidden="true" preserveAspectRatio="none">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 2 H400 M6 6 H394 M0 26 H400 M10 29 H390" strokeWidth="0.8" />
        {Array.from({ length: 33 }, (_, i) => 8 + i * 12).map((x) => (
          <path key={x} d={`M${x} 22 q-4 -6 0 -12 q4 6 0 12z M${x} 22 q-6 -1 -7 -6 q5 1 7 6z M${x} 22 q6 -1 7 -6 q-5 1 -7 6z`} strokeWidth="0.5" fill="currentColor" fillOpacity="0.15" />
        ))}
      </g>
    </svg>
  )
}
