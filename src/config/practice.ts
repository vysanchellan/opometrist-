/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PRACTICE CONFIG — the only file you need to edit to rebrand for a client.
 *  (Colours live in ./theme.ts, photo choices + alt text in ./images.ts.)
 *  Everything below is PLACEHOLDER content for the "Iris" demo.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ServiceIcon =
  'exam' | 'contacts' | 'kids' | 'frames' | 'repairs' | 'health' | 'retina' | 'pressure' | 'drop';

export type Service = {
  id: string;
  title: string;
  line: string;
  icon: ServiceIcon;
  /** Which scene of the story presents this service. */
  scene: 'iris' | 'lens' | 'retina';
};

export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export const practice = {
  name: 'Iris Optometrists',
  shortName: 'Iris',
  tagline: 'See everything.',
  /** Used in <title>, meta description and Open Graph. */
  seoDescription:
    'Independent optometrists in Umhlanga, Durban. Thorough eye tests, contact lenses, kids’ eye care, designer frames and eye-health screening. Medical aid claims handled for you.',
  url: 'https://iris-optometrists.example.co.za',
  locale: 'en_ZA',
  established: 2011,

  hero: {
    kicker: 'Optometrists · Umhlanga Ridge · Est. 2011',
    /** Max 8 words. Each array item reveals as its own line. `*word*` = italic emphasis. */
    headline: ['Your eyes,', '*properly* looked at.'],
    support:
      'Forty-minute eye tests, honest advice and frames you’ll actually love — right here on the North Coast.',
    primaryCta: 'Book an eye test',
    secondaryCta: 'WhatsApp us',
  },

  contact: {
    phoneDisplay: '031 000 1234',
    phoneE164: '+27310001234',
    /** International format, digits only (no +) — used for wa.me links. */
    whatsapp: '27820001234',
    whatsappMessage:
      'Hi Iris Optometrists, I’d like to book an eye test. My name is … and I’m free on …',
    email: 'hello@iris-optometrists.example.co.za',
  },

  address: {
    line1: 'Shop 4, 12 Placeholder Lane',
    suburb: 'Umhlanga Ridge',
    city: 'Durban',
    region: 'KwaZulu-Natal',
    postalCode: '4319',
    country: 'ZA',
    geo: { lat: -29.7275, lng: 31.0705 },
    /** Shown in the hero read-out. */
    coords: '29°43′S · 31°04′E',
    mapsQuery: 'Umhlanga Ridge, Durban, South Africa',
    parking: 'Free parking right outside. Wheelchair-friendly entrance.',
    serving: ['Umhlanga', 'Durban North', 'La Lucia', 'Ballito', 'Mount Edgecombe'],
  },

  /** 24h "HH:MM". Omit a day (or set null) when closed. */
  hours: {
    Mon: ['08:30', '17:00'],
    Tue: ['08:30', '17:00'],
    Wed: ['08:30', '17:00'],
    Thu: ['08:30', '18:30'],
    Fri: ['08:30', '17:00'],
    Sat: ['08:30', '13:00'],
    Sun: null,
  } satisfies Record<Day, [string, string] | null>,

  /** Exactly six primary services, in story order. */
  services: [
    {
      id: 'eye-exams',
      title: 'Comprehensive eye exams',
      line: 'Forty unhurried minutes, every result explained in plain English.',
      icon: 'exam',
      scene: 'iris',
    },
    {
      id: 'contact-lenses',
      title: 'Contact lens fitting',
      line: 'Dailies, monthlies, toric and multifocal — fitted, taught and followed up.',
      icon: 'contacts',
      scene: 'iris',
    },
    {
      id: 'kids',
      title: 'Paediatric eye care',
      line: 'Patient, playful tests for little eyes, from age three.',
      icon: 'kids',
      scene: 'iris',
    },
    {
      id: 'frames',
      title: 'Designer frames and lenses',
      line: 'A small, curated wall and lenses matched to how you actually live.',
      icon: 'frames',
      scene: 'lens',
    },
    {
      id: 'health',
      title: 'Eye health screening',
      line: 'Glaucoma, dry eye and diabetic eye checks, caught early.',
      icon: 'health',
      scene: 'retina',
    },
    {
      id: 'repairs',
      title: 'Repairs and same-day adjustments',
      line: 'Loose screw, bent arm, sliding nose pads — pop in, usually sorted while you wait.',
      icon: 'repairs',
      scene: 'lens',
    },
  ] satisfies Service[],

  /**
   * Scene copy for the story. Keep each line short. `*word*` = italic emphasis.
   * `readout` is a real anatomical measurement shown like an instrument read-out.
   */
  scenes: {
    cornea: {
      label: 'Cornea',
      readout: '0.55 mm thick · 43 D of focusing power',
      promise: 'A *proper* eye exam.',
      line: 'Forty minutes. Every lens, every light, every question answered.',
    },
    iris: {
      kicker: '02 — Iris',
      readout: 'Ø 12 mm · 256 unique features',
      headline: 'Care that *opens up.*',
    },
    lens: {
      kicker: '03 — Lens',
      readout: '+20 D · flexes 12× a minute',
      headline: 'We bring your world *into focus.*',
      focusHint: 'Keep scrolling to focus',
      focusDone: 'Sharp. That’s the point.',
      framesHeadline: 'Frames that feel *like you.*',
      /** Frame tags drifting past (photo slug, model, eye □ bridge  temple size in mm). */
      frames: [
        { slug: 'frame-1', name: 'Round wire', size: '49□21 145' },
        { slug: 'frame-2', name: 'Square acetate', size: '52□18 140' },
        { slug: 'frame-3', name: 'Walnut round', size: '47□22 145' },
      ],
    },
    difference: {
      kicker: 'See the difference',
      headline: 'Same view. *Two ways* of seeing it.',
      line: 'Drag the lens across to correct the view.',
    },
    retina: {
      kicker: '04 — Retina',
      readout: '0.25 mm · 126 million photoreceptors',
      headline: 'The eye *behind* the eye.',
      line: 'Most eye disease is silent. A photo of your retina says what you can’t feel.',
      checks: [
        {
          title: 'Digital retinal imaging',
          line: 'A photo of the back of your eye, kept on file year to year.',
          icon: 'retina',
        },
        {
          title: 'Glaucoma screening',
          line: 'Pressure and optic nerve checks, no puff-of-air surprises.',
          icon: 'pressure',
        },
        {
          title: 'Dry eye & diabetic eye checks',
          line: 'Relief for gritty eyes, careful monitoring for diabetes.',
          icon: 'drop',
        },
      ] satisfies { title: string; line: string; icon: ServiceIcon }[],
    },
    nerve: {
      kicker: '05 — Optic nerve',
      readout: '1.2 million fibres · 0 ms of rushing',
      headline: 'Every signal, *followed through.*',
    },
    care: {
      kicker: 'The Care Promise',
      headline: 'Looked after, *not processed.*',
      rxTitle: 'Prescription for a good experience',
    },
    book: {
      kicker: 'Visit us',
      headline: 'Your eyes, our *full attention.*',
      line: 'Book in under a minute. We’ll confirm by phone or WhatsApp — usually the same day.',
    },
    footer: {
      /** The bottom line of the eye chart. */
      chartLine: 'If you can read this, you might still be due an eye test.',
    },
  },

  /** The Care Promise, written as an Rx: OD (right eye), OS (left eye), OU (both eyes). */
  carePromise: [
    {
      code: 'OD',
      title: 'Unhurried appointments',
      line: 'Your eye test is never squeezed between others — there’s time for every question.',
    },
    {
      code: 'OS',
      title: 'Clear explanations',
      line: 'We show you what we see and explain costs upfront, before anything is ordered.',
    },
    {
      code: 'OU',
      title: 'Aftercare that doesn’t end at the till',
      line: 'Free adjustments, follow-up calls and a direct WhatsApp line for life.',
    },
  ],

  stats: [
    { value: 40, suffix: ' min', label: 'average eye test' },
    { value: 2011, suffix: '', label: 'caring for KZN eyes since' },
    { value: 4.9, suffix: '★', label: 'average Google rating', decimals: 1 },
  ],

  /** SAMPLE testimonials — placeholder content, replace with real, consented reviews. */
  testimonialsAreSample: true,
  testimonials: [
    {
      quote:
        'First eye test where nobody rushed me. She showed me photos of my own retina and explained every number.',
      name: 'Thandeka',
      suburb: 'Umhlanga',
    },
    {
      quote:
        'My son was nervous; he left asking when he can come back. Glasses ready in three days, medical aid sorted.',
      name: 'Priya',
      suburb: 'Durban North',
    },
    {
      quote:
        'Bent my frames on a Saturday morning, they had them straight before my coffee was cold. Proper service.',
      name: 'Johan',
      suburb: 'Ballito',
    },
  ],

  medicalAid: {
    line: 'We handle the claims paperwork with most medical aids — and tell you what it costs before anything is ordered.',
    schemes: ['Discovery', 'Bonitas', 'GEMS', 'Medihelp', 'Momentum'],
  },

  accessibility:
    'Step-free access, large-print charts, and kid-friendly tests with picture and shape charts.',

  team: [
    { name: 'Dr N. Placeholder', role: 'Optometrist · Practice owner', hpcsa: 'OP 0000000' },
    { name: 'A. Placeholder', role: 'Optometrist · Contact lenses' },
    { name: 'S. Placeholder', role: 'Optical dispenser · Frames & repairs' },
  ],

  social: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'Facebook', href: 'https://facebook.com/' },
    { label: 'Google reviews', href: 'https://maps.google.com/' },
  ],

  privacy: {
    formNotice:
      'We only use these details to arrange your appointment. We never share them or add you to marketing lists. (POPIA)',
    consent: 'I agree that Iris Optometrists may contact me about this booking.',
  },
} as const;

export type Practice = typeof practice;

/* ── Derived helpers (no brand data below) ──────────────────────────────── */

export const whatsappHref = (message: string = practice.contact.whatsappMessage) =>
  `https://wa.me/${practice.contact.whatsapp}?text=${encodeURIComponent(message)}`;

export const telHref = `tel:${practice.contact.phoneE164}`;

export const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  practice.address.mapsQuery,
)}`;

export const DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DAY_LONG: Record<Day, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

export const openDays = DAYS.filter((d) => practice.hours[d] !== null);

export const fullAddress = [
  practice.address.line1,
  practice.address.suburb,
  practice.address.city,
  practice.address.postalCode,
].join(', ');
