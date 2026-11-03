import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { cn } from '../../utils/cn'
import { GoldPalm, Lotus } from '../ui/Mughal'

/**
 * Ambient background ornaments — slow-rotating khatim seals and soft blur
 * circles that sit far behind the content.
 *
 * Deliberately sparse and low-contrast: these should register as texture on a
 * page you're reading, never as elements competing for attention.
 */
export function FloatingPatterns({ className }: { className?: string }) {
  const prefersReduced = useReducedMotion()

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {/* Soft blur circles — atmosphere, not decoration */}
      <div className="absolute -top-32 -left-40 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(200,169,106,0.12),transparent_65%)] blur-2xl" />
      <div className="absolute top-1/3 -right-48 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(58,58,60,0.06),transparent_65%)] blur-2xl" />
      <div className="absolute -bottom-40 left-1/4 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(200,169,106,0.1),transparent_65%)] blur-2xl" />

      {/* Slow-turning seals */}
      {!prefersReduced && (
        <>
          <motion.div
            className="absolute top-[12%] right-[6%] text-gold/[0.13]"
            style={{ transformOrigin: '50% 100%' }}
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          >
            <GoldPalm className="h-40 w-40 md:h-56 md:w-56" />
          </motion.div>

          <motion.div
            className="absolute bottom-[14%] left-[4%] text-gold/[0.12]"
            style={{ transformOrigin: '50% 100%' }}
            animate={{ rotate: [2, -2, 2] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          >
            <GoldPalm className="h-32 w-32 -scale-x-100 md:h-44 md:w-44" />
          </motion.div>

          <motion.div
            className="absolute top-[52%] left-[10%] text-gold/20"
            animate={{ y: [0, -22, 0], rotate: [0, 22, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Lotus className="h-6 w-8" />
          </motion.div>

          <motion.div
            className="absolute top-[26%] left-[22%] text-gold/15"
            animate={{ y: [0, 18, 0], rotate: [0, -18, 0] }}
            transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          >
            <Lotus className="h-4 w-8" />
          </motion.div>

          <motion.div
            className="absolute right-[18%] bottom-[30%] text-emerald/15"
            animate={{ y: [0, -16, 0], rotate: [0, 30, 0] }}
            transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          >
            <Lotus className="h-5 w-8" />
          </motion.div>
        </>
      )}
    </div>
  )
}
