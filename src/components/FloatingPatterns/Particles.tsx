import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { cn } from '../../utils/cn'

/**
 * Deterministic pseudo-random. Math.random() would reshuffle the particle
 * field on every render; a seeded LCG keeps each mote in its lane.
 */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

interface ParticlesProps {
  count?: number
  className?: string
  /** Motes are gold by default; emerald reads better on ivory sections */
  tone?: 'gold' | 'ivory'
}

/**
 * Ambient floating motes — dust caught in light, not confetti.
 *
 * Each particle drifts on its own duration/delay so the field never pulses in
 * unison. Transform + opacity only, so the whole field stays on the compositor.
 */
export function Particles({ count = 18, className, tone = 'gold' }: ParticlesProps) {
  const prefersReduced = useReducedMotion()

  const motes = useMemo(() => {
    const rand = seeded(20261120)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      size: 4 + rand() * 5,
      spin: (rand() - 0.5) * 540,
      duration: 14 + rand() * 16,
      delay: rand() * -22,
      drift: 40 + rand() * 90,
      sway: (rand() - 0.5) * 44,
      opacity: 0.2 + rand() * 0.5,
    }))
  }, [count])

  if (prefersReduced) return null

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {motes.map((m) => (
        <motion.span
          key={m.id}
          className={cn(
            'absolute rounded-[100%_0]', // a petal, not a mote
            tone === 'gold' ? 'bg-gold' : 'bg-ivory',
          )}
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size * 0.7,
          }}
          animate={{
            y: [0, m.drift, 0],
            x: [0, m.sway, 0],
            rotate: [0, m.spin],
            opacity: [0, m.opacity, m.opacity * 0.4, 0],
          }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
