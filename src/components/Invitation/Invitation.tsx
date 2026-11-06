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
    <section
      id="invitation"
      className="relative overflow-hidden py-6 md:py-[clamp(4rem,8vw,7.5rem)]"
      aria-label="Invitation"
    >
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
                  <BlossomSpray className="absolute top-2 left-2 w-[24%] max-w-[11rem] md:w-[30%]" />
                  <BlossomSpray className="absolute top-2 right-2 w-[24%] max-w-[11rem] md:w-[30%]" flip />
                </div>

                <div className="relative z-10 flex flex-col items-center px-[12%] pt-11 text-center md:px-[14%] md:pt-20">
                  <LotusMedallion className="h-14 w-14 text-gold md:h-20 md:w-20" />

                  <p className="arabic mt-2 text-[clamp(1.05rem,3.4vw,1.5rem)] leading-relaxed text-gold-deep md:mt-4" lang="ar">
                    {wedding.bismillah.arabic}
                  </p>

                  <p className="royal mt-2 text-[0.62rem] tracking-[0.14em] text-ink md:mt-3 md:text-xs md:tracking-[0.18em]">
                    {hosts.grandfather} &amp; {hosts.grandmother}
                  </p>
                  <p className="display mt-1.5 max-w-xs text-[clamp(0.85rem,2.2vw,1rem)] leading-snug text-balance text-ink/70 italic">
                    {wedding.invitationMessage}
                  </p>

                  {/* RECEPTION, engraved */}
                  <h2 className="royal foil animate-foil mt-5 text-[clamp(2.4rem,10vw,4.75rem)] leading-none tracking-[0.06em] md:mt-5">
                    Reception
                  </h2>

                  <p className="royal mt-3 text-[clamp(0.85rem,2.6vw,1.2rem)] tracking-[0.14em] text-ink md:mt-4">
                    {groom.fullName}
                  </p>
                  <div className="my-1 flex items-center justify-center gap-3 md:my-1.5" aria-hidden="true">
                    <span className="h-px w-10 bg-gold/70 md:w-16" />
                    <span className="royal text-base text-gold-deep">&amp;</span>
                    <span className="h-px w-10 bg-gold/70 md:w-16" />
                  </div>
                  <p className="royal text-[clamp(0.85rem,2.6vw,1.2rem)] tracking-[0.14em] text-ink">{bride.fullName}</p>
                  <p className="display text-sm text-ink/60 italic md:mt-1">Insha Allah</p>

                  {/* Date block, as on the card */}
                  <Lotus className="mt-5 hidden h-4 w-7 text-gold md:block" />
                  <div className="mt-5 flex items-center gap-3 md:mt-2 md:flex-col md:gap-0">
                    <span className="royal text-[0.62rem] tracking-[0.3em] text-ink md:text-xs">December</span>
                    <span className="royal text-[clamp(2.2rem,7vw,3.25rem)] leading-none text-gold-deep">09</span>
                    <span className="royal text-[0.62rem] tracking-[0.45em] text-ink md:text-xs">2026</span>
                  </div>

                  <p className="display mt-5 max-w-xs text-[clamp(0.8rem,2vw,0.95rem)] leading-snug text-pretty text-ink/70 italic md:mt-5">
                    “{wedding.invitationSubtext}”
                  </p>
                </div>

                {/* The lotus lake along the foot */}
                <div className="relative z-10 -mt-[6%] text-gold-deep/85 md:mt-4" aria-hidden="true">
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
