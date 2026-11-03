import { ArrowUpRight, Clock, MapPin, CalendarDays } from '../ui/MughalIcons'
import { events } from '../../data/wedding'
import { formatDate, formatDay } from '../../utils/date'
import { cn } from '../../utils/cn'
import { GlassCard } from '../ui/GlassCard'
import { ButtonLink } from '../ui/Button'
import { SectionHeading } from '../ui/SectionHeading'
import { Reveal, RevealGroup, RevealItem } from '../ui/Reveal'
import { Divider, LatticePattern, StarEight } from '../ui/Ornaments'
import { EventIcon } from '../ui/EventIcons'
// VenueMap is commented out below — restore this import if you bring it back.

/**
 * The Celebrations — the event cards, with the venue map folded in beneath.
 *
 * Events and Venue used to be two sections asking the same question ("where and
 * when?") and answering it twice. Merged, the cards state the details and the
 * map immediately grounds them.
 *
 * Each card carries the event's Arabic name set very large and very faint
 * behind the content — it functions as texture rather than as text, which is
 * how the section gets its warmth without another photograph.
 */
export function Events() {
  /**
   * Copy and layout follow the data rather than being written for a fixed
   * count. The section previously promised "two gatherings … your presence at
   * both" while `events` held only the Nikkah — so add or remove an event and
   * the wording, the grid and the heading all correct themselves.
   */
  const many = events.length > 1

  /**
   * When every event points at the same map, one shared "Get Directions" sits
   * below the grid instead of an identical button on each card. `null` when
   * they differ, which flips the buttons back to per-card.
   */
  const firstMaps = events[0]?.mapsUrl
  const sharedMaps =
    firstMaps && events.every((e) => e.mapsUrl === firstMaps) ? firstMaps : null

  return (
    <section id="events" className="section-y relative overflow-hidden" aria-label="Events">
      <LatticePattern
        id="events-lattice"
        className="pointer-events-none absolute inset-0 text-emerald/[0.05]"
        scale={56}
      />

      <div className="shell relative">
        {/*
          "Ceremony", not "Celebration": a Nikkah ceremony is a
          solemnisation — the celebrating is what a reception is for. If the
          Reception returns to `events`, the plural wording turns back on.

          The subtitle deliberately avoids "…, one intention", which the Couple
          section already uses. Repeating the construction one section later
          reads as a tic rather than a voice.
        */}
        <SectionHeading
          eyebrow={many ? 'Save the dates' : 'Save the date'}
          arabic={many ? 'المناسبات' : 'المناسبة'}
          title={many ? 'The Celebrations' : 'The Ceremony'}
          subtitle={
            many
              ? 'We would be honoured by your presence at both — and by your duas.'
              : 'We would be honoured by your presence — and by your duas.'
          }
          className="mb-16 md:mb-20"
        />

        <RevealGroup
          /* A lone card in a two-column grid sits stranded in the left half.
             On its own it gets centred at a readable width instead. */
          className={cn(
            'grid gap-8 md:gap-10',
            many ? 'md:grid-cols-2' : 'mx-auto max-w-xl',
          )}
          stagger={0.15}
        >
          {events.map((event) => (
            <RevealItem key={event.id} as="article" direction="up">
              <GlassCard interactive corners className="h-full p-8 md:p-10">
                {/* Arabic name as background texture */}
                {event.arabicName && (
                  <span
                    className="arabic pointer-events-none absolute -top-4 -right-2 text-[7rem] leading-none text-gold/[0.07] select-none md:text-[9rem]"
                    aria-hidden="true"
                  >
                    {event.arabicName}
                  </span>
                )}

                <div className="relative flex h-full flex-col">
                  {/* Icon medallion */}
                  <div className="relative mb-7 flex h-16 w-16 items-center justify-center">
                    <span className="absolute inset-0 rounded-full border border-gold/30" />
                    <StarEight
                      className="animate-spin-slow absolute inset-0 h-full w-full text-gold/20"
                      aria-hidden="true"
                    />
                    <span className="absolute inset-1 rounded-full bg-gold/[0.07]" />
                    <EventIcon name={event.icon} className="relative h-7 w-7 text-emerald" />
                  </div>

                  <h3 className="display text-[clamp(1.9rem,4vw,2.6rem)] leading-none text-ink">
                    {event.name}
                  </h3>

                  <Divider variant="lozenge" className="my-6 max-w-[7rem]" />

                  {/*
                    Each group is <div><dt/><dd/></div> with dt and dd as DIRECT
                    children — the icon lives inside the dt. Nesting them any
                    deeper is invalid dl structure and fails axe's definition-list
                    rule, even though it looks identical.
                  */}
                  <dl className="mb-7 space-y-4">
                    {/* Date and time are omitted entirely when the timing isn't
                        fixed — an empty row reads as a bug, not as "TBC". */}
                    {event.dateTime && (
                      <div className="grid grid-cols-[auto_1fr] items-start gap-x-3.5">
                        <dt className="mt-0.5">
                          <CalendarDays className="h-4 w-4 text-gold" strokeWidth={1.25} aria-hidden="true" />
                          <span className="sr-only">Date</span>
                        </dt>
                        <dd className="text-[0.8rem] font-light text-ink">
                          {formatDate(event.dateTime)}
                          <span className="block text-[0.65rem] tracking-[0.12em] text-muted uppercase">
                            {formatDay(event.dateTime)}
                          </span>
                        </dd>
                      </div>
                    )}

                    {event.timeLabel && (
                      <div className="grid grid-cols-[auto_1fr] items-start gap-x-3.5">
                        <dt className="mt-0.5">
                          <Clock className="h-4 w-4 text-gold" strokeWidth={1.25} aria-hidden="true" />
                          <span className="sr-only">Time</span>
                        </dt>
                        <dd className="text-[0.8rem] font-light text-ink">{event.timeLabel}</dd>
                      </div>
                    )}
                  </dl>

                  {/*
                    The venue is the one detail a guest has to ACT on, so the
                    whole panel is a link to the map — not just the button below.
                    It lives outside the <dl> because an <a> can't be a direct
                    child of a definition list.

                    On hover the tint warms and the arrow slides, so it reads as
                    tappable rather than as a static callout. The button below is
                    kept as well: some people look for a labelled action, others
                    tap the thing that looks like a place.
                  */}
                  <a
                    href={event.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Get directions to ${event.venue}, ${event.address}`}
                    className="group/venue mb-7 grid grid-cols-[auto_1fr_auto] items-center gap-x-3.5 rounded-[1px] border border-gold/30 bg-gold/[0.06] px-4 py-3.5 transition-colors duration-300 hover:border-gold/60 hover:bg-gold/[0.11] focus-visible:outline-gold"
                  >
                    {/* Row 1: pin, venue name and arrow on one line */}
                    <MapPin className="h-4 w-4 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
                    <span className="display block text-[1.2rem] leading-snug text-emerald md:text-[1.35rem]">
                      {event.venue}
                    </span>
                    {/* Affordance: an arrow that nudges on hover */}
                    <ArrowUpRight
                      className="h-4 w-4 text-gold-deep/70 transition-transform duration-300 group-hover/venue:translate-x-0.5 group-hover/venue:-translate-y-0.5"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    {/* Row 2: address, aligned under the name */}
                    <span className="col-start-2 mt-1 block text-[0.72rem] leading-relaxed font-light text-muted">
                      {event.address}
                    </span>
                  </a>

                  <p className="text-[0.78rem] leading-loose font-light text-pretty text-muted">
                    {event.description}
                  </p>

                  {/* Per-card directions ONLY when the events are at different
                      places. When they share a venue (the common case), the
                      single button below the grid handles it, so two identical
                      "Get Directions" don't sit side by side. */}
                  {!sharedMaps && (
                    <div className="mt-auto flex justify-center pt-8">
                      <ButtonLink
                        href={event.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="gold"
                        size="sm"
                        icon={<MapPin className="h-3.5 w-3.5" strokeWidth={1.25} />}
                        iconPosition="left"
                      >
                        Get Directions
                      </ButtonLink>
                    </div>
                  )}
                </div>
              </GlassCard>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* One shared directions button — both events are at the same venue,
            so a single call to action is clearer than one per card. */}
        {sharedMaps && (
          <Reveal direction="up" className="mt-12 flex justify-center md:mt-16">
            <ButtonLink
              href={sharedMaps}
              target="_blank"
              rel="noopener noreferrer"
              variant="emerald"
              size="md"
              icon={<MapPin className="h-4 w-4" strokeWidth={1.25} />}
              iconPosition="left"
            >
              Get Directions
            </ButtonLink>
          </Reveal>
        )}
      </div>
    </section>
  )
}
