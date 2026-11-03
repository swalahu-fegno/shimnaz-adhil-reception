import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { cn } from '../../utils/cn'

/* ============================================================================
 * MICRO-INTERACTIONS
 *
 * Small, hand-made moments that make the invitation feel alive: petals that
 * scatter from a tap, ornaments that draw themselves in gold as they arrive,
 * and cards that tilt toward the pointer with light pooling under it.
 *
 * All of it is plain DOM + CSS transforms (compositor-only), and all of it
 * switches off for prefers-reduced-motion.
 * ========================================================================== */

const PETAL_COLOURS = ['#d1b47a', '#e3d3ae', '#b0925a', '#f8f5ef']

/**
 * Scatter gold petals from a point on the screen. Each petal is a short-lived
 * span animated by the Web Animations API, removed when it lands.
 */
export function burstPetals(x: number, y: number, count = 8, spread = 70) {
  if (typeof document === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span')
    const size = 5 + Math.random() * 6
    const angle = Math.random() * Math.PI * 2
    const dist = spread * (0.45 + Math.random() * 0.75)
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist * 0.7 - spread * 0.35
    const fall = spread * (0.6 + Math.random() * 0.8)
    Object.assign(el.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size * 0.66}px`,
      borderRadius: '100% 0',
      background: PETAL_COLOURS[i % PETAL_COLOURS.length],
      boxShadow: '0 0 6px rgba(209,180,122,0.55)',
      pointerEvents: 'none',
      zIndex: '200',
    } satisfies Partial<CSSStyleDeclaration>)
    document.body.appendChild(el)
    const spin = (Math.random() - 0.5) * 720
    el.animate(
      [
        { transform: 'translate(-50%,-50%) rotate(0deg) scale(0.4)', opacity: 0 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${spin / 2}deg) scale(1)`, opacity: 1, offset: 0.35 },
        { transform: `translate(calc(-50% + ${dx * 1.3}px), calc(-50% + ${dy + fall}px)) rotate(${spin}deg) scale(0.8)`, opacity: 0 },
      ],
      { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    ).onfinish = () => el.remove()
  }
}

/**
 * A small petal flurry wherever the guest taps or clicks — the page answers
 * every touch. Skips taps on form fields so it never gets in the way.
 */
export function TapPetals() {
  const prefersReduced = useReducedMotion()
  useEffect(() => {
    if (prefersReduced) return
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, select, iframe')) return
      burstPetals(e.clientX, e.clientY, 7, 46)
    }
    window.addEventListener('pointerdown', onDown, { passive: true })
    return () => window.removeEventListener('pointerdown', onDown)
  }, [prefersReduced])
  return null
}

/**
 * Strokes draw themselves in, one after another, the first time the element
 * scrolls into view — like a calligrapher's pen — then fills fade up.
 * `when` holds the drawing back (e.g. until the doors have opened).
 */
export function useDrawIn<T extends Element>({
  duration = 1.6,
  stagger = 0.06,
  when = true,
  enabled = true,
}: { duration?: number; stagger?: number; when?: boolean; enabled?: boolean } = {}) {
  const ref = useRef<T>(null)
  const prefersReduced = useReducedMotion()
  const prepared = useRef<{ strokes: SVGGeometryElement[]; fills: SVGElement[] } | null>(null)

  // Hide the strokes once, on mount, so nothing flashes before it draws.
  useEffect(() => {
    const root = ref.current
    if (!root || !enabled || prefersReduced || prepared.current) return
    const strokes = [...root.querySelectorAll<SVGGeometryElement>('path, circle, ellipse, rect, line, polyline, polygon')].filter(
      (el) =>
        !el.closest('[data-nodraw]') && getComputedStyle(el).stroke !== 'none' && typeof el.getTotalLength === 'function',
    )
    const fills = [...root.querySelectorAll<SVGElement>('[fill]:not([fill="none"])')].filter((el) => !el.closest('[data-nodraw]'))
    strokes.forEach((el) => {
      const len = Math.ceil(el.getTotalLength()) || 1
      el.style.strokeDasharray = `${len}`
      el.style.strokeDashoffset = `${len}`
    })
    fills.forEach((el) => (el.style.fillOpacity = '0'))
    prepared.current = { strokes, fills }
  }, [prefersReduced, enabled])

  useEffect(() => {
    const root = ref.current
    const p = prepared.current
    if (!root || !p || !when) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        // Cap the cascade: ornaments with hundreds of strokes (palms) would
        // otherwise take many seconds to finish.
        const spread = Math.min(p.strokes.length * stagger, 0.8)
        const delayOf = (i: number) => (p.strokes.length > 1 ? (i / (p.strokes.length - 1)) * spread : 0)
        p.strokes.forEach((el, i) => {
          el.style.transition = `stroke-dashoffset ${duration}s cubic-bezier(0.65,0,0.35,1) ${delayOf(i)}s`
          el.style.strokeDashoffset = '0'
        })
        const fillDelay = duration * 0.6 + spread * 0.6
        p.fills.forEach((el) => {
          el.style.transition = `fill-opacity 0.8s ease ${fillDelay}s`
          el.style.fillOpacity = ''
        })
        // Drop the dash once drawn: non-scaling strokes measure dashes in
        // screen units, so a leftover dasharray could leave gaps when scaled.
        window.setTimeout(
          () => p.strokes.forEach((el) => {
            el.style.strokeDasharray = ''
            el.style.strokeDashoffset = ''
            el.style.transition = ''
          }),
          (duration + spread) * 1000 + 100,
        )
      },
      { threshold: 0.2 },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [when, duration, stagger])

  return ref
}

/** Wrapper form of useDrawIn for ornaments that don't take a ref. */
export function DrawOnView({
  children,
  className,
  duration,
  stagger,
  when,
}: {
  children: ReactNode
  className?: string
  duration?: number
  stagger?: number
  when?: boolean
}) {
  const ref = useDrawIn<HTMLDivElement>({ duration, stagger, when })
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/**
 * Tilt toward the pointer, with a pool of gold light following it across the
 * surface. Pointer devices only — on touch it is a plain container.
 */
export function TiltGlow({
  children,
  className,
  max = 6,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced || !window.matchMedia('(hover: hover)').matches) return
    let frame = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        el.style.setProperty('--gx', `${px * 100}%`)
        el.style.setProperty('--gy', `${py * 100}%`)
        el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg)`
      })
    }
    const onLeave = () => {
      cancelAnimationFrame(frame)
      el.style.transform = ''
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [prefersReduced, max])

  return (
    <div ref={ref} className={cn('tilt-glow relative h-full', className)}>
      {children}
      <span className="tilt-glow-light pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
    </div>
  )
}
