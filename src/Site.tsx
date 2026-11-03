import { lazy, Suspense, useCallback, useEffect } from 'react'
import { Hero } from './components/Hero/Hero'
import { Invitation } from './components/Invitation/Invitation'
import { ScrollProgress } from './components/ScrollProgress/ScrollProgress'
import { FloatingDock } from './components/FloatingDock/FloatingDock'
import { FloatingPatterns } from './components/FloatingPatterns/FloatingPatterns'
import { useLenis, scrollToSection } from './hooks/useLenis'

/**
 * Everything below the fold is split again. Hero and Invitation ride along with
 * this chunk because they're on screen the moment the doors open; the rest
 * stream in while the guest is still reading the Bismillah.
 */
const Couple = lazy(() => import('./components/Couple/Couple').then((m) => ({ default: m.Couple })))
const Countdown = lazy(() =>
  import('./components/Countdown/Countdown').then((m) => ({ default: m.Countdown })),
)
/** Events now carries the venue map too — they were one question, asked twice. */
const Events = lazy(() => import('./components/Events/Events').then((m) => ({ default: m.Events })))
const Programme = lazy(() =>
  import('./components/Programme/Programme').then((m) => ({ default: m.Programme })),
)
const Footer = lazy(() => import('./components/Footer/Footer').then((m) => ({ default: m.Footer })))

/** Reserves vertical space so lazy sections don't collapse the scroll height. */
function SectionFallback() {
  return <div className="min-h-[60vh]" aria-hidden="true" />
}

interface SiteProps {
  /** The doors are parting — play the Hero entrance now, not after they finish. */
  revealed: boolean
  /** The preloader has retired — safe to unlock scrolling. */
  opened: boolean
  isPlaying: boolean
  musicAvailable: boolean
  onToggleMusic: () => void
}

/**
 * The invitation itself.
 *
 * Loaded lazily by App so that Framer Motion, GSAP and Lenis stay out of the
 * entry chunk. It mounts *underneath* the preloader and streams in while the
 * guest reads it, so by the time they press "Open Invitation" it's ready.
 */
export default function Site({
  revealed,
  opened,
  isPlaying,
  musicAvailable,
  onToggleMusic,
}: SiteProps) {
  const lenisRef = useLenis(opened)

  const goToInvitation = useCallback(
    () => scrollToSection('invitation', lenisRef.current),
    [lenisRef],
  )

  const scrollTop = useCallback(() => {
    const lenis = lenisRef.current
    if (lenis) lenis.scrollTo(0, { duration: 1.6 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [lenisRef])

  useEffect(() => {
    const hash = window.location.hash
    if (hash.length > 1) {
      // Small delay to ensure layout is ready and lazy components are mounted enough
      // Alternatively, just let lenis or native scroll IntoView handle it
      setTimeout(() => {
        const el = document.getElementById(hash.slice(1))
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [])

  return (
    <>
      <ScrollProgress />

      <a
        href="#invitation"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-[1px] focus:bg-emerald focus:px-4 focus:py-2 focus:text-[0.7rem] focus:tracking-widest focus:text-ivory focus:uppercase"
      >
        Skip to invitation
      </a>

      <main id="main">
        {/* `revealed`, not `opened`: the entrance must already be underway as
            the doors part, or the Hero snaps in a beat late. */}
        <Hero active={revealed} onScrollCue={goToInvitation} />

        {/* Ambient ornaments span the ivory body, behind every section */}
        <div className="relative">
          <FloatingPatterns className="fixed inset-0 -z-10" />

          <Invitation />

          <Suspense fallback={<SectionFallback />}>
            <Couple />
            <Countdown />
            <Events />
            <Programme />
          </Suspense>
        </div>

        <Suspense fallback={<SectionFallback />}>
          <Footer />
        </Suspense>
      </main>

      <FloatingDock
        isPlaying={isPlaying}
        musicAvailable={musicAvailable}
        onToggleMusic={onToggleMusic}
        onScrollTop={scrollTop}
      />
    </>
  )
}
