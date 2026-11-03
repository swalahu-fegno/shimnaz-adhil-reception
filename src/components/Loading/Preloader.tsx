import { useCallback, useEffect, useRef, useState } from 'react'
import { bride, groom, wedding } from '../../data/wedding'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { CuspedArch, Lotus } from '../ui/Mughal'
import { burstPetals } from '../ui/Effects'
import { GirihPattern } from '../ui/Ornaments'

const DEBUG_MUSIC = true

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
 * The invitation opening experience.
 *
 * Deliberately built without Framer Motion. This is the first paint, and
 * pulling Motion into the entry chunk cost ~3.2s of scripting on a throttled
 * mobile CPU — the seal couldn't appear until an animation library had parsed,
 * which is exactly backwards. Plain CSS runs it, and the rest of the site
 * streams in behind this screen while the guest reads the Bismillah.
 *
 * Sequence: two plain charcoal door leaves hold a monogram in a Mughal arch,
 * the Bismillah and the invitation line. A tap (or scroll) swings the leaves
 * inward on their hinges, revealing the Hero beneath.
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
    // A few petals drift out through the gap
    window.setTimeout(() => burstPetals(window.innerWidth / 2, window.innerHeight * 0.5, 10, 120), 450)
    onMusicIntent()
    onOpenStart() // reveal the Hero before the doors expose it
    // Hand off just before the panels finish, so Hero is already fading up
    window.setTimeout(onOpen, prefersReduced ? 0 : 2150)
  }, [onMusicIntent, onOpen, onOpenStart, prefersReduced])

  const d = (delay: number) => ({ '--d': `${prefersReduced ? 0 : delay}s` }) as React.CSSProperties

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

  return (
    <div
      className={`pl-root fixed inset-0 z-[100] flex items-center justify-center overflow-hidden ${
        opening ? 'is-opening pointer-events-none' : ''
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Tap the door to open the invitation"
    >
      {/* --- Doors: two quiet charcoal leaves that swing open on their hinges.
          Kept plain on purpose so the type in the middle reads first. */}
      <div className="pl-stage absolute inset-0">
        {(['left', 'right'] as const).map((side) => (
          <div
            key={side}
            className={`pl-door door-leaf absolute inset-y-0 w-1/2 ${
              side === 'left' ? 'pl-door-l left-0' : 'pl-door-r right-0'
            }`}
          >
            <GirihPattern id={`door-motif-${side}`} className="absolute inset-0 text-gold/[0.16]" scale={56} />
            <div
              className={`absolute inset-y-5 border border-gold/25 md:inset-y-8 ${
                side === 'left' ? 'right-3 left-5 md:left-8' : 'right-5 left-3 md:right-8'
              }`}
            />
            {/* Warm light catching this leaf's inner edge — it rides the door
                as it swings, so the light travels outward with the opening */}
            <div
              className={`pl-edge-light absolute inset-y-0 w-24 ${
                side === 'left' ? 'right-0 pl-edge-l' : 'left-0 pl-edge-r'
              }`}
              aria-hidden="true"
            />
            {/* gold seam where the leaves meet */}
            <div
              className={`absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent ${
                side === 'left' ? 'right-0' : 'left-0'
              }`}
            />
          </div>
        ))}
        <div className="pl-veil pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(58,58,60,0.55),rgba(35,35,37,0.2)_45%,transparent_75%)]" />
      </div>

      {/* --- Content -------------------------------------------------------- */}
      <div className="pl-content relative z-10 flex flex-col items-center px-6 text-center">
        {/* Monogram inside a cusped Mughal arch */}
        <div className="pl-scale relative mb-8 flex h-44 w-32 items-center justify-center md:h-56 md:w-40" style={d(0.1)}>
          <CuspedArch className="absolute inset-0 h-full w-full text-gold" />
          <div className="relative mt-6 flex items-center gap-2.5">
            <span className="royal text-4xl leading-none text-ivory md:text-5xl">{groom.initial}</span>
            <svg viewBox="0 0 12 12" className="h-2 w-2 text-gold" aria-hidden="true">
              <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="currentColor" />
            </svg>
            <span className="royal text-4xl leading-none text-ivory md:text-5xl">{bride.initial}</span>
          </div>
        </div>

        <div className="pl-rise flex flex-col items-center gap-3" style={d(0.4)}>
          <p className="arabic text-xl text-gold md:text-2xl" lang="ar">
            {wedding.bismillah.arabic}
          </p>
          <p className="max-w-xs text-[0.7rem] leading-relaxed font-light tracking-[0.08em] text-balance text-ivory/65">
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
          You are cordially invited
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
          <span className="font-body text-[0.62rem] font-light tracking-[0.34em] text-gold/90 uppercase transition-colors group-hover:text-gold">
            Tap the door to open
          </span>
          <Lotus className="pl-knock h-5 w-8 text-gold" />
        </button>

        <p
          className="pl-rise mt-6 text-[0.55rem] font-light tracking-[0.3em] text-ivory/40 uppercase"
          style={d(1.2)}
        >
          {wedding.dayLabel} · {wedding.dateLabel}
        </p>
      </div>
    </div>
  )
}
