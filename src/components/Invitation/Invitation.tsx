import { bride, groom, wedding, hosts } from '../../data/wedding'
import { GirihPattern } from '../ui/Ornaments'
import { GoldPalm, LotusDivider } from '../ui/Mughal'
import { Reveal, TextReveal } from '../ui/Reveal'

/**
 * The Bismillah card — the site's quiet centre.
 *
 * Deliberately the least decorated section on the page. It follows the Hero's
 * cinematic noise with near-silence: one seal, one line of Arabic, and a great
 * deal of paper. The restraint is the point.
 */
export function Invitation() {
  return (
    <section id="invitation" className="section-y relative overflow-hidden" aria-label="Invitation">
      {/* Barely-there girih wash */}
      <GirihPattern
        id="invitation-girih"
        className="pointer-events-none absolute inset-0 text-gold/[0.055]"
        scale={90}
      />

      <div className="shell-narrow relative">
        <div className="grain relative mx-auto flex flex-col items-center px-6 py-6 text-center md:px-16 md:py-20">
          {/* Hairline frame with notched corners */}
          <div
            className="pointer-events-none absolute inset-0 border border-gold/25"
            aria-hidden="true"
          />
          {(
            [
              'top-0 left-0 border-t-2 border-l-2',
              'top-0 right-0 border-t-2 border-r-2',
              'bottom-0 left-0 border-b-2 border-l-2',
              'bottom-0 right-0 border-b-2 border-r-2',
            ] as const
          ).map((pos) => (
            <span
              key={pos}
              className={`pointer-events-none absolute h-5 w-5 border-gold/70 ${pos}`}
              aria-hidden="true"
            />
          ))}

          {/* Seal */}
          <Reveal direction="scale">
            <div className="relative mb-9 flex items-center justify-center">
              <GoldPalm className="h-24 w-20 text-gold md:h-28 md:w-24" />
              <span className="absolute inset-0 -z-10 rounded-full bg-gold/10 blur-xl" />
            </div>
          </Reveal>

          {/* Bismillah — the largest Arabic on the page */}
          <Reveal direction="up" delay={0.1}>
            <p
              className="arabic text-[clamp(1.6rem,5vw,2.6rem)] leading-relaxed text-emerald"
              lang="ar"
            >
              {wedding.bismillah.arabic}
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.2}>
            <p className="mt-4 max-w-md text-[0.68rem] leading-relaxed font-light tracking-[0.12em] text-balance text-muted">
              {wedding.bismillah.translation}
            </p>
          </Reveal>

          <Reveal direction="scale" delay={0.3} className="my-10 w-full">
            <LotusDivider />
          </Reveal>

          {/* The ask — worded as on the family's printed card */}
          <Reveal direction="up">
            <p className="royal text-[0.78rem] tracking-[0.22em] text-ink md:text-sm">
              {hosts.grandfather} &amp; {hosts.grandmother}
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="display mt-4 max-w-md text-[clamp(1.1rem,2.6vw,1.4rem)] leading-relaxed text-balance text-muted italic">
              {wedding.invitationMessage}
            </p>
          </Reveal>

          <TextReveal
            text={bride.fullName}
            as="p"
            className="royal mt-8 text-gold-deep text-[clamp(1.6rem,5.4vw,3rem)] leading-tight"
            stagger={0.05}
          />
          <Reveal direction="up" delay={0.15}>
            <div className="my-3 flex items-center justify-center gap-4">
              <span className="h-px w-14 bg-gold/50 md:w-24" />
              <span className="display text-xl text-gold-deep italic">with</span>
              <span className="h-px w-14 bg-gold/50 md:w-24" />
            </div>
          </Reveal>
          <TextReveal
            text={groom.fullName}
            as="p"
            className="royal text-gold-deep text-[clamp(1.6rem,5.4vw,3rem)] leading-tight"
            stagger={0.05}
          />
          <Reveal direction="up" delay={0.2}>
            <p className="display mt-3 text-lg text-muted italic">Insha Allah</p>
          </Reveal>

          <Reveal direction="up" delay={0.25}>
            <p className="display mt-8 max-w-md text-[clamp(1rem,2.2vw,1.2rem)] leading-relaxed text-pretty text-ink/80 italic">
              “{wedding.invitationSubtext}”
            </p>
          </Reveal>

          {/* Signature */}
          {/* <Reveal direction="fade" delay={0.35}>
            <div className="flex flex-col items-center gap-3">
              <span className="h-8 w-px bg-gradient-to-b from-transparent to-gold/60" />
              <p className="display text-2xl text-ink italic md:text-3xl">
                {groom.firstName} <span className="text-gold">&amp;</span> {bride.firstName}
              </p>
              <p className="eyebrow text-[0.5rem]">{wedding.dateLabel}</p>
            </div>
          </Reveal> */}
        </div>
      </div>
    </section>
  )
}
