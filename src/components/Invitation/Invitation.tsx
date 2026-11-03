import { bride, groom, wedding, hosts } from '../../data/wedding'
import { CornerFlourish, GirihPattern } from '../ui/Ornaments'
import { BlossomSpray, Lotus, LotusLake, LotusMedallion } from '../ui/Mughal'
import { Reveal } from '../ui/Reveal'

/**
 * The invitation card, drawn after the family's illustrated card.
 *
 * Ivory paper inside a gold border band; blossom sprays arch in from the
 * top corners; a lotus medallion crowns an engraved NIKKAH, the names and
 * the date; and a lotus lake with a terrace rail runs along the foot. Its
 * vectors are its own — palms, peacocks and the chhatri garden belong to
 * other sections. All line work, in the card's champagne gold.
 */
export function Invitation() {
  return (
    <section id="invitation" className="section-y relative overflow-hidden" aria-label="Invitation">
      <GirihPattern
        id="invitation-girih"
        className="pointer-events-none absolute inset-0 text-gold/[0.055]"
        scale={90}
      />

      <div className="shell-narrow relative">
        <Reveal direction="up">
          <article className="relative mx-auto max-w-[40rem] bg-gradient-to-br from-gold-soft via-gold to-gold-deep p-[2px] shadow-[var(--shadow-luxe)]">
            {/* Border band: ivory with a running bead-and-fleur trim */}
            <div className="card-band relative bg-ivory p-2.5 md:p-3.5">
              <div className="relative overflow-hidden border border-gold/70 bg-bg">
                <GirihPattern
                  id="card-paper"
                  className="pointer-events-none absolute inset-0 text-gold/[0.07]"
                  scale={64}
                />
                {(['top-1 left-1', 'top-1 right-1 rotate-90', 'bottom-1 right-1 rotate-180', 'bottom-1 left-1 -rotate-90'] as const).map(
                  (pos) => (
                    <CornerFlourish key={pos} className={`pointer-events-none absolute z-20 h-12 w-12 text-gold md:h-16 md:w-16 ${pos}`} />
                  ),
                )}

                {/* Blossom sprays arching in from the top corners */}
                <div className="pointer-events-none absolute inset-x-0 top-0 text-gold-deep/80" aria-hidden="true">
                  <BlossomSpray className="absolute top-2 left-2 w-[30%] max-w-[11rem]" />
                  <BlossomSpray className="absolute top-2 right-2 w-[30%] max-w-[11rem]" flip />
                </div>

                <div className="relative z-10 flex flex-col items-center px-[14%] pt-14 text-center md:pt-20">
                  <LotusMedallion className="h-16 w-16 text-gold md:h-20 md:w-20" />

                  <p className="arabic mt-4 text-[clamp(1.05rem,3.4vw,1.5rem)] leading-relaxed text-gold-deep" lang="ar">
                    {wedding.bismillah.arabic}
                  </p>

                  <p className="royal mt-3 text-[0.62rem] tracking-[0.18em] text-ink md:text-xs">
                    {hosts.grandfather} &amp; {hosts.grandmother}
                  </p>
                  <p className="display mt-1.5 max-w-xs text-[clamp(0.85rem,2.2vw,1rem)] leading-snug text-balance text-ink/70 italic">
                    {wedding.invitationMessage}
                  </p>

                  {/* NIKKAH, engraved */}
                  <h2 className="royal foil animate-foil mt-5 text-[clamp(2.6rem,10vw,4.75rem)] leading-none tracking-[0.06em]">
                    Nikkah
                  </h2>

                  <p className="royal mt-4 text-[clamp(0.85rem,2.6vw,1.2rem)] tracking-[0.14em] text-ink">
                    {bride.fullName}
                  </p>
                  <div className="my-1.5 flex items-center justify-center gap-3" aria-hidden="true">
                    <span className="h-px w-10 bg-gold/70 md:w-16" />
                    <span className="royal text-base text-gold-deep">&amp;</span>
                    <span className="h-px w-10 bg-gold/70 md:w-16" />
                  </div>
                  <p className="royal text-[clamp(0.85rem,2.6vw,1.2rem)] tracking-[0.14em] text-ink">{groom.fullName}</p>
                  <p className="display mt-1 text-sm text-ink/60 italic">Insha Allah</p>

                  {/* Date block, as on the card */}
                  <Lotus className="mt-5 h-4 w-7 text-gold" />
                  <div className="mt-2 flex flex-col items-center">
                    <span className="royal text-[0.62rem] tracking-[0.3em] text-ink md:text-xs">December</span>
                    <span className="royal text-[clamp(2.2rem,7vw,3.25rem)] leading-none text-gold-deep">03</span>
                    <span className="royal text-[0.62rem] tracking-[0.45em] text-ink md:text-xs">2026</span>
                  </div>

                  <p className="display mt-5 max-w-xs text-[clamp(0.8rem,2vw,0.95rem)] leading-snug text-pretty text-ink/70 italic">
                    “{wedding.invitationSubtext}”
                  </p>
                </div>

                {/* The lotus lake along the foot */}
                <div className="relative z-10 mt-4 text-gold-deep/85" aria-hidden="true">
                  <LotusLake className="block h-auto w-full" />
                </div>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  )
}
