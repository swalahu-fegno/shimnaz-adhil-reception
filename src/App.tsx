import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Preloader } from './components/Loading/Preloader'
import { useMusic } from './hooks/useMusic'
import { music } from './data/wedding'
import { TapPetals } from './components/ui/Effects'

/**
 * The whole invitation, behind a dynamic import.
 *
 * This is the single most valuable split in the app: it keeps Framer Motion,
 * GSAP and Lenis (~275 KB) out of the entry chunk, so the preloader — which is
 * pure CSS — paints without waiting on any of them.
 */
const loadSite = () => import('./Site')
const Site = lazy(loadSite)
const DEBUG_MUSIC = false

function logMusic(message: string, details?: Record<string, unknown>) {
  if (!DEBUG_MUSIC) return
  console.log('[music]', message, details ?? '')
}

export default function App() {
  const hasHash = typeof window !== 'undefined' && window.location.hash.length > 1
  /** The doors are parting: the Hero must be visible for them to reveal it. */
  const [revealed, setRevealed] = useState(hasHash)
  /** The doors have finished and the preloader is gone: unlock scrolling. */
  const [opened, setOpened] = useState(hasHash)
  /**
   * The invitation renders only once the guest shows intent — a touch, a
   * scroll, a mouse move or a key — and finishes during the door swing.
   * Rendering it at load cost slow phones ~500 ms of blocked main thread
   * while they were still looking at the door. Its code is fetched on idle.
   */
  const [mountSite, setMountSite] = useState(hasHash)

  useEffect(() => {
    if (mountSite) return
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200))
    idle(() => void loadSite())
    const intents = ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'wheel'] as const
    const go = () => setMountSite(true)
    intents.forEach((t) => window.addEventListener(t, go, { once: true, passive: true }))
    return () => intents.forEach((t) => window.removeEventListener(t, go))
  }, [mountSite])

  const { isPlaying, isAvailable, toggle, play } = useMusic({
    src: music.src,
    volume: music.volume,
  })

  const handleMusicIntent = useCallback(() => {
    logMusic('music intent from preloader', {
      autoplayAfterOpen: music.autoplayAfterOpen,
      isPlaying,
    })
    if (music.autoplayAfterOpen) {
      void play()
    }
  }, [isPlaying, play])

  /**
   * The one gesture that unlocks audio. Browsers only permit playback from a
   * real user interaction, so the button press is where it has to happen —
   * never on mount.
   */
  const handleOpenStart = useCallback(() => {
    logMusic('open start', { autoplayAfterOpen: music.autoplayAfterOpen })
    setMountSite(true)
    setRevealed(true)
    if (music.autoplayAfterOpen) {
      void play()
    }
  }, [play])

  const handleOpen = useCallback(() => setOpened(true), [])

  // The preloader owns the viewport — start every visit at the top, even on a
  // browser that restored the previous scroll position.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    if (!hasHash) window.scrollTo(0, 0)
  }, [hasHash])

  return (
    <>
      {/* Every tap answers with a few gold petals */}
      {opened && <TapPetals />}

      {!opened && (
        <Preloader
          onMusicIntent={handleMusicIntent}
          onOpenStart={handleOpenStart}
          onOpen={handleOpen}
        />
      )}

      {/*
        Site mounts immediately, underneath the preloader, and streams in while
        the guest reads the Bismillah — so it's ready the moment they open it.
        The preloader is its fallback, hence no Suspense fallback of its own.

        `visibility: hidden` is load-bearing, not cosmetic. The Hero is
        fullscreen, and LCP ignores occlusion — so a Hero painting late behind
        an opaque preloader still registered as the Largest Contentful Paint at
        ~4.9s. Hidden elements are not LCP candidates, which hands LCP back to
        the preloader (~1.5s). It also keeps the content out of the tab order
        while the preloader is up.
      */}
      <div style={{ visibility: revealed ? 'visible' : 'hidden' }}>
        {mountSite && (
          <Suspense fallback={null}>
            <Site
              revealed={revealed}
              opened={opened}
              isPlaying={isPlaying}
              musicAvailable={isAvailable}
              onToggleMusic={toggle}
            />
          </Suspense>
        )}
      </div>
    </>
  )
}
