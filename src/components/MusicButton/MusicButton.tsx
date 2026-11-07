import { motion } from 'framer-motion'
import { Music, VolumeX } from '../ui/MughalIcons'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { cn } from '../../utils/cn'

interface MusicButtonProps {
  isPlaying: boolean
  onToggle: () => void
  className?: string
}

/**
 * Music toggle with an equaliser built from four gold bars.
 *
 * The bars animate only while playing — a paused equaliser that still dances is
 * the kind of detail that quietly tells you nothing on the page is real.
 */
export function MusicButton({ isPlaying, onToggle, className }: MusicButtonProps) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
      aria-pressed={isPlaying}
      className={cn(
        'gold-btn group glass relative flex h-12 w-12 items-center justify-center rounded-full',
        'border-gold/35 text-gold-deep shadow-[var(--shadow-card)]',
        'transition-colors duration-500 hover:border-gold hover:text-gold',
        className,
      )}
    >
      {/* Rings pulse outward while the music plays */}
      {isPlaying && !prefersReduced && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full border border-gold/50"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.span
            className="absolute inset-0 rounded-full border border-gold/50"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 1.1 }}
          />
        </>
      )}

      {isPlaying ? (
        <span className="relative flex h-4 items-end gap-[2.5px]" aria-hidden="true">
          {[0.9, 1.5, 0.7, 1.2].map((h, i) => (
            <motion.span
              key={i}
              className="w-[2px] rounded-full bg-current"
              style={{ height: `${h * 8}px` }}
              animate={prefersReduced ? {} : { scaleY: [0.35, 1, 0.55, 0.9, 0.35] }}
              transition={{
                duration: 1.1 + i * 0.18,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.1,
              }}
            />
          ))}
        </span>
      ) : (
        <Music className="relative h-4 w-4" strokeWidth={1.25} aria-hidden="true" />
      )}
    </motion.button>
  )
}

/** Shown in place of the toggle when no audio file is present. */
export function MusicUnavailable({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'glass flex h-12 w-12 items-center justify-center rounded-full border-gold/20 text-muted/40',
        className,
      )}
      title="Background music unavailable"
      aria-hidden="true"
    >
      <VolumeX className="h-4 w-4" strokeWidth={1.25} />
    </span>
  )
}
