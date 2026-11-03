import { bride, groom, type Person } from '../../data/wedding'
import { LatticePattern } from '../ui/Ornaments'
import { Cypress, CuspedArch, FlowerUrn, LotusMedallion, LotusPlinth, Peacock, Toran } from '../ui/Mughal'
import { TiltGlow } from '../ui/Effects'
import { SectionHeading } from '../ui/SectionHeading'
import { RevealGroup, RevealItem } from '../ui/Reveal'

/**
 * One arched panel — a palace window framing one of the couple: a large faint
 * initial behind the name in engraved capitals, then the parents.
 */
function ArchPanel({ person, relation }: { person: Person; relation: string }) {
  return (
    <TiltGlow max={4} className="mx-auto w-full max-w-[17rem]">
      <div className="relative aspect-[5/6] w-full sm:aspect-[3/4]">
        {/* ivory pane inside the cusped arch */}
        <div className="absolute inset-0 [clip-path:url(#couple-arch-clip)] bg-gradient-to-b from-[#fffcf6] to-[#f3ead9] shadow-[var(--shadow-card)]" />
        <CuspedArch className="absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] text-gold" />
        {/* festive toran strung across the arch */}
        <Toran className="absolute top-[24%] left-[4%] h-[13%] w-[92%] text-gold-deep/70" />

        <div className="absolute inset-x-0 bottom-[4%] top-[30%] flex flex-col items-center justify-center px-[10%] text-center">
          {/* initial, as a watermark */}
          <span
            className="royal pointer-events-none absolute top-[2%] left-1/2 -translate-x-1/2 text-[7.5rem] leading-none text-gold/[0.12] select-none"
            aria-hidden="true"
          >
            {person.initial}
          </span>

          <h3 className="royal relative text-[clamp(0.95rem,1.9vw,1.25rem)] leading-snug tracking-[0.1em] text-ink">
            {person.fullName}
          </h3>
          <span className="relative mt-3 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden="true" />
          <p className="relative mt-4 text-[0.65rem] tracking-[0.3em] text-gold-deep uppercase">{relation}</p>
          <p className="display relative mt-2 text-[clamp(0.9rem,1.5vw,1.02rem)] leading-relaxed text-ink/80">
            {person.father}
            <span className="mx-1.5 text-gold">&amp;</span>
            <br className="sm:hidden" />
            {person.mother}
          </p>
        </div>
      </div>
      <LotusPlinth className="mt-3 h-5 w-full text-gold/70 md:hidden" />
    </TiltGlow>
  )
}

/**
 * The Couple — two palace windows joined by a lotus.
 *
 * Each of them stands in a cusped Mughal arch hung with a toran, their parents
 * beneath their name; a lotus medallion carrying the ampersand sits between
 * the arches, which stand on a lotus plinth. Outside, a peacock keeps watch
 * before a cypress, with an urn of flowers at its side. On phones the arches stack
 * and the garden gathers into a small row beneath them.
 */
export function Couple() {
  return (
    <section id="couple" className="section-y relative overflow-hidden bg-ivory" aria-label="The Couple">
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
          className="mb-14 md:mb-20"
        />

        <div className="relative flex items-end justify-center gap-2 lg:gap-6">
          {/* left garden: a cypress behind the peacock */}
          <div className="relative hidden shrink-0 items-end lg:flex" aria-hidden="true">
            <Cypress className="h-60 w-auto text-gold/45 xl:h-72" />
            <Peacock className="-ml-12 h-44 w-auto text-gold xl:h-52" />
            <FlowerUrn className="-ml-6 h-20 w-auto text-gold-deep/80" />
          </div>

          <div className="w-full max-w-3xl min-w-0 flex-1">
            <RevealGroup className="grid w-full items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-2">
              <RevealItem>
                <ArchPanel person={groom} relation="Son of" />
              </RevealItem>

              <RevealItem>
                <div className="flex items-center justify-center gap-2">
                  <Peacock className="h-28 w-auto text-gold md:hidden" />
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center md:h-20 md:w-20 lg:h-24 lg:w-24">
                    <LotusMedallion className="absolute inset-0 h-full w-full text-gold/45" />
                    <span className="royal relative mt-1 text-3xl text-gold-deep">&amp;</span>
                  </div>
                  <Peacock className="h-28 w-auto text-gold md:hidden" flip />
                </div>
              </RevealItem>

              <RevealItem>
                <ArchPanel person={bride} relation="Daughter of" />
              </RevealItem>
            </RevealGroup>

            {/* the plinth the arches stand on */}
            <div className="relative mt-3 hidden md:block" aria-hidden="true">
              <LotusPlinth className="h-7 w-full text-gold/70" />
            </div>
          </div>

          {/* right garden, mirrored */}
          <div className="relative hidden shrink-0 items-end lg:flex" aria-hidden="true">
            <FlowerUrn className="-mr-6 h-20 w-auto text-gold-deep/80" flip />
            <Peacock className="-mr-12 h-44 w-auto text-gold xl:h-52" flip />
            <Cypress className="h-60 w-auto text-gold/45 xl:h-72" />
          </div>
        </div>

        {/* phones: a garden row under the arches — cypresses and urns */}
        <div className="mt-8 flex items-end justify-center gap-5 md:hidden" aria-hidden="true">
          <Cypress className="h-36 w-auto text-gold/50" />
          <FlowerUrn className="h-24 w-auto text-gold-deep/80" />
          <Cypress className="h-28 w-auto text-gold/40" />
          <FlowerUrn className="h-24 w-auto text-gold-deep/80" flip />
          <Cypress className="h-36 w-auto text-gold/50" />
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
