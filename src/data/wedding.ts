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
  fullName: 'Shimnaz Nazar',
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
  { src: `${import.meta.env.BASE_URL}images/couple-1.webp` },
  { src: `${import.meta.env.BASE_URL}images/couple-2.webp` },
  { src: `${import.meta.env.BASE_URL}images/couple-3.webp` },
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
/*  HOSTS — the invitation is extended by the groom's parents                 */
/* -------------------------------------------------------------------------- */

export const hosts = {
  label: 'Hosted by',
  grandfather: 'Mr. Ahammed Kutty KP',
  grandmother: 'Mrs. Sakeena M',
} as const

/** Dress code — a suggestion, not a rule. */
export const dressCode = {
  colours: 'Earthy Browns',
  note: 'Your presence is our priority; the dress code is purely a suggestion.',
} as const

/* -------------------------------------------------------------------------- */
/*  THE OCCASION                                                               */
/* -------------------------------------------------------------------------- */

export const wedding = {
  /** Primary date — the countdown target. ISO 8601, IST (+05:30). */
  date: '2026-12-09T17:00:00+05:30',
  /** Pre-formatted so the Hero never waits on a date library */
  dateLabel: '9 December 2026',
  dayLabel: 'Wednesday',
  /** The time column of the card's date block */
  timeNote: ['Reception at 5 PM', 'Dinner at 7:30 PM'],
  // VERIFY: Umm al-Qura reckoning. Local moon sighting may differ by a day.
  hijriLabel: '28 Jumada al-Akhirah 1448',
  quote: {
    text: 'And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquillity with them, and He has put love and mercy between your hearts.',
    source: 'Surah Ar-Rum, 30:21',
  },
  bismillah: {
    arabic: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    translation: 'In the Name of Allah, the Most Compassionate, the Most Merciful',
  },
  invitationMessage:
    'Request the honour of your presence at the wedding reception of their beloved son',
  invitationSubtext:
    'May Allah bless you, and shower His blessings upon you, and join you together in goodness.',
} as const

/* -------------------------------------------------------------------------- */
/*  VENUE & MAPS                                                               */
/* -------------------------------------------------------------------------- */

export const venue = {
  name: 'Royal Convention Centre',
  // VERIFY: exact Google Maps pin from the client.
  address: 'Pattambi, Palakkad, Kerala',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Royal+Convention+Centre+Pattambi',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Royal+Convention+Centre+Pattambi',
  /** Keyless embed — `output=embed` needs no API key and no billing account. */
  embedUrl: 'https://maps.google.com/maps?q=Royal+Convention+Centre+Pattambi&z=15&output=embed',
} as const

/* -------------------------------------------------------------------------- */
/*  EVENTS                                                                     */
/* -------------------------------------------------------------------------- */

export const events: WeddingEvent[] = [
  {
    id: 'reception',
    name: 'Reception',
    dateTime: '2026-12-09T17:00:00+05:30',
    timeLabel: '5:00 PM',
    venue: venue.name,
    address: venue.address,
    description:
      'Join us from 5:00 PM as we celebrate the beginning of our new life together, with family and friends.',
    icon: 'nikkah',
    mapsUrl: venue.mapsUrl,
  },
  {
    id: 'dinner',
    name: 'Dinner',
    arabicName: 'وليمة',
    dateTime: '2026-12-09T19:30:00+05:30',
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
  { time: '5:00 PM', title: 'Reception', note: 'Welcome from 5 PM onwards' },
  { time: '7:30 PM', title: 'Dinner', note: 'An evening of food and gratitude' },
] as const

/** Swatches shown with the dress code: the groom side's brown palette. */
export const dressSwatches = [
  { name: 'Bistre', hex: '#3D211A' },
  { name: 'Coffee', hex: '#6F4D38' },
  { name: 'Chamoisee', hex: '#A07856' },
  { name: 'Khaki', hex: '#CBB799' },
  { name: 'Beige', hex: '#F5F5DC' },
] as const

/* -------------------------------------------------------------------------- */
/*  SHARING OUR JOY — family standing with the couple                          */
/* -------------------------------------------------------------------------- */

// VERIFY: these names came from the bride's side (nikkah card).
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
  title: `${groom.firstName} & ${bride.firstName} — Wedding Reception`,
  shareText: `You are cordially invited to the Wedding Reception of ${groom.firstName} & ${bride.firstName}, ${wedding.dateLabel}.`,
  url: typeof window !== 'undefined' ? window.location.href : '',
} as const

/* -------------------------------------------------------------------------- */
/*  THEME TOKENS (mirrors styles/index.css — for JS-side consumers)            */
/* -------------------------------------------------------------------------- */

export const theme = {
  bg: '#F3EEE2',
  gold: '#A07856',
  goldSoft: '#E3D3AE',
  goldDeep: '#A8863F',
  emerald: '#3A3A3C',
  emeraldDeep: '#232325',
  ivory: '#F8F5EF',
  ink: '#2D2926',
  muted: '#6B625A',
  glass: 'rgba(255,255,255,0.65)',
} as const
