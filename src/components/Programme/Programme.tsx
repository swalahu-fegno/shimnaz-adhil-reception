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
export function Programme() {
  return (
    <section id="programme" className="section-y relative overflow-hidden bg-ivory" aria-label="Programme">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg to-transparent" />

      <div className="shell relative">
        <SectionHeading
          eyebrow={venue.name}
          arabic="برنامج"
          title="The Evening"
          subtitle="Three moments, one blessed day."
          className="mb-14 md:mb-20"
        />

        <div className="grid items-center gap-14 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-20">
          {/* Jharokha window */}
          <Reveal direction="scale">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm">
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
                  <circle cx="200" cy="120" r="26" fill="#e3d3ae" opacity="0.18" />
                  <circle cx="200" cy="120" r="16" fill="#e3d3ae" opacity="0.35" />
                </g>
              </svg>
              <div className="absolute inset-x-0 bottom-0 overflow-hidden text-gold" style={{ height: '72%' }}>
                <GardenScene className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2" />
              </div>
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 0 40% 0)' }}>
                <Birds tone="text-gold-soft/70" />
              </div>
              <CuspedArch className="absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] text-gold" />
              <span className="absolute -bottom-3 left-1/2 h-px w-[115%] -translate-x-1/2 bg-gradient-to-r from-transparent via-gold to-transparent" />
            </div>
          </Reveal>

          {/* Timeline */}
          <div>
            <RevealGroup className="relative flex flex-col gap-10 pl-10">
              <span
                className="absolute top-2 bottom-2 left-[0.6rem] w-px bg-gradient-to-b from-gold/0 via-gold/70 to-gold/0"
                aria-hidden="true"
              />
              {programme.map((item) => (
                <RevealItem key={item.time} className="relative">
                  <span
                    className="absolute top-1.5 -left-10 flex h-5 w-5 rotate-45 items-center justify-center border border-gold bg-ivory"
                    aria-hidden="true"
                  >
                    <span className="h-1.5 w-1.5 bg-gold" />
                  </span>
                  <p className="royal text-sm tracking-[0.25em] text-gold-deep">{item.time}</p>
                  <h3 className="display mt-1 text-3xl text-ink md:text-4xl">{item.title}</h3>
                  <p className="mt-1 text-[0.8rem] font-light text-muted">{item.note}</p>
                </RevealItem>
              ))}
            </RevealGroup>

            {/* Dress code */}
            <Reveal direction="up" delay={0.2}>
              <div className="mt-14 border border-gold/35 bg-bg/70 px-6 py-7 text-center">
                <Lotus className="mx-auto mb-3 h-4 w-7 text-gold" />
                <p className="eyebrow text-[0.55rem]">Dress Code</p>
                <p className="display mt-2 text-2xl text-ink">{dressCode.colours}</p>
                <div className="mt-5 flex justify-center gap-5">
                  {dressSwatches.map((s) => (
                    <div key={s.name} className="flex flex-col items-center gap-2">
                      <span
                        className="h-10 w-10 rounded-full border border-gold/60 shadow-card"
                        style={{ background: s.hex }}
                      />
                      <span className="text-[0.55rem] tracking-[0.18em] text-muted uppercase">{s.name}</span>
                    </div>
                  ))}
                </div>
                <p className="mx-auto mt-5 max-w-xs text-[0.75rem] leading-relaxed font-light text-muted italic">
                  {dressCode.note}
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <LotusDivider className="mt-16" />
      </div>
    </section>
  )
}
