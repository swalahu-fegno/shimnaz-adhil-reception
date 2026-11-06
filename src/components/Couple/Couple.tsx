import { bride, groom, type Person } from '../../data/wedding'
import { LatticePattern } from '../ui/Ornaments'
import { Cypress, CuspedArch, FlowerUrn, LotusMedallion, LotusPlinth, Peacock, Toran } from '../ui/Mughal'
import { TiltGlow } from '../ui/Effects'
import { SectionHeading } from '../ui/SectionHeading'
import { RevealGroup, RevealItem } from '../ui/Reveal'
import { CoupleSlider } from './CoupleSlider'

/**
 * One arched panel — a palace window framing one of the couple: a large faint
 * initial behind the name in engraved capitals, then the parents.
 */
function ArchPanel({ person, relation }: { person: Person; relation: string }) {
  return (
    <TiltGlow max={4} className="mx-auto w-full max-w-[17rem]">
      <div className="relative aspect-[3/4] w-full">
        {/* ivory pane inside the cusped arch */}
        <div className="absolute inset-0 [clip-path:url(#couple-arch-clip)] bg-gradient-to-b from-[#fffcf6] to-[#f3ead9] shadow-[var(--shadow-card)]" />
        <CuspedArch className="absolute -inset-1 h-[calc(100%+0.5rem)] w-[calc(100%+0.5rem)] text-gold md:-inset-2 md:h-[calc(100%+1rem)] md:w-[calc(100%+1rem)]" />
        {/* festive toran strung across the arch */}
        <Toran className="absolute top-[23%] left-[4%] h-[11%] w-[92%] text-gold-deep/70" />

        <div className="absolute inset-x-0 bottom-[4%] top-[32%] flex flex-col items-center justify-center px-[8%] text-center">
          {/* initial, as a watermark */}
          <span
            className="royal pointer-events-none absolute top-[2%] left-1/2 -translate-x-1/2 text-[4.5rem] leading-none text-gold/[0.12] select-none md:text-[7.5rem]"
            aria-hidden="true"
          >
            {person.initial}
          </span>

          <h3 className="royal relative text-[clamp(0.8rem,3.4vw,1.25rem)] leading-snug tracking-[0.06em] text-ink md:tracking-[0.1em]">
            {person.fullName}
          </h3>
          <span className="relative mt-2 h-px w-12 bg-gradient-to-r from-transparent via-gold to-transparent md:mt-3 md:w-16" aria-hidden="true" />
          <p className="relative mt-2 text-[0.6rem] tracking-[0.22em] text-gold-deep uppercase md:mt-4 md:text-[0.65rem] md:tracking-[0.3em]">{relation}</p>
          <p className="display relative mt-1 text-[clamp(0.75rem,3.2vw,1.02rem)] leading-snug text-ink/80 md:mt-2 md:leading-relaxed">
            <span className="block">{person.father}</span>
            <span className="block text-gold">&amp;</span>
            <span className="block">{person.mother}</span>
          </p>
        </div>
      </div>
    </TiltGlow>
  )
}

/**
 * The Couple — two palace windows joined by a lotus.
 *
 * Each of them stands in a cusped Mughal arch hung with a toran, their parents
 * beneath their name; a lotus medallion carrying the ampersand sits between
 * the arches, which stand on a lotus plinth. Outside, a peacock keeps watch
 * before a cypress, with an urn of flowers at its side. Phones keep the arches
 * side by side and gather the garden into one row beneath, so the whole
 * section fits on a single screen.
 */
export function Couple() {
  return (
    <section
      id="couple"
      className="relative overflow-hidden bg-ivory py-12 md:py-[clamp(4rem,8vw,7.5rem)]"
      aria-label="The Couple"
    >
      <LatticePattern
        id="couple-lattice"
        className="pointer-events-none absolute inset-0 text-gold/[0.06]"
        scale={52}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent" />

      {/* Shared clip shape for the arch panes */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id="couple-arch-clip" clipPathUnits="objectBoundingBox">
            <path d={archClip} />
          </clipPath>
        </defs>
      </svg>

      <div className="shell relative">
        <SectionHeading
          eyebrow="Bismillah — the two families"
          arabic="العروسان"
          title="The Couple"
          subtitle="Two families, one intention — brought together by the mercy of Allah."
          className="mb-8 max-md:gap-3 md:mb-20"
        />

        <div className="relative flex items-end justify-center gap-2 lg:gap-6">
          {/* left garden: a cypress behind the peacock */}
          <div className="relative hidden shrink-0 items-end lg:flex" aria-hidden="true">
            <Cypress className="h-60 w-auto text-gold/45 xl:h-72" />
            <Peacock className="-ml-12 h-44 w-auto text-gold xl:h-52" />
            <FlowerUrn className="-ml-6 h-20 w-auto text-gold-deep/80" />
          </div>

          <div className="w-full max-w-3xl min-w-0 flex-1">
            <RevealGroup className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-1.5 md:gap-2">
              <RevealItem>
                <ArchPanel person={groom} relation="Son of" />
              </RevealItem>

              <RevealItem>
                <div className="relative mx-auto flex h-11 w-11 items-center justify-center md:h-20 md:w-20 lg:h-24 lg:w-24">
                  <LotusMedallion className="absolute inset-0 h-full w-full text-gold/45" />
                  <span className="royal relative mt-0.5 text-lg text-gold-deep md:mt-1 md:text-3xl">&amp;</span>
                </div>
              </RevealItem>

              <RevealItem>
                <ArchPanel person={bride} relation="Daughter of" />
              </RevealItem>
            </RevealGroup>

            {/* the plinth the arches stand on */}
            <LotusPlinth className="mt-2 h-5 w-full text-gold/70 md:mt-3 md:h-7" />
          </div>

          {/* right garden, mirrored */}
          <div className="relative hidden shrink-0 items-end lg:flex" aria-hidden="true">
            <FlowerUrn className="-mr-6 h-20 w-auto text-gold-deep/80" flip />
            <Peacock className="-mr-12 h-44 w-auto text-gold xl:h-52" flip />
            <Cypress className="h-60 w-auto text-gold/45 xl:h-72" />
          </div>
        </div>

        {/* phones: one compact garden row — cypress, peacock and urn each side */}
        <div className="mt-3 flex items-end justify-center md:hidden" aria-hidden="true">
          <Cypress className="h-24 w-auto text-gold/45" />
          <Peacock className="-ml-3 h-[5.5rem] w-auto text-gold" />
          <FlowerUrn className="-ml-2 h-14 w-auto text-gold-deep/80" />
          <span className="w-4" />
          <FlowerUrn className="-mr-2 h-14 w-auto text-gold-deep/80" flip />
          <Peacock className="-mr-3 h-[5.5rem] w-auto text-gold" flip />
          <Cypress className="h-24 w-auto text-gold/45" />
        </div>

        <div className="mx-auto mt-12 max-w-md md:mt-16">
          <CoupleSlider />
        </div>
      </div>
    </section>
  )
}

/**
 * The arch as an objectBoundingBox clip path (0–1 units): the same pointed
 * arch the cusped outline follows, as a smooth curve, normalised to 0–1.
 */
const archClip = (() => {
  const w = 200
  const h = 266
  // Rebuild the same arch the outline uses, then normalise to 0–1.
  const spring = h * 0.5
  const half = w / 2
  const r = (half * half + spring * spring) / (2 * half)
  const pts: string[] = [`M0 1`, `L0 ${(spring / h).toFixed(4)}`]
  const steps = 24
  for (let i = 1; i <= steps; i++) {
    const a = Math.PI + (Math.atan2(-spring, half - r) + 2 * Math.PI - Math.PI) * (i / steps)
    pts.push(`L${((r + r * Math.cos(a)) / w).toFixed(4)} ${((spring + r * Math.sin(a)) / h).toFixed(4)}`)
  }
  for (let i = steps - 1; i >= 0; i--) {
    const a = Math.PI + (Math.atan2(-spring, half - r) + 2 * Math.PI - Math.PI) * (i / steps)
    pts.push(`L${((w - (r + r * Math.cos(a))) / w).toFixed(4)} ${((spring + r * Math.sin(a)) / h).toFixed(4)}`)
  }
  pts.push('L1 1 Z')
  return pts.join(' ')
})()
