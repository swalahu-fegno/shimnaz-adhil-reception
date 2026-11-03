import { useState } from 'react'
import { ExternalLink, MapPin, Navigation } from '../ui/MughalIcons'
import { venue } from '../../data/wedding'
import { GlassCard } from '../ui/GlassCard'
import { ButtonLink } from '../ui/Button'
import { Reveal } from '../ui/Reveal'
import { CornerFlourish, Divider, Khatim } from '../ui/Ornaments'

/**
 * The venue map, folded into the Celebrations section.
 *
 * The iframe is lazy and starts behind an ivory veil bearing the seal — partly
 * so an unloaded Google frame never flashes grey into the layout, and partly
 * because a raw map embed is the fastest way to make a luxury page look like a
 * form. It fades out once the frame reports ready.
 */
export function VenueMap() {
  const [mapReady, setMapReady] = useState(false)

  return (
    <Reveal direction="up">
      <GlassCard className="overflow-hidden p-2 md:p-3">
        <div className="grid gap-0 lg:grid-cols-[1fr_1.25fr]">
          {/* ---- Details ---------------------------------------------- */}
          <div className="relative flex flex-col justify-center p-8 md:p-12">
            <CornerFlourish
              className="pointer-events-none absolute top-3 left-3 h-10 w-10 text-gold/40"
              aria-hidden="true"
            />

            <div className="relative mb-6 flex h-14 w-14 items-center justify-center">
              <Khatim className="animate-spin-slow h-full w-full text-gold/60" strokeWidth={0.8} />
              <MapPin className="absolute h-5 w-5 text-emerald" strokeWidth={1.25} />
            </div>

            <span className="eyebrow mb-3">The location</span>

            <h3 className="display mb-4 text-[clamp(1.75rem,3.6vw,2.5rem)] leading-tight text-ink">
              {venue.name}
            </h3>

            <Divider variant="lozenge" className="mb-5 max-w-[7rem]" />

            <address className="mb-9 text-[0.82rem] leading-loose font-light text-pretty text-muted not-italic">
              {venue.address}
            </address>

            <div className="flex flex-wrap gap-3">
              <ButtonLink
                href={venue.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="gold"
                size="sm"
                icon={<ExternalLink className="h-3.5 w-3.5" strokeWidth={1.25} />}
              >
                Open Maps
              </ButtonLink>

              <ButtonLink
                href={venue.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="sm"
                icon={<Navigation className="h-3.5 w-3.5" strokeWidth={1.25} />}
              >
                Directions
              </ButtonLink>
            </div>
          </div>

          {/* ---- Map --------------------------------------------------- */}
          <div className="relative min-h-[20rem] overflow-hidden lg:min-h-[26rem]">
            <iframe
              src={venue.embedUrl}
              title={`Map showing ${venue.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setMapReady(true)}
              className="absolute inset-0 h-full w-full border-0"
              style={{
                // Warm the map into the palette — Google's blues are cold
                filter: 'saturate(0.72) sepia(0.16) contrast(1.02) brightness(1.02)',
              }}
              allowFullScreen
            />

            {/* Veil — covers the frame until it's actually painted */}
            <div
              className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-ivory transition-opacity duration-1000 ${
                mapReady ? 'opacity-0' : 'opacity-100'
              }`}
              aria-hidden="true"
            >
              <Khatim className="animate-spin-slow h-14 w-14 text-gold/50" strokeWidth={0.8} />
            </div>

            {/* Gold inner hairline so the map sits inside the card, not on it */}
            <div
              className="pointer-events-none absolute inset-0 border border-gold/25"
              aria-hidden="true"
            />
          </div>
        </div>
      </GlassCard>
    </Reveal>
  )
}
