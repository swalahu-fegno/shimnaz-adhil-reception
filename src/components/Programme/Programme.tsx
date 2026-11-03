import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring, type MotionValue } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { TiltGlow } from '../ui/Effects'
import { dressCode, dressSwatches, programme, venue } from '../../data/wedding'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal, RevealGroup, RevealItem } from '../ui/Reveal'
import { Birds, CuspedArch, GardenScene, Lotus, LotusDivider, cuspedArchPath } from '../ui/Mughal'

/**
 * The order of the evening, seen through a jharokha.
 *
 * The card's garden — chhatri, palms, lake, sailboat — drawn in gold line
 * inside a cusped Mughal arch like a view from a palace window. Beside it, the three
 * moments of the day run down a gold thread, and the dress code closes the
 * section with the card's own three colours.
 */
/** A diamond on the thread that lights up once the gold reaches it. */
function TimelineNode({ progress, at }: { progress: MotionValue<number>; at: number }) {
  const [lit, setLit] = useState(false)
  useMotionValueEvent(progress, 'change', (v) => setLit(v >= at - 0.02))
  return (
    <span
      className={`tl-node absolute top-1.5 -left-10 flex h-5 w-5 rotate-45 items-center justify-center border border-gold bg-ivory ${lit ? 'is-lit' : ''}`}
      aria-hidden="true"
    >
      <span className={`h-1.5 w-1.5 transition-colors duration-500 ${lit ? 'bg-ivory' : 'bg-gold'}`} />
    </span>
  )
}

export function Programme() {
  const prefersReduced = useReducedMotion()
  const timelineRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ['start 75%', 'end 55%'] })
  const thread = useSpring(scrollYProgress, { stiffness: 80, damping: 22 })

  return (
    <section
      id="programme"
      className="relative overflow-hidden bg-ivory py-8 md:py-[clamp(4rem,8vw,7.5rem)]"
      aria-label="Programme"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg to-transparent" />

      <div className="shell relative">
        <SectionHeading
          eyebrow={venue.name}
          arabic="برنامج"
          title="The Evening"
          subtitle="Three moments, one blessed day."
          className="mb-6 max-md:gap-3 md:mb-20"
        />

        <div className="grid items-center gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-20">
          {/* Jharokha window */}
          <Reveal direction="scale">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[10.5rem] md:max-w-sm">
              <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                  <clipPath id="jharokha-clip">
                    <path d={cuspedArchPath(300, 400)} />
                  </clipPath>
                  <linearGradient id="jharokha-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3a3a3c" />
                    <stop offset="1" stopColor="#232325" />
                  </linearGradient>
                </defs>
                <g clipPath="url(#jharokha-clip)">
                  <rect width="300" height="400" fill="url(#jharokha-sky)" />
                  {/* moon with a slow breathing glow, and twinkling stars */}
                  <circle className="moon-glow" cx="200" cy="120" r="26" fill="#e3d3ae" opacity="0.18" />
                  <circle cx="200" cy="120" r="16" fill="#e3d3ae" opacity="0.35" />
                  {[
                    [70, 90, 0],
                    [110, 60, 1.2],
                    [150, 100, 2.1],
                    [240, 70, 0.6],
                    [90, 140, 1.7],
                    [255, 160, 2.6],
                  ].map(([x, y, dl]) => (
                    <circle
                      key={`${x}${y}`}
                      className="star-twinkle"
                      cx={x}
                      cy={y}
                      r="1.6"
                      fill="#f8f5ef"
                      style={{ animationDelay: `${dl}s` }}
                    />
                  ))}
                </g>
              </svg>
              <div className="absolute inset-x-0 bottom-0 overflow-hidden text-gold" style={{ height: '72%' }}>
                <GardenScene className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2" />
              </div>
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 0 40% 0)' }}>
                <Birds tone="text-gold-soft/70" />
              </div>
              <CuspedArch className="absolute -inset-1.5 h-[calc(100%+0.75rem)] w-[calc(100%+0.75rem)] text-gold md:-inset-3 md:h-[calc(100%+1.5rem)] md:w-[calc(100%+1.5rem)]" />
              <span className="absolute -bottom-1.5 left-1/2 h-px w-[150%] -translate-x-1/2 bg-gradient-to-r from-transparent via-gold to-transparent md:-bottom-3 md:w-[115%]" />
            </div>
          </Reveal>

          {/* Timeline */}
          <div>
            <div ref={timelineRef} className="relative hidden md:block">
              <RevealGroup className="relative flex flex-col gap-10 pl-10">
                {/* Faint track, and the gold thread that fills it as you scroll */}
                <span className="absolute top-2 bottom-2 left-[0.6rem] w-px bg-gold/20" aria-hidden="true" />
                <motion.span
                  className="absolute top-2 bottom-2 left-[0.6rem] w-px origin-top bg-gradient-to-b from-gold via-gold to-gold-soft shadow-[0_0_6px_rgba(209,180,122,0.6)]"
                  style={{ scaleY: prefersReduced ? 1 : thread }}
                  aria-hidden="true"
                />
                {programme.map((item, i) => (
                  <RevealItem key={item.time} className="relative">
                    <TimelineNode progress={thread} at={i / Math.max(programme.length - 1, 1)} />
                    <p className="royal text-sm tracking-[0.25em] text-gold-deep">{item.time}</p>
                    <h3 className="display mt-1 text-3xl text-ink md:text-4xl">{item.title}</h3>
                    <p className="mt-1 text-[0.8rem] font-light text-muted">{item.note}</p>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>

            {/* Phones: the three moments side by side on a gold thread */}
            <RevealGroup className="relative grid grid-cols-3 gap-2 text-center md:hidden">
              <span
                className="absolute top-[0.6rem] right-[16%] left-[16%] h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30"
                aria-hidden="true"
              />
              {programme.map((item) => (
                <RevealItem key={item.time} className="relative flex flex-col items-center">
                  <span
                    className="tl-node is-lit flex h-5 w-5 rotate-45 items-center justify-center border border-gold bg-ivory"
                    aria-hidden="true"
                  >
                    <span className="h-1.5 w-1.5 bg-ivory" />
                  </span>
                  <p className="royal mt-3 text-[0.72rem] tracking-[0.12em] text-gold-deep">{item.time}</p>
                  <h3 className="display mt-0.5 text-[1.2rem] leading-tight text-ink">{item.title}</h3>
                  <p className="sr-only">{item.note}</p>
                </RevealItem>
              ))}
            </RevealGroup>

            {/* Dress code */}
            <Reveal direction="up" delay={0.2}>
              <TiltGlow className="mt-5 md:mt-14">
              <div className="border border-gold/35 bg-bg/70 px-4 py-3 text-center md:px-6 md:py-7">
                <Lotus className="mx-auto mb-3 hidden h-4 w-7 text-gold md:block" />
                <div className="flex items-center justify-center gap-5 md:block">
                  <div className="text-left md:text-center">
                    <p className="eyebrow text-[0.55rem]">Dress Code</p>
                    <p className="display mt-1 text-xl text-ink md:mt-2 md:text-2xl">{dressCode.colours}</p>
                  </div>
                  <div className="flex justify-center gap-3 md:mt-5 md:gap-5">
                    {dressSwatches.map((s) => (
                      <div key={s.name} className="flex flex-col items-center gap-2">
                        <span
                          className="h-8 w-8 rounded-full border border-gold/60 shadow-card transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-110 md:h-10 md:w-10"
                          style={{ background: s.hex }}
                          title={s.name}
                        />
                        <span className="hidden text-[0.55rem] tracking-[0.18em] text-muted uppercase md:block">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mx-auto mt-2 max-w-xs text-[0.75rem] leading-relaxed font-light text-muted italic md:mt-5">
                  {dressCode.note}
                </p>
              </div>
              </TiltGlow>
            </Reveal>
          </div>
        </div>

        <LotusDivider className="mt-16 hidden md:flex" />
      </div>
    </section>
  )
}
