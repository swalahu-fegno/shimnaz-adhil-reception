import { useCallback, useEffect, useRef, useState } from 'react'
import { bride, groom, wedding } from '../../data/wedding'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ChevronDown } from '../ui/MughalIcons'

const DEBUG_MUSIC = false

function logMusic(message: string, details?: Record<string, unknown>) {
  if (!DEBUG_MUSIC) return
  console.log('[music]', message, details ?? '')
}

interface PreloaderProps {
  /** Fires on the earliest user interaction that indicates they are opening. */
  onMusicIntent: () => void
  /** Fires the instant the button is pressed — the doors are about to part, so
      whatever is underneath needs to be visible *now*. */
  onOpenStart: () => void
  /** Fires once the doors have finished parting and this screen can retire. */
  onOpen: () => void
}

/**
 * The lotus seal, drawn stroke by stroke — in CSS, so the static boot copy of
 * this screen draws itself too, before any JavaScript.
 *
 * `pathLength="1"` normalises every shape so one dasharray rule animates them
 * all. The order follows how the seal would be laid out by hand: the outer
 * rings, the scalloped arch, then the ring of lotus petals around it.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LotusSeal({ d }: { d: (delay: number) => React.CSSProperties }) {
  const el = (delay: number, opacity = 1) => ({ ...d(delay), '--o': opacity }) as React.CSSProperties
  const petals = Array.from({ length: 16 }, (_, i) => (i * 360) / 16)
  const petal = (deg: number) => {
    const r = (deg * Math.PI) / 180
    const p = (rad: number, a: number) => `${(100 + Math.sin(a) * rad).toFixed(2)} ${(100 - Math.cos(a) * rad).toFixed(2)}`
    return `M${p(70, r)} Q${p(84, r - 0.19)} ${p(95, r)} Q${p(84, r + 0.19)} ${p(70, r)}Z`
  }
  return (
    <svg viewBox="0 0 200 200" fill="none" className="seal-draw h-full w-full" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" strokeLinecap="round">
        <circle data-draw cx="100" cy="100" r="96" pathLength="1" style={el(0, 0.3)} />
        <circle data-draw cx="100" cy="100" r="70" pathLength="1" style={el(0.15, 0.55)} />
        {/* scalloped arch, framing the initials */}
        <ellipse data-draw cx="100" cy="102" rx="40" ry="52" pathLength="1" style={el(0.45)} />
        {/* ring of lotus petals */}
        {/* ...then each petal fills with gold in turn, going round the circle */}
        {petals.map((deg, i) => (
          <path
            key={deg}
            data-draw
            className="seal-fill"
            d={petal(deg)}
            pathLength="1"
            style={{ ...el(0.7 + i * 0.03, 0.75), '--f': d(1.55 + i * 0.09)['--d' as keyof React.CSSProperties] } as React.CSSProperties}
          />
        ))}
      </g>
    </svg>
  )
}

/**
 * The invitation opening experience.
 *
 * Deliberately built without Framer Motion. This is the first paint, and
 * pulling Motion into the entry chunk cost ~3.2s of scripting on a throttled
 * mobile CPU — the seal couldn't appear until an animation library had parsed,
 * which is exactly backwards. Plain CSS runs it, and the rest of the site
 * streams in behind this screen while the guest reads the Bismillah.
 *
 * Sequence: on two charcoal panels, a lotus seal draws itself around the
 * monogram while the Bismillah and the invitation line rise. A tap (or
 * scroll) blooms the seal outward and slides the panels apart, revealing the
 * Hero beneath — the same opening as the reference invitation.
 */
export function Preloader({ onMusicIntent, onOpenStart, onOpen }: PreloaderProps) {
  const prefersReduced = useReducedMotion()
  const [opening, setOpening] = useState(false)
  const openedRef = useRef(false)

  const handleOpen = useCallback(() => {
    if (openedRef.current) return
    openedRef.current = true // ref, not state: the listeners below close over
    logMusic('preloader opening')
    setOpening(true) //          the first render and would re-fire otherwise
    onMusicIntent()
    onOpenStart() // reveal the Hero before the doors expose it
    // Hand off just before the panels finish, so Hero is already fading up
    window.setTimeout(onOpen, prefersReduced ? 0 : 1150)
  }, [onMusicIntent, onOpen, onOpenStart, prefersReduced])

  // The static boot copy of this screen started its entrance animations at
  // first paint; pick them up where they are rather than replaying them.
  const [elapsed] = useState(() => {
    if (typeof window === 'undefined') return 0
    const t0 = (window as Window & { __bootT?: number }).__bootT
    return t0 == null ? 0 : (performance.now() - t0) / 1000
  })
  const d = (delay: number) =>
    ({ '--d': `${prefersReduced ? 0 : delay - elapsed}s` }) as React.CSSProperties

  /**
   * Scroll to open.
   *
   * The page is locked while this screen is up, so native `scroll` never fires.
   * Wheel, touchmove and keyboard scroll keys are opening gestures. Pointerdown
   * also opens because browsers require a tap/click-style activation for audio.
   */
  useEffect(() => {
    if (prefersReduced) return

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      logMusic('preloader pointerdown open', { pointerType: e.pointerType })
      onMusicIntent()
      handleOpen()
    }
    const onClick = () => {
      logMusic('preloader click unlock')
      onMusicIntent()
    }
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        logMusic('preloader wheel open', { deltaY: e.deltaY })
        onMusicIntent()
        handleOpen()
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' ', 'Spacebar', 'Enter'].includes(e.key)) {
        logMusic('preloader key open', { key: e.key })
        onMusicIntent()
        handleOpen()
      }
    }
    let touchStart = 0
    const onTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0]?.clientY ?? 0
      logMusic('preloader touchstart', { touchStart })
      onMusicIntent()
    }
    const onTouchEnd = () => {
      logMusic('preloader touchend unlock')
      onMusicIntent()
    }
    const onTouchMove = (e: TouchEvent) => {
      const distance = touchStart - (e.touches[0]?.clientY ?? 0)
      if (distance > 24) {
        logMusic('preloader touchmove open', { distance })
        handleOpen()
      }
    }

    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('click', onClick, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('click', onClick)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [handleOpen, onMusicIntent, prefersReduced])

  // Decode the garden's pictures while the opening is showing, so the hero is
  // fully painted the moment the doors part (on a phone it otherwise appeared
  // piece by piece).
  useEffect(() => {
    const base = `${import.meta.env.BASE_URL}images/hero/`
    const names = [...Array.from({ length: 12 }, (_, i) => `l${i}.webp`), 'grain.webp']
    const keep: HTMLImageElement[] = []
    const t = window.setTimeout(() => {
      names.forEach((n) => {
        const im = new Image()
        im.src = base + n
        im.decode().catch(() => {})
        keep.push(im)
      })
    }, 400)
    return () => window.clearTimeout(t)
  }, [])

  // The reception page starts with an olive tint for Safari's bars; this
  // opening sits on olive paper, so drop that tint while it shows.
  useEffect(() => {
    document.documentElement.classList.remove('envelope-up')
    const meta = document.querySelector('meta[name="theme-color"]')
    const prev = meta?.getAttribute('content')
    meta?.setAttribute('content', '#5f6140')
    return () => {
      if (prev) meta?.setAttribute('content', prev)
    }
  }, [])

  return (
    <div
      className={`pl-root pl-olive fixed inset-0 z-[100] flex items-center justify-center overflow-hidden ${
        opening ? 'is-opening pointer-events-none' : ''
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Tap or scroll to open the invitation"
    >
      {/* --- Panels: two charcoal leaves that slide apart on open, as on the
          reference invitation. Kept plain so the type in the middle reads. */}
      <div className="pl-stage absolute inset-0">
        {(['left', 'right'] as const).map((side) => (
          <div
            key={side}
            className={`pl-door door-leaf absolute inset-y-0 w-1/2 ${
              side === 'left' ? 'pl-door-l left-0' : 'pl-door-r right-0'
            }`}
          >
            {/* the client's olive felt paper, as on their pressed cards */}
            <div className="pl-paper absolute inset-0" />
            {/* gold seam where the leaves meet */}
            <div
              className={`pl-seam absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-gold/60 to-transparent ${
                side === 'left' ? 'right-0' : 'left-0'
              }`}
            />
          </div>
        ))}
        <div className="pl-veil pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,248,220,0.14),rgba(40,42,22,0.0)_45%,rgba(30,32,16,0.35)_100%)]" />
      </div>

      {/* --- Content -------------------------------------------------------- */}
      <div className="pl-content relative z-10 flex flex-col items-center px-6 text-center">
        {/* Monogram inside a cusped Mughal arch */}
        {/* Seal + monogram: a lotus seal that draws itself, stroke by stroke */}
        {/* A & S in a gold wax seal stamp, pressed onto the paper */}
        <div className="pl-scale gold-stamp relative mb-8 h-40 w-40" style={d(0.2)}>
          {/* rendered gold seal (scripts/render-gold-seal.py) */}
          <img src={`${import.meta.env.BASE_URL}images/gold-seal.webp`} alt="" className="h-full w-full" draggable={false} />
          <span className="gs-shine" aria-hidden="true" />
        </div>

        <div className="pl-rise flex flex-col items-center gap-3" style={d(0.4)}>
          <img
            src={`${import.meta.env.BASE_URL}images/open-bismillah.webp`}
            alt={wedding.bismillah.arabic}
            lang="ar"
            className="open-gold-bismillah"
            draggable={false}
          />
          <p className="max-w-xs text-xs leading-relaxed font-light tracking-[0.06em] text-balance text-ivory/65">
            {wedding.bismillah.translation}
          </p>
        </div>

        <div
          className="pl-rule my-8 h-px w-40 bg-gradient-to-r from-transparent via-gold/70 to-transparent"
          style={d(0.6)}
        />

        <p
          className="pl-rise display mb-10 text-[clamp(1.75rem,5vw,2.6rem)] leading-tight font-light text-ivory italic"
          style={d(0.75)}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/open-invited.webp`}
            alt="You are cordially invited"
            className="open-gold-invited"
            draggable={false}
          />
        </p>

        <button
          type="button"
          onPointerDown={() => {
            logMusic('open button pointerdown')
            onMusicIntent()
          }}
          onClick={handleOpen}
          style={d(0.95)}
          className="pl-rise group flex flex-col items-center gap-4 bg-transparent focus-visible:outline-gold"
        >
          <span className="font-body text-xs font-light tracking-[0.28em] text-gold/90 uppercase transition-colors group-hover:text-gold">
            Tap or scroll to open
          </span>
          {/* A gold thread falling into a lotus bud — "there is more below" */}
          <span className="relative flex h-14 w-6 items-center justify-center" aria-hidden="true">
            <span className="pl-thread absolute top-0 h-8 w-px bg-gradient-to-b from-transparent via-gold/70 to-gold" />
            <span className="pl-cue absolute bottom-0 text-gold">
              <ChevronDown className="h-4 w-4" strokeWidth={1} />
            </span>
          </span>
        </button>

        <p
          className="pl-rise mt-6 text-xs font-light tracking-[0.24em] text-ivory/50 uppercase"
          style={d(1.2)}
        >
          {wedding.dayLabel} · {wedding.dateLabel}
        </p>
      </div>
    </div>
  )
}
