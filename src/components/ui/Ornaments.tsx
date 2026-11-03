import type { SVGProps } from 'react'
import { cn } from '../../utils/cn'
import { cuspedArchPath } from './Mughal'
import { useDrawIn } from './Effects'

/* ============================================================================
 * ORNAMENT LIBRARY — Mughal court
 *
 * The decorative language of this invitation, drawn from Mughal pietra dura
 * and the family's printed card: lotus medallions, the three-petal fleur
 * scattered across the card, flowering vines along its borders, and the
 * cusped arch of every palace window.
 *
 * Everything inherits `currentColor` and scales cleanly. Export names are
 * kept stable so every section picks the set up without call-site changes.
 * ========================================================================== */

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const
}

/** Pointed (ogee) petal from the centre outward, rotated to `deg`. */
function petal(cx: number, cy: number, r0: number, r1: number, w: number, deg: number) {
  const [x0, y0] = polar(cx, cy, r0, deg)
  const [x1, y1] = polar(cx, cy, r1, deg)
  const [lx, ly] = polar(cx, cy, (r0 + r1) / 2, deg - w)
  const [rx, ry] = polar(cx, cy, (r0 + r1) / 2, deg + w)
  const f = (n: number) => n.toFixed(2)
  return `M${f(x0)} ${f(y0)} Q${f(lx)} ${f(ly)} ${f(x1)} ${f(y1)} Q${f(rx)} ${f(ry)} ${f(x0)} ${f(y0)}Z`
}

/** A five-petal blossom, as in the card's border vines. */
function Blossom({ x, y, r, filled = false }: { x: number; y: number; r: number; filled?: boolean }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((d) => (
        <path key={d} d={petal(x, y, r * 0.25, r, 26, d)} fill={filled ? 'currentColor' : 'none'} fillOpacity="0.25" />
      ))}
      <circle cx={x} cy={y} r={r * 0.22} fill="currentColor" stroke="none" />
    </g>
  )
}

/* -- Lotus medallion: the signature mark ------------------------------------ */

interface KhatimProps extends SVGProps<SVGSVGElement> {
  /** Draw the enclosing rings */
  rings?: boolean
  strokeWidth?: number
}

/**
 * Lotus medallion — two tiers of pointed petals inside beaded rings, the
 * rosette found on Mughal ceilings and jharokha soffits.
 */
export function Khatim({ rings = true, strokeWidth = 1, className, ...props }: KhatimProps) {
  const outer = Array.from({ length: 12 }, (_, i) => i * 30)
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className={className} {...props}>
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round">
        {outer.map((d) => (
          <path key={d} d={petal(50, 50, 12, 38, 9, d)} />
        ))}
        {outer.map((d) => (
          <path key={`i${d}`} d={petal(50, 50, 8, 24, 10, d + 15)} opacity="0.6" />
        ))}
        <circle cx="50" cy="50" r="8" />
        <circle cx="50" cy="50" r="3" fill="currentColor" stroke="none" />
        {rings && (
          <>
            <circle cx="50" cy="50" r="42" opacity="0.5" />
            <circle cx="50" cy="50" r="46.5" opacity="0.3" strokeDasharray="0.6 2.4" strokeLinecap="round" />
          </>
        )}
      </g>
    </svg>
  )
}

/* -- Fleur (buta): the small mark scattered across the card ----------------- */

export function StarEight({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <g stroke="currentColor" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
        <path d="M12 2 Q15 7 12 13 Q9 7 12 2Z" fill="currentColor" fillOpacity="0.35" />
        <path d="M12 13 Q6 13 4.5 8.5 Q8 9 12 13Z M12 13 Q18 13 19.5 8.5 Q16 9 12 13Z" />
        <path d="M12 13 V20 M8.5 17 Q12 15.5 15.5 17 M10 21.5 H14" />
      </g>
    </svg>
  )
}

/** A tiny pointed bud — the smallest unit of punctuation. */
export function Lozenge({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={className} {...props}>
      <path d="M6 0.5 Q10 6 6 11.5 Q2 6 6 0.5Z" fill="currentColor" />
    </svg>
  )
}

/* -- Dividers -------------------------------------------------------------- */

interface DividerProps {
  className?: string
  /** 'star' centres a fleur; 'lozenge' is three buds; 'plain' is a bare rule */
  variant?: 'star' | 'lozenge' | 'plain'
  width?: string
}

export function Divider({ className, variant = 'star', width = '100%' }: DividerProps) {
  return (
    <div
      className={cn('flex items-center justify-center gap-4 text-gold', className)}
      style={{ width }}
      role="presentation"
    >
      <span className="rule-fade h-px flex-1" />
      {variant === 'star' && <StarEight className="h-5 w-5 shrink-0" />}
      {variant === 'lozenge' && (
        <span className="flex shrink-0 items-center gap-1.5">
          <Lozenge className="h-1.5 w-1.5 opacity-50" />
          <Lozenge className="h-2.5 w-2.5" />
          <Lozenge className="h-1.5 w-1.5 opacity-50" />
        </span>
      )}
      <span className="rule-fade h-px flex-1" />
    </div>
  )
}

/** Flowering vine either side of a fleur in a cusped cartouche. */
export function ArabesqueDivider({ className }: { className?: string }) {
  const leaves = [40, 70, 100, 130, 160]
  const ref = useDrawIn<HTMLDivElement>({ duration: 1.8, stagger: 0.03 })
  return (
    <div ref={ref} className={cn('relative flex w-full items-center justify-center text-gold', className)}>
      <svg viewBox="0 0 400 40" fill="none" className="h-9 w-full max-w-md" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round">
          {[1, -1].map((dir) => (
            <g key={dir} transform={dir < 0 ? 'translate(400 0) scale(-1 1)' : undefined}>
              <path d="M20 20 Q100 14 176 20" opacity="0.7" />
              {leaves.map((x, i) => (
                <path
                  key={x}
                  d={i % 2 ? `M${x} 18 q6 -9 14 -8 q-5 7 -14 8Z` : `M${x} 19 q6 9 14 8 q-5 -7 -14 -8Z`}
                  fill="currentColor"
                  fillOpacity="0.2"
                />
              ))}
              <Blossom x={58} y={11} r={4.5} />
              <Blossom x={118} y={28} r={4.5} />
            </g>
          ))}
          <path d="M184 30 V20 Q184 12 190 11 Q192 6 200 4 Q208 6 210 11 Q216 12 216 20 V30 Z" opacity="0.8" />
        </g>
      </svg>
      <StarEight className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-[35%]" />
    </div>
  )
}

/* -- Corner vine ------------------------------------------------------------ */

/**
 * A flowering corner from the card's border: double rule, a cusped bracket,
 * and a vine of blossoms and leaves. Rotate at the call site for each corner.
 */
export function CornerFlourish({ className, ...props }: SVGProps<SVGSVGElement>) {
  const ref = useDrawIn<SVGSVGElement>({ duration: 1.8, stagger: 0.05 })
  return (
    <svg ref={ref} viewBox="0 0 120 120" fill="none" aria-hidden="true" className={className} {...props}>
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 0 H60 M0 0 V60" opacity="0.6" />
        <path d="M6 6 H44 M6 6 V44" opacity="0.35" />
        {/* cusped bracket */}
        <path d="M6 30 Q14 30 16 22 Q22 22 22 16 Q30 14 30 6" opacity="0.8" />
        {/* vine */}
        <path d="M12 12 C30 22 40 36 44 58 M12 12 C22 30 36 40 58 44" />
        <path d="M30 26 q8 -8 16 -6 q-6 7 -16 6Z M26 30 q-8 8 -6 16 q7 -6 6 -16Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M40 46 q9 -3 13 -11 q-9 2 -13 11Z" fill="currentColor" fillOpacity="0.2" />
        <Blossom x={14} y={14} r={7} filled />
        <Blossom x={46} y={62} r={5} />
        <Blossom x={62} y={46} r={5} />
      </g>
    </svg>
  )
}

/** Double rule with a flowering vine at each corner — the Hero's frame. */
export function OrnateFrame({ className, inset = 'inset-4' }: { className?: string; inset?: string }) {
  const corners = [
    { rotate: 0, pos: 'top-0 left-0' },
    { rotate: 90, pos: 'top-0 right-0' },
    { rotate: 180, pos: 'bottom-0 right-0' },
    { rotate: 270, pos: 'bottom-0 left-0' },
  ]
  return (
    <div className={cn('pointer-events-none absolute', inset, className)} aria-hidden="true">
      <div className="relative h-full w-full">
        <div className="absolute inset-0 border border-current opacity-30" />
        <div className="absolute inset-[6px] border border-current opacity-15" />
        {corners.map((c) => (
          <CornerFlourish
            key={c.rotate}
            className={cn('absolute h-16 w-16 md:h-24 md:w-24', c.pos)}
            style={{ transform: `rotate(${c.rotate}deg)` }}
          />
        ))}
      </div>
    </div>
  )
}

/* -- Fan motif pattern (tiling background) --------------------------------- */

/**
 * The client's embossed gold fan motif, drawn at unit size (0..20 x 0..18):
 * five rounded petals fanning upward from a curled base.
 */
function FanMotif({ x, y, s }: { x: number; y: number; s: number }) {
  const k = s / 20
  return (
    <g transform={`translate(${x - 10 * k} ${y - 9 * k}) scale(${k})`} fill="currentColor">
      <ellipse cx="10" cy="4.2" rx="1.5" ry="3.4" />
      <ellipse cx="10" cy="4.2" rx="1.5" ry="3.4" transform="rotate(-34 10 12)" />
      <ellipse cx="10" cy="4.2" rx="1.5" ry="3.4" transform="rotate(34 10 12)" />
      <ellipse cx="10" cy="5" rx="1.3" ry="3" transform="rotate(-66 10 12)" />
      <ellipse cx="10" cy="5" rx="1.3" ry="3" transform="rotate(66 10 12)" />
      <circle cx="10" cy="12" r="1.6" />
      <path
        d="M3 14.5 Q6 12.2 10 14.2 Q14 12.2 17 14.5 Q14 13.8 10 16 Q6 13.8 3 14.5Z"
        fillOpacity="0.85"
      />
    </g>
  )
}

/**
 * Staggered field of fan motifs as an SVG <pattern> — the ground of the
 * client's invitation. Each instance needs a unique id or the defs collide
 * across mounts — hence the required `id` prop.
 */
function MotifPattern({
  id,
  className,
  scale,
  opacity,
}: {
  id: string
  className?: string
  scale: number
  opacity: number
}) {
  const s = scale * 0.26
  return (
    <svg className={className} aria-hidden="true" width="100%" height="100%">
      <defs>
        <pattern id={id} width={scale} height={scale} patternUnits="userSpaceOnUse">
          <g opacity={opacity * 2}>
            <FanMotif x={0} y={0} s={s} />
            <FanMotif x={scale} y={0} s={s} />
            <FanMotif x={0} y={scale} s={s} />
            <FanMotif x={scale} y={scale} s={s} />
            <FanMotif x={scale / 2} y={scale / 2} s={s} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

/** Kept under its old name so every section picks up the new motif. */
export function GirihPattern({
  id,
  className,
  scale = 60,
  opacity = 0.5,
}: {
  id: string
  className?: string
  scale?: number
  opacity?: number
}) {
  return <MotifPattern id={id} className={className} scale={scale * 1.3} opacity={opacity} />
}

export function LatticePattern({
  id,
  className,
  scale = 48,
  opacity = 0.45,
}: {
  id: string
  className?: string
  scale?: number
  opacity?: number
}) {
  return <MotifPattern id={id} className={className} scale={scale * 1.5} opacity={opacity} />
}

/* -- Arch (mihrab silhouette) ---------------------------------------------- */

/**
 * Cusped Mughal arch used to frame portraits. Returned as a path string so it
 * can serve double duty as a clip-path.
 */
export { cuspedArchPath as archPath } from './Mughal'

export function ArchFrame({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 280"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d={cuspedArchPath(200, 280)}
        stroke="currentColor"
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/* -- Crescent + star (small, restrained) ----------------------------------- */

export function Crescent({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        d="M17.5 3.2A9.4 9.4 0 1 0 20.8 15 7.6 7.6 0 1 1 17.5 3.2Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}
