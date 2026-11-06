import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { ChevronDown } from '../ui/MughalIcons'
import { bride, groom, venue, wedding } from '../../data/wedding'
import { GirihPattern, OrnateFrame } from '../ui/Ornaments'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Birds, CuspedArch, GoldPalm, Lotus } from '../ui/Mughal'
import { DrawOnView } from '../ui/Effects'

const EASE = [0.22, 1, 0.36, 1] as const

/** Each letter rises out of a blur a beat after the last. */
function Letters({ text, start }: { text: string; start: number }) {
  return (
    <>
      {[...text].map((ch, i) => (
        <span key={i} className="letter-rise" style={{ '--d': `${start + i * 0.06}s` } as React.CSSProperties}>
          {ch}
        </span>
      ))}
    </>
  )
}

const RISE = { hidden: { opacity: 0, y: 34 }, visible: { opacity: 1, y: 0 } }

/** The motif dissolves where the type is and reaches full strength at the margins. */
const EDGE_MASK =
  'radial-gradient(ellipse 62% 54% at 50% 46%, transparent 32%, rgba(0,0,0,0.3) 58%, rgba(0,0,0,0.75) 78%, black 92%)'

/** A pool of warm light for the names to sit in. */
const POOL =
  'radial-gradient(ellipse 58% 50% at 50% 46%, rgba(209,180,122,0.16) 0%, rgba(209,180,122,0.06) 45%, transparent 72%)'

/** Charcoal deepens toward the edges, holding the eye in the centre. */
const VIGNETTE = 'radial-gradient(ellipse at center, transparent 40%, rgba(20,20,22,0.85) 100%)'

interface HeroProps {
  /** Held false until the preloader hands over, so the entrance plays on cue */
  active: boolean
  onScrollCue: () => void
}

/**
 * Fullscreen hero — the names, very large, on charcoal.
 *
 * Kept as quiet as the opening screen: a Mughal arch crest, the names in the
 * display serif, the date between lotus marks and the Ar-Rum verse. The fan
 * motif is masked away from the type so it frames the names rather than
 * running under them; gold palms rise at the foot and birds cross the sky.
 */
export function Hero({ active, onScrollCue }: HeroProps) {
  const prefersReduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const cardY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '-10%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, prefersReduced ? 1 : 0])
  // Pointer (or phone tilt) parallax: each plane drifts at its own depth
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 60, damping: 20 })
  const sy = useSpring(py, { stiffness: 60, damping: 20 })
  const palmX = useTransform(sx, (v) => v * -14)
  const frameX = useTransform(sx, (v) => v * 6)
  const frameY = useTransform(sy, (v) => v * 6)
  const poolX = useTransform(sx, (v) => v * 40)
  const poolY = useTransform(sy, (v) => v * 30)

  useEffect(() => {
    if (prefersReduced) return
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5)
      py.set(e.clientY / window.innerHeight - 0.5)
    }
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      px.set(Math.max(-0.5, Math.min(0.5, e.gamma / 60)))
      py.set(Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 60)))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('deviceorientation', onTilt, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onTilt)
    }
  }, [prefersReduced, px, py])

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '12%'])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex h-[100svh] min-h-[36rem] items-center justify-center overflow-hidden bg-emerald-deep"
      aria-label="Wedding reception invitation"
    >
      <h1 className="sr-only">
        Wedding Reception of {groom.fullName} &amp; {bride.fullName} — {wedding.dayLabel}, {wedding.dateLabel},{' '}
        {venue.name}
      </h1>

      {/* ---- Ground: charcoal, fan motif only at the margins ---------------- */}
      <motion.div className="absolute inset-0" style={{ y: bgY }} aria-hidden="true">
        <div className="absolute inset-0" style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}>
          <GirihPattern id="hero-motif" className="absolute inset-0 text-gold/[0.22]" scale={60} />
        </div>
        <motion.div className="absolute inset-0" style={{ background: POOL, x: poolX, y: poolY }} />
        <div className="absolute inset-0" style={{ background: VIGNETTE }} />
      </motion.div>

      <Birds className="z-[1]" tone="text-gold-soft/60" />

      {/* ---- Gold palms rising at the foot, as on the card -------------------- */}
      <motion.div
        style={{ x: palmX }}
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-5 text-gold/25 md:px-[5vw]"
        initial={{ opacity: 0, y: 30 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.6, delay: 0.7, ease: EASE }}
        aria-hidden="true"
      >
        <GoldPalm className="h-[18vh] w-auto md:h-[30vh]" />
        <GoldPalm className="h-[18vh] w-auto -scale-x-100 md:h-[30vh]" />
      </motion.div>

      {/* ---- Ornamental frame ------------------------------------------------- */}
      <motion.div
        style={{ x: frameX, y: frameY }}
        className="absolute inset-0 text-gold/60"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={active ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
      >
        <OrnateFrame inset="inset-4 md:inset-8" />
      </motion.div>

      {/* ---- Content ---------------------------------------------------------- */}
      <motion.div
        className="relative z-10 flex w-full flex-col items-center px-6 text-center"
        style={{ y: cardY, opacity: fade }}
      >
        <motion.div
          initial="hidden"
          animate={active ? 'visible' : 'hidden'}
          variants={{ visible: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } } }}
          className="flex max-w-2xl flex-col items-center"
        >
          {/* Arch crest */}
          <motion.div variants={RISE} transition={{ duration: 0.9, ease: EASE }} className="mb-6">
            <DrawOnView duration={2.2} when={active}>
              <CuspedArch className="h-12 w-9 text-gold/80" />
            </DrawOnView>
          </motion.div>

          <motion.div variants={RISE} transition={{ duration: 0.9, ease: EASE }} className="mb-8 flex items-center gap-4">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/70" />
            <span className="font-body text-[0.6rem] font-light tracking-[0.42em] text-gold uppercase md:text-[0.68rem]">
              Wedding Reception
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/70" />
          </motion.div>

          {/* Names — groom first, for the groom's family */}
          <p
            className={`display flex flex-col items-center leading-[0.9] text-ivory [perspective:600px] ${active ? 'is-active' : ''}`}
            style={{ textShadow: '0 0 60px rgba(20,20,22,0.6)' }}
            aria-hidden="true"
          >
            <span className="text-[clamp(3.4rem,13vw,9rem)]">
              <Letters text={groom.firstName} start={0.55} />
            </span>
            <span
              className="letter-rise foil animate-foil my-3 text-[clamp(1.75rem,4.5vw,3rem)] italic md:my-4"
              style={{ '--d': '1.05s' } as React.CSSProperties}
            >
              &amp;
            </span>
            <span className="text-[clamp(3.4rem,13vw,9rem)]">
              <Letters text={bride.firstName} start={1.2} />
            </span>
            <span className="gold-thread mt-5 block h-px w-40 bg-gradient-to-r from-transparent via-gold to-transparent md:w-64" />
          </p>

          <motion.div variants={RISE} transition={{ duration: 0.9, ease: EASE }} className="mt-10 flex items-center gap-4">
            <Lotus className="h-3 w-5 text-gold/80" />
            <p className="font-body text-[0.62rem] font-light tracking-[0.32em] text-ivory/90 uppercase md:text-[0.72rem]">
              {wedding.dayLabel} &nbsp;·&nbsp; {wedding.dateLabel}
            </p>
            <Lotus className="h-3 w-5 text-gold/80" />
          </motion.div>

          <motion.blockquote variants={RISE} transition={{ duration: 0.9, ease: EASE }} className="mt-9 max-w-lg">
            <p className="display text-[clamp(1rem,2.4vw,1.3rem)] leading-relaxed text-balance text-ivory/70 italic">
              “{wedding.quote.text}”
            </p>
            <cite className="mt-4 block font-body text-[0.55rem] font-light tracking-[0.3em] text-gold/75 not-italic uppercase">
              {wedding.quote.source}
            </cite>
          </motion.blockquote>
        </motion.div>
      </motion.div>

      {/* ---- Scroll cue ----------------------------------------------------- */}
      <motion.button
        onClick={onScrollCue}
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 1.6 }}
        style={{ opacity: fade }}
        className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-ivory/55 transition-colors hover:text-gold"
        aria-label="Scroll to the invitation"
      >
        <motion.span
          animate={prefersReduced ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={1} />
        </motion.span>
      </motion.button>
    </section>
  )
}
