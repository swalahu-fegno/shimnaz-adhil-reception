/* ============================================================================
 * WEDDING DATA — the single source of truth for the whole invitation.
 *
 *  ▸ Every user-facing string, date, name and link lives here.
 *  ▸ No component hardcodes content. Edit this file only.
 *  ▸ Fields marked  // VERIFY:  are derived or assumed — please confirm them.
 *
 *  The one exception is the boot shell in index.html (the couple's initials),
 *  which must paint before JavaScript loads. See README.
 * ========================================================================== */

export interface Person {
  /** Given name shown large in the Hero */
  firstName: string
  /** Full formal name shown in the Couple section */
  fullName: string
  /** Arabic rendering — optional, omit to hide */
  arabicName?: string
  father: string
  mother: string
  /** Path under /public. Drop the real photo at this exact path. */
  image: string
  /** Single initial used by the preloader monogram */
  initial: string
}

export interface WeddingEvent {
  id: string
  name: string
  arabicName?: string
  /** ISO 8601 with offset. Null when the timing isn't fixed yet — the card
   *  then shows the venue alone and the countdown ignores it. */
  dateTime: string | null
  /** Human-readable time, e.g. "5:00 PM". Empty string hides the row. */
  timeLabel: string
  venue: string
  address: string
  description: string
  icon: 'nikkah' | 'walima'
  mapsUrl: string
}

export interface SocialLink {
  label: string
  href: string
  icon: 'instagram' | 'facebook' | 'mail' | 'phone'
}

/* -------------------------------------------------------------------------- */
/*  COUPLE                                                                     */
/* -------------------------------------------------------------------------- */

export const groom: Person = {
  firstName: 'Adhil',
  fullName: 'Adhil KP',
  father: 'Ahammed Kutty KP',
  mother: 'Sakeena M',
  image: `${import.meta.env.BASE_URL}images/groom.jpg`,
  initial: 'A',
}

export const bride: Person = {
  firstName: 'Shimnaz',
  fullName: 'Shimnaz Fathima Nazar',
  father: 'PA Nazar',
  mother: 'Shahnaz Nazar',
  image: `${import.meta.env.BASE_URL}images/bride.jpg`,
  initial: 'S',
}

/* -------------------------------------------------------------------------- */
/*  COUPLE PHOTOS — the slider in the Couple section                           */
/* -------------------------------------------------------------------------- */

export interface CouplePhoto {
  /** Path under /public */
  src: string
  /** Optional line under the photo — a place, a moment. Omit to show none. */
  caption?: string
}

/**
 * Photos of Adhil and Shimnaz TOGETHER.
 *
 * Add, remove or reorder freely — the slider, the dots and the counter all
 * follow this list. Drop the files at these exact paths (or change the paths to
 * match your filenames). Any that are missing show a gold-seal panel rather
 * than a broken image, so the section never looks broken while you gather them.
 */
export const couplePhotos: CouplePhoto[] = [
  { src: `${import.meta.env.BASE_URL}images/couple-1.jpg` },
  { src: `${import.meta.env.BASE_URL}images/couple-2.jpg` },
  { src: `${import.meta.env.BASE_URL}images/couple-3.jpg` },
]

/**
 * The frame the photos sit in, as a raw CSS aspect-ratio (applied inline —
 * Tailwind's scanner doesn't pick arbitrary classes out of this data file).
 *
 * They're clipped to a mihrab arch, so a PORTRAIT ratio suits them best. If
 * your photos are landscape, set this to '4 / 3' or '3 / 2' — otherwise cover
 * will crop the sides to fill a tall frame.
 */
export const couplePhotoAspect = '5 / 6'

/* -------------------------------------------------------------------------- */
/*  HOSTS — the invitation is extended by the bride's parents                 */
/* -------------------------------------------------------------------------- */

export const hosts = {
  label: 'Hosted by',
  grandfather: 'Mr. PA Nazar',
  grandmother: 'Mrs. Shahnaz Nazar',
} as const

/** Dress code — a suggestion, not a rule. */
export const dressCode = {
  colours: 'Grey & Gold',
  note: 'Not mandatory — your presence is our priority.',
} as const

/* -------------------------------------------------------------------------- */
/*  THE OCCASION                                                               */
/* -------------------------------------------------------------------------- */

export const wedding = {
  /** Primary date — the countdown target. ISO 8601, IST (+05:30). */
  date: '2026-12-03T17:30:00+05:30',
  /** Pre-formatted so the Hero never waits on a date library */
  dateLabel: '3 December 2026',
  dayLabel: 'Thursday',
  /** The time column of the card's date block */
  timeNote: ['5 PM Onwards', 'Nikkah at 5:30 PM'],
  // VERIFY: Umm al-Qura reckoning. Local moon sighting may differ by a day.
  hijriLabel: '22 Jumada al-Akhirah 1448',
  quote: {
    text: 'And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquillity with them, and He has put love and mercy between your hearts.',
    source: 'Surah Ar-Rum, 30:21',
  },
  bismillah: {
    arabic: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    translation: 'In the Name of Allah, the Most Compassionate, the Most Merciful',
  },
  invitationMessage:
    'Request the honour of your presence at the wedding of their beloved daughter',
  invitationSubtext:
    'May Allah bless you, and shower His blessings upon you, and join you together in goodness.',
} as const

/* -------------------------------------------------------------------------- */
/*  VENUE & MAPS                                                               */
/* -------------------------------------------------------------------------- */

export const venue = {
  name: 'Wasava Cliff House',
  // VERIFY: exact Google Maps pin from the client.
  address: 'Burnacherry, Kannur, Kerala',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Wasava+Cliff+House+Burnacherry+Kannur',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Wasava+Cliff+House+Burnacherry+Kannur',
  /** Keyless embed — `output=embed` needs no API key and no billing account. */
  embedUrl: 'https://maps.google.com/maps?q=Wasava+Cliff+House+Burnacherry+Kannur&z=15&output=embed',
} as const

/* -------------------------------------------------------------------------- */
/*  EVENTS                                                                     */
/* -------------------------------------------------------------------------- */

export const events: WeddingEvent[] = [
  {
    id: 'nikkah',
    name: 'Nikkah',
    arabicName: 'نكاح',
    dateTime: '2026-12-03T17:30:00+05:30',
    timeLabel: '5:30 PM',
    venue: venue.name,
    address: venue.address,
    description:
      'Guests are welcomed from 5:00 PM onwards. The solemnisation of our marriage, followed by dua — we would be honoured to have you witness it.',
    icon: 'nikkah',
    mapsUrl: venue.mapsUrl,
  },
  {
    id: 'dinner',
    name: 'Dinner',
    arabicName: 'وليمة',
    dateTime: '2026-12-03T19:30:00+05:30',
    timeLabel: '7:30 PM',
    venue: venue.name,
    address: venue.address,
    description: `An evening of food, warmth and gratitude with family and friends. Dress code: ${dressCode.colours} — ${dressCode.note}`,
    icon: 'walima',
    mapsUrl: venue.mapsUrl,
  },
]

/* -------------------------------------------------------------------------- */
/*  PROGRAMME — the order of the evening                                       */
/* -------------------------------------------------------------------------- */

export const programme = [
  { time: '5:00 PM', title: 'Arrival of Guests', note: 'Welcome from 5 PM onwards' },
  { time: '5:30 PM', title: 'Nikkah', note: 'The solemnisation, followed by dua' },
  // VERIFY: 7:30 PM dinner came from the first brief; the latest card omits it.
  { time: '7:30 PM', title: 'Dinner', note: 'An evening of food and gratitude' },
] as const

/** Swatches shown with the dress code — the card's own palette. */
export const dressSwatches = [
  { name: 'Charcoal Grey', hex: '#3A3A3C' },
  { name: 'Champagne Gold', hex: '#D1B47A' },
  { name: 'Ivory', hex: '#F8F5EF' },
] as const

/* -------------------------------------------------------------------------- */
/*  SHARING OUR JOY — family standing with the couple                          */
/* -------------------------------------------------------------------------- */

export const sharingOurJoy = {
  title: 'Sharing Our Joy',
  subtitle: 'With love and prayers from those who stand beside us.',
  names: [
    'Abdu K.P.',
    'Abdul Vaheed K. & Shana',
    'Nadeer Ahammed K. & Ayisha',
    'Rubeena Azad & Azad',
    'Shahna Noushad & Rashid',
    'Shabeer & Jaseela',
  ],
} as const

/* -------------------------------------------------------------------------- */
/*  CONTACT & SOCIAL                                                           */
/* -------------------------------------------------------------------------- */

// VERIFY: the client hasn't sent contact details yet. Empty values hide the
// phone list, email, social icons and the WhatsApp button.
export const contact = {
  whatsapp: '',
  phones: [] as string[],
  email: '',
}

export const socials: SocialLink[] = []

/* -------------------------------------------------------------------------- */
/*  MUSIC                                                                      */
/* -------------------------------------------------------------------------- */

export const music = {
  /** Missing or undecodable file → the toggle disables itself silently. */
  src: `${import.meta.env.BASE_URL}music/bg-music.mp3`,
  title: 'Background music',
  volume: 0.32,
  /** Try music on page entry, then retry from the opening gesture if blocked. */
  autoplayAfterOpen: true,
} as const

/* -------------------------------------------------------------------------- */
/*  SHARE / SEO                                                                */
/* -------------------------------------------------------------------------- */

export const site = {
  title: `${groom.firstName} & ${bride.firstName} — Nikkah Invitation`,
  shareText: `You are cordially invited to the Nikkah of ${groom.firstName} & ${bride.firstName}, ${wedding.dateLabel}.`,
  url: typeof window !== 'undefined' ? window.location.href : '',
} as const

/* -------------------------------------------------------------------------- */
/*  THEME TOKENS (mirrors styles/index.css — for JS-side consumers)            */
/* -------------------------------------------------------------------------- */

export const theme = {
  bg: '#FFFDF8',
  gold: '#C8A96A',
  goldSoft: '#E3D3AE',
  goldDeep: '#A8863F',
  emerald: '#3A3A3C',
  emeraldDeep: '#232325',
  ivory: '#F8F5EF',
  ink: '#2D2926',
  muted: '#6B625A',
  glass: 'rgba(255,255,255,0.65)',
} as const
