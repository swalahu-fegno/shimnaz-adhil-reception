import { AnimatePresence, motion, useScroll, useTransform, type MotionValue, type PanInfo } from 'framer-motion'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  bride,
  couplePhotos,
  dressCode,
  dressSwatches,
  events,
  programme,
  groom,
  hosts,
  site,
  venue,
  wedding,
} from '../../data/wedding'
import { useCountdown } from '../../hooks/useCountdown'
import { googleCalendarUrl, pad } from '../../utils/date'
import { OliveBranch, OrnateFrame, Sprig } from './Ornaments'
import { HeroScene, HeroSceneStill } from './HeroScene'

const EASE = [0.22, 1, 0.36, 1] as const
const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}`

function Fade({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-[0.6rem] tracking-[0.42em] uppercase md:text-[0.68rem] ${className}`}>{children}</p>
}

/* -------------------------------------------------------------------------- */
/*  HERO — a landscape painting in a scrolled white frame                      */
/* -------------------------------------------------------------------------- */

/** A line of the hero card that fades up out of the light, in turn. */
function Line({ active, i, children, className }: { active: boolean; i: number; children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
      animate={active ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 1.4, delay: 1.0 + i * 0.22, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Drifting specks of light — the same ones floating over the envelope. */
function Motes() {
  return (
    <div className="op-motes" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={i}
          style={
            {
              left: `${(i * 41 + 7) % 100}%`,
              '--dx': `${((i % 5) - 2) * 14}px`,
              animationDelay: `${(i * 2.3) % 13}s`,
              animationDuration: `${14 + (i % 4) * 3}s`,
              width: `${3 + (i % 3)}px`,
              height: `${3 + (i % 3)}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

/** A pearl with its own glint, for the frame's corners. */
function Pearl({ className, delay }: { className: string; delay: number }) {
  return (
    <span className={`hero-pearl ${className}`} aria-hidden="true">
      <span className="op-glint" style={{ '--s': '26px', animationDelay: `${delay}s`, left: '50%', top: '50%' } as React.CSSProperties} />
    </span>
  )
}

/** Seeded random, so server and client draw the same garden. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

const ROSE_TONES = [
  ['#e8dcd2', '#c9a9a2', '#94696b'],
  ['#ece6d8', '#cdc4ae', '#958c74'],
  ['#dcc3bd', '#b48c88', '#7c5458'],
]
const SPRAY_TONES = [
  ['#e4d6ad', '#b29a5e'],
  ['#e6d2cf', '#b08584'],
]

/** One garden rose, painted in SVG: splayed outer petals, a shadowed cup and
 *  a spiral of inner petals, all roughened by a brush filter. */
function Rose({ tone, r }: { tone: string[]; r: () => number }) {
  const outer = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * 360 + r() * 30
    return { a, rx: 11 + r() * 4, ry: 7 + r() * 2 }
  })
  const whorl = Array.from({ length: 14 }, (_, i) => {
    const t = i / 14
    const a = t * 990
    const rad = 10 * (1 - t) + 1.5
    return { x: Math.cos((a * Math.PI) / 180) * rad, y: Math.sin((a * Math.PI) / 180) * rad * 0.6, a, w: 5 * (1 - t) + 2 }
  })
  return (
    <g filter="url(#gd-brush)">
      {outer.map((p, i) => (
        <ellipse
          key={i}
          cx={Math.cos((p.a * Math.PI) / 180) * 12}
          cy={Math.sin((p.a * Math.PI) / 180) * 7 + 2}
          rx={p.rx}
          ry={p.ry}
          transform={`rotate(${p.a + 90} ${Math.cos((p.a * Math.PI) / 180) * 12} ${Math.sin((p.a * Math.PI) / 180) * 7 + 2})`}
          fill={tone[0]}
          opacity="0.85"
        />
      ))}
      <ellipse cx="1" cy="-1" rx="12" ry="8" fill={tone[1]} opacity="0.9" />
      {whorl.map((w, i) => (
        <ellipse key={i} cx={w.x} cy={w.y - 2} rx={w.w} ry="1.6" transform={`rotate(${w.a + 90} ${w.x} ${w.y - 2})`} fill={i > 8 ? tone[2] : tone[1]} opacity="0.85" />
      ))}
      <ellipse cx="-7" cy="-7" rx="7" ry="3.5" transform="rotate(-30 -7 -7)" fill="#fffaf2" opacity="0.5" />
      <path d="M-9 9 q-6 4 -11 2 q5 -5 11 -2Z M9 9 q6 4 11 2 q-5 -5 -11 -2Z" fill="#4f5a32" />
    </g>
  )
}

/** A spray of small five-petal blossoms on fine stems. */
function Spray({ tone, r }: { tone: string[]; r: () => number }) {
  const buds = Array.from({ length: 11 }, () => {
    const a = Math.PI * (1.08 + r() * 0.84)
    const d = 6 + r() * 26
    return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.9 + 12 }
  })
  return (
    <g filter="url(#gd-brush)">
      {buds.map((b, i) => (
        <path key={`s${i}`} d={`M0 22 Q${b.x * 0.4} 14 ${b.x} ${b.y}`} stroke="#4f5a32" strokeWidth="0.9" fill="none" />
      ))}
      {buds.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${i * 37})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-3.4" rx="2.6" ry="3.6" transform={`rotate(${a})`} fill={tone[0]} opacity="0.9" />
          ))}
          <circle r="1.3" fill={tone[1]} />
        </g>
      ))}
    </g>
  )
}

const BED_LEAVES = (() => {
  const r = seeded(77)
  const tones = ['#2f3822', '#3c4729', '#4c5833', '#5f6b3f', '#76804f']
  return Array.from({ length: 520 }, () => {
    const left = r() < 0.5
    const x = left ? r() * 150 - 10 : 250 + r() * 160
    const edge = left ? x / 150 : (400 - x) / 150
    const y = 180 - r() * (70 - edge * 35)
    const lit = 1 - (180 - y) / 70
    return {
      x: +x.toFixed(1),
      y: +y.toFixed(1),
      rx: +(2.4 + r() * 3).toFixed(1),
      ry: +(1.3 + r() * 1.4).toFixed(1),
      a: Math.floor(r() * 180),
      c: tones[Math.min(4, Math.floor((1 - lit) * 3 + r() * 2))],
    }
  })
})()

/** Garden along the foot of the hero, painted in SVG: a meadow of grass
 *  blades, and roses and blossom sprays that sway in turn. */
function GardenFlowers() {
  const r = seeded(20261209)
  const blades = Array.from({ length: 180 }, () => {
    const x = r() * 400
    const h = 10 + r() * 28
    const lean = (r() - 0.5) * 14
    const shade = ['#3d4627', '#4c5731', '#5d6a3c', '#73804a'][Math.floor(r() * 4)]
    return { x, h, lean, shade }
  })
  // two flower beds framing the sides, the centre left open for the aisle
  const flowers = Array.from({ length: 22 }, (_, i) => {
    const left = i < 11
    const x = left ? r() * 130 : 270 + r() * 130
    const h = 30 + r() * 60
    const rose = r() > 0.35
    return {
      x,
      h,
      rose,
      tone: rose ? ROSE_TONES[Math.floor(r() * 3)] : SPRAY_TONES[Math.floor(r() * 2)],
      bow: (r() - 0.5) * 16,
      leaves: 2 + Math.floor(r() * 3),
      delay: (r() * 4).toFixed(2),
      dur: (3.8 + r() * 2.4).toFixed(2),
      seed: Math.floor(r() * 1e6) + 1,
    }
  })
  return (
    <svg className="garden" viewBox="0 0 400 180" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <filter id="gd-brush" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" />
        </filter>
        <linearGradient id="gd-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f3720" stopOpacity="0" />
          <stop offset="0.55" stopColor="#2f3720" stopOpacity="0.6" />
          <stop offset="1" stopColor="#262c19" stopOpacity="0.92" />
        </linearGradient>
      </defs>
      <rect x="-20" y="70" width="440" height="120" fill="url(#gd-ground)" />

      <g filter="url(#gd-brush)">
        {BED_LEAVES.map((l, i) => (
          <ellipse key={i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} transform={`rotate(${l.a} ${l.x} ${l.y})`} fill={l.c} />
        ))}
      </g>
      {flowers.map((f, i) => (
        <g key={i} className="garden-stem" style={{ animationDelay: `-${f.delay}s`, animationDuration: `${f.dur}s`, transformOrigin: `${f.x}px 180px` }}>
          <path d={`M${f.x} 182 Q${f.x + f.bow} ${180 - f.h / 2} ${f.x + f.bow * 0.6} ${180 - f.h}`} stroke="#45502c" strokeWidth="1.4" fill="none" />
          {Array.from({ length: f.leaves }, (_, k) => {
            const t = 0.25 + k * 0.18
            const lx = f.x + f.bow * t
            const ly = 180 - f.h * t
            const side = k % 2 ? 1 : -1
            return (
              <path
                key={k}
                d={`M${lx} ${ly} q${side * 7} -8 ${side * 15} -6 q${-side * 6} 7 ${-side * 15} 6Z`}
                fill={k % 2 ? '#5d6a3c' : '#73804a'}
                filter="url(#gd-brush)"
              />
            )
          })}
          <g transform={`translate(${f.x + f.bow * 0.6} ${180 - f.h}) scale(${(0.45 + (f.h / 90) * 0.3).toFixed(2)})`}>
            {f.rose ? <Rose tone={f.tone} r={seeded(f.seed)} /> : <Spray tone={f.tone} r={seeded(f.seed)} />}
          </g>
        </g>
      ))}

      <g className="garden-grass" filter="url(#gd-brush)">
        {blades.map((b, i) => (
          <path key={i} d={`M${b.x - 1.4} 182 Q${b.x + b.lean * 0.4} ${182 - b.h * 0.6} ${b.x + b.lean} ${182 - b.h} Q${b.x + b.lean * 0.3} ${182 - b.h * 0.5} ${b.x + 1.4} 182Z`} fill={b.shade} />
        ))}
      </g>
    </svg>
  )
}

export function Hero({ active, onScrollCue }: { active: boolean; onScrollCue: () => void }) {
  return (
    <section id="hero" className="relative h-[320svh]">
      {/* where "scroll" lands: the invitation, fully revealed */}
      <span id="invitation" className="absolute top-[115svh] block h-px w-px" aria-hidden="true" />
      <div className="hero-stage sticky top-0 flex h-[100svh] min-h-[38rem] items-start justify-center overflow-hidden">
      <h1 className="sr-only">
        Wedding Reception of {groom.fullName} &amp; {bride.fullName} — {wedding.dayLabel}, {wedding.dateLabel}, {venue.name}
      </h1>

      {/* The painting comes up out of the envelope's light: bright, soft and
          blurred at first, then clearing into focus. */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1, filter: 'brightness(1.12) saturate(0.85) blur(5px)' }}
        animate={active ? { scale: 1, filter: 'brightness(1) saturate(1) blur(0px)' } : {}}
        transition={{ duration: 3.4, ease: EASE }}
      >
        <HeroScene className="absolute inset-0 h-full w-full" />
        {/* the same olive dusk wash the painted backdrops use */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(40,38,20,0.14),rgba(40,38,20,0.04)_40%,rgba(35,30,18,0.4))]" />
      </motion.div>

      {/* The same warm glow and slow rays that sat behind the seal */}
      <div className={`hero-light ${active ? 'is-on' : ''}`} aria-hidden="true">
        <span className="hero-rays" />
        <span className="hero-glow" />
      </div>
      <Motes />

      <motion.div
        className="hero-sky-text relative mx-5 mt-[9svh] w-full max-w-md px-4 text-center text-[#3f3a24] md:max-w-lg"
        initial={{ opacity: 0, scale: 0.94, filter: 'blur(8px)' }}
        animate={active ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
        transition={{ duration: 1.8, delay: 0.55, ease: EASE }}
      >
        {/* soft sky haze so the writing reads over the clouds */}
        <div className="pointer-events-none absolute -inset-x-10 -inset-y-8 bg-[radial-gradient(ellipse_at_center,rgba(244,238,224,0.75),rgba(244,238,224,0.35)_55%,transparent_75%)] blur-md" />

        <div className="relative">
          <Line active={active} i={0}>
            <p className="arabic text-lg text-[#5a3a28] md:text-xl" lang="ar">
              {wedding.bismillah.arabic}
            </p>
          </Line>
          <Line active={active} i={1}>
            <Kicker className="mt-4 text-[#5a3a28]">The Wedding Reception of</Kicker>
          </Line>
          <Line active={active} i={2}>
            <p className="script mt-3 text-[clamp(3rem,13vw,5rem)] text-[#4a4d2c] leading-[0.95] drop-shadow-[0_1px_8px_rgba(255,250,235,0.7)]">
              {groom.firstName}
            </p>
          </Line>
          <Line active={active} i={3}>
            <p className="display my-1 text-2xl italic opacity-80">&amp;</p>
          </Line>
          <Line active={active} i={4}>
            <p className="script text-[clamp(3rem,13vw,5rem)] text-[#4a4d2c] leading-[0.95] drop-shadow-[0_1px_8px_rgba(255,250,235,0.7)]">
              {bride.firstName}
            </p>
          </Line>
          <Line active={active} i={5}>
            <Sprig className="mt-4 text-[#5b5e3c]" />
            <p className="display mt-3 text-xl tracking-[0.3em] md:text-2xl">09 | 12 | 2026</p>
          </Line>
          <Line active={active} i={6}>
            <Kicker className="mt-2 text-[#5a3a28]">{venue.name} · Pattambi</Kicker>
          </Line>
        </div>
      </motion.div>

      <motion.button
        type="button"
        onClick={onScrollCue}
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[0.55rem] tracking-[0.4em] text-[#f6efdc]/80 uppercase"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : {}}
        transition={{ duration: 1.2, delay: 3 }}
      >
        Scroll
        <span className="block h-8 w-px animate-pulse bg-[#f6efdc]/60" />
      </motion.button>

      {/* the scene steps aside; the invitation is written on cream paper */}
      <div className="hero-paper paper" aria-hidden="true" />
      <div className="hero-invite">
        {/* an arched invitation frame that draws itself as you scroll */}
        <div className="inv-aura" aria-hidden="true" />
        <div className="inv-sparks" aria-hidden="true">
          {Array.from({ length: 16 }, (_, k) => (
            <i key={k} style={{ left: `${(k * 53 + 7) % 100}%`, top: `${(k * 37 + 11) % 100}%`, animationDelay: `${(k * 0.43) % 3}s` }} />
          ))}
        </div>
        <div className="inv-glass" aria-hidden="true" />
        {/* butterflies drifting over the card */}
        <svg className="inv-bflies" viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {[1, 2].map((n) => (
            <g key={n} className={`inv-bfly inv-bfly-${n}`}>
              <g className="hp-wings">
                <path d="M0 0 C-10 -16 -26 -14 -24 -2 C-22 6 -8 6 0 0 Z" fill="#f3e6c4" />
                <path d="M0 0 C-8 8 -18 14 -16 4 C-15 0 -6 -1 0 0 Z" fill="#dcc48e" />
                <path d="M0 0 C10 -16 26 -14 24 -2 C22 6 8 6 0 0 Z" fill="#f3e6c4" />
                <path d="M0 0 C8 8 18 14 16 4 C15 0 6 -1 0 0 Z" fill="#dcc48e" />
              </g>
              <path d="M0 -6 L0 7" stroke="#5a4a30" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          ))}
        </svg>
        <div className="inv-shine" aria-hidden="true" />
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id="deckle">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="8" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
          </filter>
        </svg>
        <svg className="inv-frame" viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true">
          <rect className="inv-edge" vectorEffect="non-scaling-stroke" x="6" y="5" width="88" height="150" rx="1" />
          <rect className="inv-edge inv-edge-in" vectorEffect="non-scaling-stroke" x="8.5" y="6.8" width="83" height="146.4" rx="0.6" />
        </svg>
        <span className="inv-corner inv-corner-tl" aria-hidden="true" />
        <span className="inv-corner inv-corner-tr" aria-hidden="true" />
        <span className="inv-corner inv-corner-bl" aria-hidden="true" />
        <span className="inv-corner inv-corner-br" aria-hidden="true" />
        <span className="inv-seal" aria-hidden="true">
          <i>A&amp;S</i>
        </span>
        <OliveBranch className="inv-branch inv-branch-l pointer-events-none absolute w-36 text-olive/55" />
        <OliveBranch className="inv-branch inv-branch-r pointer-events-none absolute w-36 text-olive/55" />

        <div className="relative mx-auto flex h-full max-w-md flex-col items-center justify-center px-16 pt-14 pb-6 text-center">
          <div className="inv-line inv-mono" style={{ '--i': 0 } as React.CSSProperties}>
            <span className="script">A</span>
            <i>&amp;</i>
            <span className="script">S</span>
          </div>
          <p className="inv-line arabic mt-4 text-base text-walnut" lang="ar" style={{ '--i': 1 } as React.CSSProperties}>
            {wedding.bismillah.arabic}
          </p>
          <p className="inv-line display mt-4 text-[0.8rem] tracking-[0.14em] text-ink uppercase" style={{ '--i': 2 } as React.CSSProperties}>
            {hosts.grandfather}
            <br />
            &amp; {hosts.grandmother}
          </p>
          <p className="inv-line display mx-auto mt-2 max-w-xs text-[0.95rem] leading-snug text-ink/75 italic" style={{ '--i': 3 } as React.CSSProperties}>
            {wedding.invitationMessage}
          </p>
          <p className="inv-write script mt-6 text-[clamp(2.4rem,10vw,3.6rem)] leading-tight text-olive" style={{ '--i': 4 } as React.CSSProperties}>
            {groom.fullName}
          </p>
          <p className="inv-line mt-1 text-[0.55rem] tracking-[0.26em] text-muted uppercase" style={{ '--i': 5 } as React.CSSProperties}>
            Son of {groom.father} &amp; {groom.mother}
          </p>
          <div className="inv-line my-3 flex items-center gap-3 text-walnut" style={{ '--i': 6 } as React.CSSProperties}>
            <span className="h-px w-10 bg-current opacity-40" />
            <span className="display text-xl italic">with</span>
            <span className="h-px w-10 bg-current opacity-40" />
          </div>
          <p className="inv-write script text-[clamp(2.4rem,10vw,3.6rem)] leading-tight text-olive" style={{ '--i': 7 } as React.CSSProperties}>
            {bride.fullName}
          </p>
          <p className="inv-line mt-1 text-[0.55rem] tracking-[0.26em] text-muted uppercase" style={{ '--i': 8 } as React.CSSProperties}>
            Daughter of {bride.father} &amp; {bride.mother}
          </p>
          <Sprig className="inv-line mt-6 text-olive" />
          <p className="inv-line mt-4 text-[0.55rem] tracking-[0.32em] text-walnut uppercase" style={{ '--i': 9 } as React.CSSProperties}>
            {wedding.dayLabel} · {wedding.dateLabel}
          </p>
        </div>
      </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  INVITATION — cream paper, the families' words                              */
/* -------------------------------------------------------------------------- */

export function Invitation() {
  return (
    <section id="invitation" className="paper relative overflow-hidden px-6 py-24 text-center md:py-32">
      <OliveBranch className="pointer-events-none absolute -top-2 -left-6 w-44 -scale-y-100 text-olive/50 md:w-64" />
      <OliveBranch className="pointer-events-none absolute -right-6 -bottom-2 w-44 -scale-x-100 text-olive/50 md:w-64" />

      <div className="relative mx-auto max-w-xl">
        <Fade>
          <p className="arabic text-xl text-walnut" lang="ar">
            {wedding.bismillah.arabic}
          </p>
          <p className="display mt-2 text-sm text-muted italic">{wedding.bismillah.translation}</p>
        </Fade>

        <Fade delay={0.1}>
          <Sprig className="mt-10 text-olive" />
          <p className="display mt-8 text-lg tracking-[0.18em] text-ink uppercase md:text-xl">
            {hosts.grandfather} &amp; {hosts.grandmother}
          </p>
          <p className="display mx-auto mt-3 max-w-sm text-lg leading-snug text-ink/75 italic md:text-xl">
            {wedding.invitationMessage}
          </p>
        </Fade>

        <Fade delay={0.15} className="mt-10">
          <p className="script text-[clamp(3rem,12vw,4.5rem)] leading-none text-olive">{groom.fullName}</p>
          <p className="mt-2 text-[0.62rem] tracking-[0.3em] text-muted uppercase">
            Son of {groom.father} &amp; {groom.mother}
          </p>
          <p className="display my-5 text-3xl text-walnut italic">with</p>
          <p className="script text-[clamp(3rem,12vw,4.5rem)] leading-none text-olive">{bride.fullName}</p>
          <p className="mt-2 text-[0.62rem] tracking-[0.3em] text-muted uppercase">
            Daughter of {bride.father} &amp; {bride.mother}
          </p>
        </Fade>

        <Fade delay={0.1}>
          <Sprig className="mt-12 text-olive" />
          <p className="display mx-auto mt-8 max-w-md text-lg leading-relaxed text-ink/70 italic">
            “{wedding.quote.text}”
          </p>
          <p className="mt-3 text-[0.6rem] tracking-[0.3em] text-walnut/80 uppercase">{wedding.quote.source}</p>
        </Fade>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  PHOTOS — an embossed oval on olive paper                                   */
/* -------------------------------------------------------------------------- */

export function Photos() {
  // pinned for a while: the four dome-arched photos start as one stack and
  // fan out as you scroll
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const n = couplePhotos.length
  return (
    <section ref={ref} id="couple" className="relative" style={{ height: `${(couplePhotos.length + 1) * 85}svh` }}>
      <div className="us-stage sticky top-0 flex h-[100svh] flex-col items-center overflow-hidden text-[#3f3a24]">
        {couplePhotos.map((p, i) => (
          <UsAmbient key={p.src} src={p.src} i={i} n={n} progress={scrollYProgress} />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(60,62,34,0.2),rgba(40,42,22,0.75))]" />
        <div className="relative z-[200] mt-[11svh] text-center">
          <Kicker className="opacity-75">Two hearts, one story</Kicker>
          <h2 className="script mt-2 text-[clamp(3rem,12vw,4.6rem)] leading-none">Us</h2>
        </div>

        <div className="relative mt-[4svh] h-[58svh] w-full">
          {couplePhotos.map((p, i) => (
            <UsCard key={p.src} src={p.src} i={i} n={n} progress={scrollYProgress} />
          ))}
        </div>

        <UsCounter progress={scrollYProgress} n={n} />
      </div>
    </section>
  )
}

/** One photo per stretch of scroll: the top card lifts away to reveal the next. */
function UsCard({ src, i, n, progress }: { src: string; i: number; n: number; progress: MotionValue<number> }) {
  const span = 1 / n
  const start = i * span
  // leave: the card slides up and off, turning, as its stretch of scroll ends
  const leave = useTransform(progress, [start + span * 0.35, start + span], [0, 1], { clamp: true })
  // depth: before its turn the card sits lower in the stack, smaller
  const depth = useTransform(progress, (v) => Math.max(0, Math.min(3, (start - v) / span)))
  const last = i === n - 1
  const y = useTransform([leave, depth], ([l, d]: number[]) => `${(last ? 0 : -l * l * 110) + d * 2.4}svh`)
  const x = useTransform([leave, depth], ([l, d]: number[]) => `${(last ? 0 : (i % 2 ? 1 : -1) * l * 30) + d * (i % 2 ? 2 : -2)}vw`)
  const rotate = useTransform([leave, depth], ([l, d]: number[]) => (last ? 0 : (i % 2 ? 1 : -1) * l * 14) + d * (i % 2 ? 3 : -3))
  const scale = useTransform(depth, (d) => 1 - d * 0.05)
  const opacity = useTransform([leave, depth], ([l, d]: number[]) => (last ? 1 : l > 0.85 ? (1 - l) / 0.15 : 1) * (d > 2.6 ? 0 : 1))
  return (
    <motion.figure className="us-card" style={{ x, y, rotate, scale, opacity, zIndex: 100 - i }}>
      <span className="us-photo">
        <img src={src} alt={`${groom.firstName} and ${bride.firstName}`} draggable={false} loading="lazy" />
      </span>
      <figcaption className="us-caption">{['where it began', 'side by side', 'forever, inshaAllah'][i % 3]}</figcaption>
      <span className="us-tape" aria-hidden="true" />
    </motion.figure>
  )
}

/** The current photo, blurred, washing the whole background in its light. */
function UsAmbient({ src, i, n, progress }: { src: string; i: number; n: number; progress: MotionValue<number> }) {
  const c = (i + 0.5) / n
  const opacity = useTransform(progress, (v) => {
    const d = Math.abs(v - c) * n // 0 at its centre, 1 one photo away
    return 0.55 * Math.max(0, Math.min(1, (1 - d) / 0.7))
  })
  const scale = useTransform(progress, (v) => 1.18 - (v - c) * 0.3)
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${src})`, opacity, scale, filter: 'blur(28px) sepia(0.35) saturate(0.8)' }}
      aria-hidden="true"
    />
  )
}

function UsCounter({ progress, n }: { progress: MotionValue<number>; n: number }) {
  const [k, setK] = useState(1)
  useEffect(() => progress.on('change', (v) => setK(Math.min(n, Math.floor(v * n * 0.999) + 1))), [progress, n])
  return (
    <div className="relative z-[200] mt-auto mb-[10svh] flex items-center gap-3 text-[0.7rem] tracking-[0.3em] text-[#efe6cf]/80">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i + 1 === k ? 'w-6 bg-[#efe6cf]' : 'w-1.5 bg-[#efe6cf]/40'}`} />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  COUNTDOWN — over a dusk painting                                           */
/* -------------------------------------------------------------------------- */

export function Countdown() {
  const t = useCountdown(wedding.date)
  const cells = [
    ['Days', t.days],
    ['Hours', t.hours],
    ['Minutes', t.minutes],
    ['Seconds', t.seconds],
  ] as const
  return (
    <section id="countdown" className="relative overflow-hidden px-6 py-28 text-center text-[#f6efdc] md:py-36" aria-label="Countdown to the reception">
      <div className="painting" style={{ backgroundImage: `url(${img('painting-dusk.webp')})` }} />
      <div className="relative">
        <Fade>
          <Kicker className="opacity-80">Counting the days</Kicker>
          <h2 className="script mt-3 text-[clamp(2.6rem,10vw,4.2rem)] leading-none">Until our forever begins</h2>
        </Fade>
        <Fade delay={0.15} className="mx-auto mt-12 grid max-w-md grid-cols-4 gap-3">
          {cells.map(([label, n]) => (
            <div key={label} className="border border-[#f6efdc]/35 bg-[#1e1c0e]/25 px-1 py-4 backdrop-blur-[2px]">
              <p className="display text-[clamp(1.9rem,7vw,2.8rem)] leading-none tabular-nums">{pad(n)}</p>
              <p className="mt-2 text-[0.5rem] tracking-[0.28em] uppercase opacity-75">{label}</p>
            </div>
          ))}
        </Fade>
        <Fade delay={0.25}>
          <p className="mt-10 text-[0.62rem] tracking-[0.36em] uppercase opacity-85">
            {wedding.dayLabel} · {wedding.dateLabel}
          </p>
          <p className="display mt-2 text-sm italic opacity-70">{wedding.hijriLabel}</p>
        </Fade>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  THE EVENING — an oval card, the venue and the map                          */
/* -------------------------------------------------------------------------- */

export function Evening() {
  const calendar = googleCalendarUrl({
    title: `Wedding Reception — ${groom.firstName} & ${bride.firstName}`,
    startIso: wedding.date,
    durationHours: 4,
    details: site.shareText,
    location: `${venue.name}, ${venue.address}`,
  })
  // the golden thread draws itself down the timeline as you scroll
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const thread = useTransform(p, [0, 1], [0, 1])
  const sky = useTransform(p, [0, 0.9], [0, 1])
  return (
    <>
      <section ref={ref} id="events" className="evn relative overflow-hidden px-6 pt-24 pb-24 text-center">
        <Fade>
          <Kicker className="evn-kicker">Save the date</Kicker>
          <h2 className="script evn-title mt-2 text-[clamp(3rem,12vw,4.6rem)] leading-none">The Evening</h2>
          <p className="evn-date mt-3 text-[0.62rem] tracking-[0.32em] uppercase">
            {wedding.dayLabel} · {wedding.dateLabel}
          </p>
        </Fade>

        {/* an arched window onto the sky, turning from gold to dusk */}
        <Fade delay={0.1} className="mx-auto mt-10 w-[min(62vw,15rem)]">
          <div className="evn-window">
            {/* the same garden as the home page, seen through the window */}
            <HeroSceneStill className="evn-scene" />
            <motion.span className="evn-dusk" style={{ opacity: sky }} />
            <motion.span className="evn-moon" style={{ opacity: sky }} />
          </div>
        </Fade>

        {/* the order of the evening, on a golden thread */}
        <div className="relative mx-auto mt-14 w-fit max-w-xs pl-10 text-left">
          <span className="evn-line" aria-hidden="true" />
          <motion.span className="evn-line evn-line-gold" style={{ scaleY: thread }} aria-hidden="true" />
          {programme.map((m, i) => (
            <Fade key={m.title} delay={0.1} className={`relative ${i ? 'mt-16' : ''}`}>
              <span className="evn-node" aria-hidden="true" />
              <div className="evn-moment">
                <p className="display evn-time text-[0.7rem] tracking-[0.34em] uppercase">{m.time}</p>
                <p className="script evn-name mt-1 text-[clamp(2.4rem,10vw,3.2rem)] leading-none">{m.title}</p>
                <p className="display evn-note mt-2 text-base italic">{m.note}</p>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      <section className="venue relative px-6 pt-6 pb-24 text-center">
        <Fade>
          <Sprig className="text-[#8a7a55]" />
          <Kicker className="mt-8 text-[#6f5a3e]">The venue</Kicker>
          <h2 className="script mt-2 text-[clamp(2.6rem,11vw,3.6rem)] leading-none text-[#4a4a2a]">Where we gather</h2>
          <p className="display mt-4 text-xl tracking-[0.14em] text-[#3d3324] uppercase">{venue.name}</p>
          <p className="mt-1 text-[0.62rem] tracking-[0.3em] text-[#6f5a3e] uppercase">{venue.address}</p>
          <div className="venue-facts">
            <span><b>From</b>5:00 PM</span>
            <i />
            <span><b>Dinner</b>7:30 PM</span>
          </div>
        </Fade>
        <Fade delay={0.1} className="mx-auto mt-8 max-w-lg">
          <div className="flex flex-wrap justify-center gap-3">
            <a href={venue.directionsUrl} target="_blank" rel="noopener noreferrer" className="vbtn vbtn-solid">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
              Directions
            </a>
            <a href={calendar} target="_blank" rel="noopener noreferrer" className="vbtn">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></svg>
              Save the date
            </a>
          </div>
        </Fade>
      </section>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*  DRESS CODE — the earthy palette                                            */
/* -------------------------------------------------------------------------- */

export function DressCode() {
  return (
    <section id="programme" className="dress relative px-6 pt-10 pb-16 text-center">
      <Fade>
        <Sprig className="text-[#8a7a55]" />
        <Kicker className="mt-6 text-[#6f5a3e]">Dress code</Kicker>
        <h2 className="script mt-2 text-[clamp(2.4rem,10vw,3.2rem)] leading-none text-[#4a4a2a]">{dressCode.colours}</h2>
      </Fade>

      {/* fabric swatches pinned on a card, fanned slightly */}
      <Fade delay={0.12} className="mx-auto mt-8 flex max-w-sm items-end justify-center">
        {dressSwatches.map((sw, i) => {
          const mid = (dressSwatches.length - 1) / 2
          const off = i - mid
          return (
            <motion.div
              key={sw.hex}
              className="dress-swatch"
              style={{ zIndex: 10 - Math.abs(off) }}
              initial={{ y: 30, rotate: 0, opacity: 0 }}
              whileInView={{ y: Math.abs(off) * 6, rotate: off * 6, opacity: 1 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 1, delay: 0.15 + i * 0.08, ease: EASE }}
            >
              <span className="dress-chip" style={{ backgroundColor: sw.hex }} />
              <span className="dress-name">{sw.name}</span>
            </motion.div>
          )
        })}
      </Fade>

      <Fade delay={0.2}>
        <p className="display mx-auto mt-10 max-w-[17rem] text-[1.05rem] leading-snug text-[#4a3f2c] italic">{dressCode.note}</p>
      </Fade>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  FOOTER — the forest painting                                               */
/* -------------------------------------------------------------------------- */

/* gold line-art farewell: a floral arch with lanterns, on a rail */
function ThankYouArch() {
  const flowers = Array.from({ length: 15 }, (_, i) => {
    const t = (i / 14) * Math.PI
    return { x: 200 - Math.cos(t) * 92, y: 230 - Math.sin(t) * 150, r: 4 + (i % 3) }
  })
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMax meet" className="ty-arch h-full w-full text-[#b38a45]">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        {/* arch */}
        <path d="M108 252 V230 A92 150 0 0 1 292 230 V252" strokeWidth="1.6" />
        <path d="M120 252 V232 A80 136 0 0 1 280 232 V252" strokeWidth="0.8" opacity="0.6" />
        {/* flowers along the arch */}
        {flowers.map((f, i) => (
          <g key={i} transform={`translate(${f.x} ${f.y})`}>
            <circle r={f.r} strokeWidth="0.9" />
            <circle r={f.r * 0.35} fill="currentColor" stroke="none" />
            <path d={`M${-f.r - 5} 2 q4 -6 8 -1`} strokeWidth="0.8" opacity="0.7" />
          </g>
        ))}
        {/* hanging lanterns */}
        {[[165, 158], [235, 158], [200, 138]].map(([x, y], i) => (
          <g key={i} className="ty-lantern" style={{ animationDelay: `${i * 0.8}s` }}>
            <path d={`M${x} ${y - (y === 138 ? 50 : 58)} V${y - 12}`} strokeWidth="0.7" />
            <path d={`M${x - 7} ${y - 12} h14 l3 6 v16 l-3 6 h-14 l-3 -6 v-16 z`} strokeWidth="1.1" />
            <path d={`M${x} ${y + 16} v6`} strokeWidth="0.8" />
            <circle cx={x} cy={y + 2} r="3" fill="currentColor" stroke="none" opacity="0.55" />
          </g>
        ))}
        {/* aisle */}
        <path d="M188 252 L176 260 M212 252 L224 260" strokeWidth="0.8" opacity="0.6" />
        {/* vines either side */}
        <path d="M0 240 C40 225 60 245 100 232 M300 232 C340 245 360 225 400 240" strokeWidth="1" opacity="0.7" />
        {[20, 50, 80, 320, 350, 380].map((x) => (
          <path key={x} d={`M${x} 236 q6 -10 12 -4 q-6 6 -12 4`} strokeWidth="0.8" opacity="0.7" />
        ))}
        {/* rail */}
        <path d="M0 252 H400 M0 255 H400" strokeWidth="0.8" />
      </g>
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="heaven-footer relative overflow-hidden px-6 pt-28 pb-10 text-center text-[#5a4628] md:pt-36">
      {/* a heavenly glow: soft light from above, gentle rays, rising motes */}
      <div className="heaven" aria-hidden="true">
        <span className="heaven-sky" />
      </div>
      <div className="relative">
        <Fade>
          <p className="script text-[clamp(3rem,12vw,5rem)] leading-none">Thank you</p>
          <p className="arabic mt-6 text-2xl" lang="ar">
            بَارَكَ اللَّهُ لَنَا وَلَكُمْ
          </p>
          <p className="display mt-2 italic opacity-80">May Allah bless us all.</p>
        </Fade>
        <Fade delay={0.15}>
          <Sprig className="mt-10 text-[#b38a45]" />
          <p className="mt-8 text-[0.6rem] tracking-[0.36em] uppercase opacity-75">{hosts.label}</p>
          <p className="display mt-2 text-lg tracking-[0.12em] uppercase">
            {hosts.grandfather} &amp; {hosts.grandmother}
          </p>
          <p className="script mt-10 text-[clamp(2.4rem,10vw,3.5rem)] leading-tight">
            {groom.firstName} &amp; {bride.firstName}
          </p>
          <p className="mt-3 text-[0.6rem] tracking-[0.36em] uppercase opacity-75">
            {wedding.dayLabel} · {wedding.dateLabel}
          </p>
        </Fade>
        {/* a garden view resting on the line, like the nikkah's palace skyline */}
        <div className="ty-garden relative left-1/2 mt-12 w-screen -translate-x-1/2" aria-hidden="true">
          <ThankYouArch />
        </div>
        <div className="flex flex-col items-center gap-3 border-t border-[#b38a45]/40 pt-6">
          <p className="text-[0.6rem] text-[#6f5a3e]/70">Made with love, and a great many duas.</p>
          <a
            href="https://adhil-shimnaz-nikkah.fegno.com/?utm_source=adhil-shimnaz-reception&utm_medium=referral&utm_campaign=adhil-shimnaz-reception"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.5rem] tracking-[0.28em] text-[#8a7a55] uppercase hover:text-[#5a4628]"
          >
            Crafted by Fegno
          </a>
        </div>
      </div>
    </footer>
  )
}
