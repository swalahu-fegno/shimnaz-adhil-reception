import { AnimatePresence, motion } from 'framer-motion'
import { wedding } from '../../data/wedding'
import { useCountdown } from '../../hooks/useCountdown'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { pad } from '../../utils/date'
import { GirihPattern, Divider, StarEight } from '../ui/Ornaments'
import { Reveal, TextReveal } from '../ui/Reveal'
import { Particles } from '../FloatingPatterns/Particles'

/**
 * A single rolling numeral.
 *
 * The digit is keyed on its own value, so AnimatePresence swaps it only when it
 * actually changes — the seconds tick every beat while the days sit perfectly
 * still. Keying the whole group would re-animate all four every second.
 */
function Digit({ value, label }: { value: number; label: string }) {
  const prefersReduced = useReducedMotion()
  const text = pad(value)

  return (
    <div className="group relative flex flex-col items-center">
      {/* Numeral */}
      <div className="relative flex h-[clamp(3.5rem,9vw,6.5rem)] items-center justify-center overflow-hidden px-1">
        {prefersReduced ? (
          <span className="display text-[clamp(2.75rem,8vw,5.5rem)] leading-none tabular-nums text-ivory">
            {text}
          </span>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={text}
              initial={{ y: '65%', opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: '-65%', opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="display text-[clamp(2.75rem,8vw,5.5rem)] leading-none tabular-nums text-ivory"
            >
              {text}
            </motion.span>
          </AnimatePresence>
        )}
      </div>

      {/* Hairline under each numeral */}
      <span className="relative mt-3 h-px w-8 bg-gold/50 transition-all duration-500 group-hover:w-12 group-hover:bg-gold">
        {/* A spark runs along the hairline each time the number turns */}
        {!prefersReduced && (
          <motion.span
            key={text}
            className="absolute inset-y-[-1px] left-0 w-3 rounded-full bg-gold-soft shadow-[0_0_8px_rgba(227,211,174,0.9)]"
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: [0, 20], opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
      </span>

      <span className="mt-3 font-body text-[0.5rem] font-light tracking-[0.32em] text-ivory/50 uppercase md:text-[0.58rem]">
        {label}
      </span>
    </div>
  )
}

function Separator() {
  return (
    <span className="display -mt-6 hidden text-3xl text-gold/35 select-none sm:block md:text-4xl">
      :
    </span>
  )
}

/**
 * Premium countdown on an emerald field — the one dark section in the flow.
 *
 * The tonal inversion matters: it gives the page a spine, and it makes the
 * ivory numerals read as the loudest thing on the site after the Hero names.
 */
export function Countdown() {
  const { days, hours, minutes, seconds, isPast } = useCountdown(wedding.date)

  return (
    <section
      id="countdown"
      className="relative overflow-hidden bg-emerald-deep py-24 md:py-32"
      aria-label="Countdown to the Reception"
    >
      {/* Depth: girih weave, warm centre light, vignette */}
      <GirihPattern
        id="countdown-girih"
        className="pointer-events-none absolute inset-0 text-gold/[0.09]"
        scale={68}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_50%,rgba(200,169,106,0.14),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(20,20,22,0.7)_100%)]" />
      <Particles count={16} tone="gold" className="opacity-60" />

      {/* Gold seams top and bottom — the section reads as inlaid */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent" />

      <div className="shell relative flex flex-col items-center text-center">
        <Reveal direction="fade">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-8 bg-gold/50" />
            <StarEight className="h-3.5 w-3.5 text-gold" />
            <span className="h-px w-8 bg-gold/50" />
          </div>
        </Reveal>

        <Reveal direction="fade" delay={0.05}>
          <p className="font-body text-[0.58rem] font-light tracking-[0.42em] text-gold uppercase md:text-[0.66rem]">
            {isPast ? 'Alhamdulillah' : 'Counting the days'}
          </p>
        </Reveal>

        <TextReveal
          text={isPast ? 'We are married' : 'Until Our Forever Begins'}
          as="h2"
          className="display mt-5 mb-4 text-[clamp(2rem,5.5vw,3.75rem)] text-ivory"
        />

        <Reveal direction="up" delay={0.1}>
          <p className="mb-14 text-[0.72rem] font-light tracking-[0.28em] text-ivory/45 uppercase">
            {wedding.dayLabel} · {wedding.dateLabel}
          </p>
        </Reveal>

        {/* ---- The clock -------------------------------------------------- */}
        {isPast ? (
          <Reveal direction="scale">
            <p className="display max-w-lg text-[clamp(1.25rem,3vw,1.9rem)] leading-relaxed text-balance text-ivory/80 italic">
              “May Allah bless them, and unite them in goodness.”
            </p>
          </Reveal>
        ) : (
          <Reveal direction="scale" delay={0.15} className="w-full">
            <div className="glass relative mx-auto flex max-w-3xl items-start justify-center gap-3 border-gold/25 px-4 py-10 sm:gap-6 md:gap-10 md:px-10"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <Digit value={days} label="Days" />
              <Separator />
              <Digit value={hours} label="Hours" />
              <Separator />
              <Digit value={minutes} label="Minutes" />
              <Separator />
              <Digit value={seconds} label="Seconds" />
            </div>
          </Reveal>
        )}

        <Reveal direction="scale" delay={0.25} className="mt-14 w-full max-w-sm text-gold/60">
          <Divider variant="lozenge" />
        </Reveal>

        <Reveal direction="up" delay={0.3}>
          <p className="mt-6 max-w-md text-[0.75rem] leading-loose font-light text-balance text-ivory/45">
            {wedding.hijriLabel}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
