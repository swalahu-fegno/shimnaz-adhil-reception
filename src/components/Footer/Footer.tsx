import { Mail, Phone } from '../ui/MughalIcons'
import type { ComponentType } from 'react'
import { bride, groom, socials, wedding, contact, type SocialLink } from '../../data/wedding'
import { Facebook, Instagram } from '../ui/BrandIcons'
import { Reveal, TextReveal } from '../ui/Reveal'
import { StarEight } from '../ui/Ornaments'
import { Particles } from '../FloatingPatterns/Particles'
import { Birds, GardenScene, GoldPalm, LotusDivider } from '../ui/Mughal'

const SOCIAL_ICONS: Record<SocialLink['icon'], ComponentType<{ className?: string; strokeWidth?: number }>> = {
  instagram: Instagram,
  facebook: Facebook,
  mail: Mail,
  phone: Phone,
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-emerald-deep" aria-label="Thank you">
      {/* ---- The card's garden in gold line, as dusk falls into charcoal ------- */}
      <div className="relative h-[42vw] max-h-[24rem] min-h-[14rem] overflow-hidden bg-gradient-to-b from-bg via-emerald to-emerald-deep" aria-hidden="true">
        <GardenScene className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 text-gold/70" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-emerald-deep to-transparent" />
        <Birds tone="text-gold-soft/60" />
      </div>

      {/* ---- Background: ornamental light and deep emerald ------------------ */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_30%,rgba(200,169,106,0.16),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-deep via-transparent to-emerald-deep" />
      </div>

      <Particles count={12} tone="gold" className="opacity-50" />

      {/* Gold seam */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="shell relative py-10 text-center md:py-20">
        {/* Seal */}
        <Reveal direction="scale">
          <div className="mb-9 flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <GoldPalm className="h-full w-full text-gold/80" />
              <span className="animate-pulse-soft absolute inset-4 -z-10 rounded-full bg-gold/20 blur-lg" />
            </div>
          </div>
        </Reveal>

        {/* Thank you */}
        <TextReveal
          text="Thank You"
          as="h2"
          className="display text-[clamp(2.5rem,8vw,5rem)] text-ivory"
        />

        <Reveal direction="up" delay={0.15}>
          <p className="arabic mx-auto mt-5 text-xl text-gold/85 md:text-2xl" lang="ar">
            بَارَكَ اللَّهُ لَنَا وَلَكُمْ
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.2}>
          <p className="display mx-auto mt-4 max-w-md text-[clamp(1.1rem,2.6vw,1.5rem)] text-balance text-ivory/70 italic">
            May Allah bless us all.
          </p>
        </Reveal>

        <Reveal direction="scale" delay={0.3} className="my-12 text-gold/70">
          <LotusDivider />
        </Reveal>

        {/* Couple + date */}
        <Reveal direction="up" delay={0.35}>
          <div className="flex flex-col items-center gap-4">
            <h3 className="display flex items-center gap-4 text-[clamp(1.75rem,5vw,3rem)] text-ivory">
              {groom.firstName}
              <span className="foil animate-foil text-[0.6em] italic">&amp;</span>
              {bride.firstName}
            </h3>

            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold/40" />
              <StarEight className="h-3 w-3 text-gold/70" />
              <span className="h-px w-8 bg-gold/40" />
            </div>

            <p className="font-body text-[0.58rem] font-light tracking-[0.36em] text-ivory/50 uppercase md:text-[0.66rem]">
              {wedding.dayLabel} · {wedding.dateLabel}
            </p>
            <p className="font-body text-[0.5rem] font-light tracking-[0.28em] text-gold/50 uppercase">
              {wedding.hijriLabel}
            </p>
          </div>
        </Reveal>

        {/* Contact — rehomed here when the RSVP section was removed. These are
            the only numbers on the page now, so they can't quietly vanish. */}
        {(contact.phones.length > 0 || contact.email) && <Reveal direction="up" delay={0.4}>
          <div className="mt-14 flex flex-col items-center gap-4">
            <p className="font-body text-[0.5rem] font-light tracking-[0.32em] text-gold/70 uppercase">
              For any assistance
            </p>

            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              {contact.phones.length > 0 && contact.phones.map((phone) => (
                <li key={phone}>
                  {/*
                    Jost, not the display serif. Playfair sets numerals as
                    old-style figures — digits at differing heights, some below
                    the baseline — which is beautiful in prose and awful in a
                    phone number you're meant to read digit by digit. Tabular
                    lining figures, a touch of tracking and full-strength ivory
                    make it scannable on the dark ground.
                  */}
                  <a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    className="font-body text-[0.95rem] font-normal tracking-[0.06em] text-ivory tabular-nums transition-colors hover:text-gold md:text-[1.05rem]"
                  >
                    {phone}
                  </a>
                </li>
              ))}
            </ul>

            {/* Nudged up from 0.68rem: it's a contact detail someone may need
                to read off a phone screen, not decoration. */}
            {contact.email && <a
              href={`mailto:${contact.email}`}
              className="mt-1 font-body text-[0.8rem] font-light tracking-[0.04em] text-gold/90 transition-colors hover:text-gold"
            >
              {contact.email}
            </a>}
          </div>
        </Reveal>}

        {/* Socials */}
        <Reveal direction="up" delay={0.45}>
          <ul className="mt-12 flex justify-center gap-4">
            {socials.map((social) => {
              const Icon = SOCIAL_ICONS[social.icon]
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 text-gold/80 transition-all duration-500 hover:border-gold hover:text-emerald-deep"
                  >
                    {/* Gold fills the disc on hover */}
                    <span className="absolute inset-0 scale-0 rounded-full bg-gold transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100" />
                    <Icon className="relative h-4 w-4" strokeWidth={1.25} />
                  </a>
                </li>
              )
            })}
          </ul>
        </Reveal>

        {/* Colophon */}
        <Reveal direction="fade" delay={0.55}>
          <div className="mt-16 flex flex-col items-center gap-3 border-t border-gold/15 pt-8">
            <p className="text-[0.6rem] leading-relaxed font-light text-balance text-ivory/40">
              Made with love, and a great many duas.
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  )
}
