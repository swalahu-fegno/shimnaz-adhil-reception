import { useCallback, useEffect, useRef, useState } from 'react'
import { bride, groom } from '../../data/wedding'

interface PreloaderProps {
  /** Fires on the earliest user interaction that indicates they are opening. */
  onMusicIntent: () => void
  /** Fires as the envelope dissolves — the invitation underneath must show now. */
  onOpenStart: () => void
  /** Fires once the envelope has gone and this screen can retire. */
  onOpen: () => void
}

type Stage = 'idle' | 'press' | 'lift' | 'reveal'


/**
 * The opening screen: an illustrated olive envelope that fills the phone.
 *
 * Every part is a rendered illustration layer (public/images/opener, made from
 * the real paper texture the groom side chose): the folded body with the line
 * blind-pressed into it, the top flap with its hot-stamped gold "A&S", and the
 * wax seal. All layers share one canvas, so they stay aligned at any size.
 *
 * Tap (or scroll): the seal gives under the finger and lifts away, the flap
 * tilts open toward you, and the envelope drifts toward you and fades —
 * straight onto the painted invitation waiting underneath.
 */
/**
 * A blind-embossed lace doily around the oval window: scalloped edge,
 * a ring of petals, dotted mesh and an inner bead ring, all in the paper's
 * own colour, lifted by a dark shadow below-right and a light edge above-left.
 */

export function Preloader({ onMusicIntent, onOpenStart, onOpen }: PreloaderProps) {
  const [stage, setStage] = useState<Stage>('idle')
  const started = useRef(false)

  const open = useCallback(() => {
    if (started.current) return
    started.current = true
    onMusicIntent()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // press the seal → it lifts and the flap opens, with the hero already
    // waiting underneath → the envelope drifts toward you and fades away.
    const t = reduced ? [0, 0, 500] : [150, 1400, 3000]
    setStage('press')
    window.setTimeout(() => {
      onOpenStart()
      setStage('lift')
    }, t[0])
    window.setTimeout(() => setStage('reveal'), t[1])
    window.setTimeout(onOpen, t[2])
  }, [onMusicIntent, onOpenStart, onOpen])

  // Safari tints its status bar and toolbar from the page's background.
  // While the envelope is up, give the page the envelope's own olive so the
  // bars melt into the paper; hand it back once the envelope has gone.
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('envelope-up')
    return () => root.classList.remove('envelope-up')
  }, [])

  // A scroll or swipe also opens it — many guests never think to tap.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => e.deltaY > 8 && open()
    let y0 = 0
    const onStart = (e: TouchEvent) => (y0 = e.touches[0]?.clientY ?? 0)
    const onMove = (e: TouchEvent) => y0 - (e.touches[0]?.clientY ?? 0) > 40 && open()
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
    }
  }, [open])

  // Depth: the layers drift a few pixels against each other as the phone
  // tilts or the pointer moves — the seal most, the paper least.
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = rootRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const set = (x: number, y: number) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', Math.max(-1, Math.min(1, x)).toFixed(3))
        el.style.setProperty('--py', Math.max(-1, Math.min(1, y)).toFixed(3))
      })
    }
    const onPointer = (e: PointerEvent) =>
      set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      set(e.gamma / 25, (e.beta - 45) / 25)
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('deviceorientation', onTilt, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onTilt)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className={`op stage-${stage}`}
      role="dialog"
      aria-label="Wedding reception invitation"
    >
      {/* Full-screen forest-green envelope (client's generated image), cut
          into a body and a flap layer; the gold monogram is drawn live. */}
      <div className="env7">
        <svg className="env7-layer" viewBox="0 0 853 1844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <image href={`${import.meta.env.BASE_URL}images/opener/env-base.webp`} width="853" height="1844" />
        </svg>
        <svg className="env7-layer env7-flapback" viewBox="0 0 853 1844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <image href={`${import.meta.env.BASE_URL}images/opener/env-flapback.webp`} width="853" height="1844" />
        </svg>
        <svg className="env7-layer env7-flap" viewBox="0 0 853 1844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="e7-gold" x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0" stopColor="#f6e2a6" />
              <stop offset="0.35" stopColor="#d8b25f" />
              <stop offset="0.6" stopColor="#a87b33" />
              <stop offset="0.8" stopColor="#e9cd85" />
              <stop offset="1" stopColor="#b38a3e" />
            </linearGradient>
          </defs>
          <image href={`${import.meta.env.BASE_URL}images/opener/env-flap.webp`} width="853" height="1844" />
          <g transform="translate(462 880) rotate(-9)" className="env7-mono">
            <text textAnchor="middle" fill="#0f130b" opacity="0.55" transform="translate(1.5 3)">{groom.firstName[0]}<tspan dx="-14">&amp;</tspan><tspan dx="-12">{bride.firstName[0]}</tspan></text>
            <text textAnchor="middle" fill="url(#e7-gold)" stroke="#f8e9b8" strokeWidth="0.6" strokeOpacity="0.5">{groom.firstName[0]}<tspan dx="-14">&amp;</tspan><tspan dx="-12">{bride.firstName[0]}</tspan></text>
          </g>
        </svg>
      </div>

      <div className="op-motes" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            style={
              {
                left: `${(i * 37 + 11) % 100}%`,
                '--dx': `${((i % 5) - 2) * 14}px`,
                animationDelay: `${(i * 1.9) % 13}s`,
                animationDuration: `${13 + (i % 4) * 3}s`,
                width: `${3 + (i % 3)}px`,
                height: `${3 + (i % 3)}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <button type="button" className="op-hit" onClick={open} aria-label="Open the invitation" />

      <p className="op-hint" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="env4-hand"><path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5c0 3.6-2.4 6.5-6 6.5-2.6 0-4.2-1.3-5.4-3.4L4.3 14a1.4 1.4 0 0 1 2.3-1.6L9 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 4.5a4 4 0 0 1 7 0" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
        Tap to open
      </p>

      {/* The light the envelope dissolves into */}
      <div className="bloom" aria-hidden="true" />
    </div>
  )
}
