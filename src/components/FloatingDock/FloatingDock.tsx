import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'
import { ArrowUp, Check, Copy, Share2 } from '../ui/MughalIcons'
import { site } from '../../data/wedding'
import { useShare } from '../../hooks/useShare'
import { cn } from '../../utils/cn'
import { MusicButton, MusicUnavailable } from '../MusicButton/MusicButton'

interface FloatingDockProps {
  isPlaying: boolean
  musicAvailable: boolean
  onToggleMusic: () => void
  onScrollTop: () => void
}

const buttonBase = cn(
  'gold-btn group glass relative flex h-12 w-12 items-center justify-center rounded-full',
  'border-gold/35 text-gold-deep shadow-[var(--shadow-card)]',
  'transition-colors duration-500 hover:border-gold hover:text-gold',
)

/**
 * The floating control cluster.
 *
 * Music sits alone bottom-left; the rest stack bottom-right and only appear
 * once you're past the first viewport — the Hero stays uncluttered, and the
 * controls arrive exactly when you start needing them.
 */
export function FloatingDock({
  isPlaying,
  musicAvailable,
  onToggleMusic,
  onScrollTop,
}: FloatingDockProps) {
  const [scrolled, setScrolled] = useState(false)
  const { scrollYProgress } = useScroll()
  const { share, state: shareState } = useShare({ title: site.title, text: site.shareText })

  useMotionValueEvent(scrollYProgress, 'change', (v) => setScrolled(v > 0.06))

  const pop = {
    initial: { opacity: 0, scale: 0.6, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.6, y: 12 },
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const },
  }

  return (
    <>
      {/* ---- Music, alone on the left ------------------------------------ */}
      <div className="fixed bottom-5 left-5 z-40 md:bottom-7 md:left-7">
        {musicAvailable ? (
          <MusicButton isPlaying={isPlaying} onToggle={onToggleMusic} />
        ) : (
          <MusicUnavailable />
        )}
      </div>

      {/* ---- The rest, stacked right ------------------------------------- */}
      <div className="fixed right-5 bottom-5 z-40 flex flex-row items-center gap-3 md:right-7 md:bottom-7">
        {/* WhatsApp */}
        {/* <motion.a
          href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(site.shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className={buttonBase}
        >
          <WhatsApp className="h-[1.15rem] w-[1.15rem]" />
        </motion.a> */}

        {/* Scroll to top, left of Share — only once there's something to go back to */}
        <AnimatePresence>
          {scrolled && (
            <motion.button
              type="button"
              onClick={onScrollTop}
              aria-label="Back to top"
              {...pop}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.94 }}
              className={cn(buttonBase, 'border-gold/50 bg-gold/[0.12]')}
            >
              <ArrowUp className="h-4 w-4" strokeWidth={1.25} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Share */}
        <motion.button
          type="button"
          onClick={share}
          aria-label="Share this invitation"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className={buttonBase}
        >
          <AnimatePresence mode="wait" initial={false}>
            {shareState === 'copied' || shareState === 'shared' ? (
              <motion.span
                key="done"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="text-emerald"
              >
                <Check className="h-4 w-4" strokeWidth={1.5} />
              </motion.span>
            ) : shareState === 'failed' ? (
              <motion.span key="failed" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Copy className="h-4 w-4" strokeWidth={1.25} />
              </motion.span>
            ) : (
              <motion.span key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Share2 className="h-4 w-4" strokeWidth={1.25} />
              </motion.span>
            )}
          </AnimatePresence>

          {/* Confirmation toast */}
          <AnimatePresence>
            {shareState === 'copied' && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="glass pointer-events-none absolute right-14 rounded-[1px] border-gold/30 px-3 py-1.5 text-[0.55rem] tracking-[0.16em] whitespace-nowrap text-ink uppercase"
              >
                Link copied
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

      </div>
    </>
  )
}
