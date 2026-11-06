import { useCallback, useEffect } from 'react'
import { ScrollProgress } from './components/ScrollProgress/ScrollProgress'
import { FloatingDock } from './components/FloatingDock/FloatingDock'
import { Countdown, DressCode, Evening, Footer, Hero, Photos } from './components/Reception/Sections'
import { useLenis, scrollToSection } from './hooks/useLenis'

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

  // Pause every CSS animation in sections that are off screen (birds, water,
  // swaying palms, peacocks…) and resume as they return: smoother scrolling
  // and less battery on phones, with no visible difference.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('anim-paused', !e.isIntersecting)),
      { rootMargin: '15% 0px' },
    )
    const SECTIONS = '#hero, #invitation, #couple, #countdown, #events, #programme, footer'
    // Lazy sections mount a moment later; pick them up as they arrive, then
    // stop listening once all seven are watched.
    const mo = new MutationObserver(() => watch())
    const watch = () => {
      const found = document.querySelectorAll(SECTIONS)
      found.forEach((el) => io.observe(el))
      if (found.length >= 7) mo.disconnect()
    }
    mo.observe(document.getElementById('main') ?? document.body, { childList: true, subtree: true })
    watch()
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])

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
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-[1px] focus:bg-olive focus:px-4 focus:py-2 focus:text-[0.7rem] focus:tracking-widest focus:text-ivory focus:uppercase"
      >
        Skip to invitation
      </a>

      <main id="main">
        <Hero active={revealed} onScrollCue={goToInvitation} />
        <Photos />
        <Countdown />
        <Evening />
        <DressCode />
        <Footer />
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
