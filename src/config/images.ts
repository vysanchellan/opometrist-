/**
 * Photo choices + alt text. Source files live in /assets-src/images/<slug>.jpg;
 * run `pnpm images` to regenerate AVIF/WebP sizes + blur placeholders.
 * Credits: docs/image-credits.md
 */
export const imageAlt = {
  'hero-poster': 'A luminous human eye with a hazel and gold iris, opening in darkness',
  'hero-poster-mobile': 'A luminous human eye with a hazel and gold iris, opening in darkness',
  'iris-macro': 'Extreme close-up of a grey-blue human iris against black',
  'optometrist-exam': 'An optometrist fitting a trial frame on a patient during an eye test',
  phoropter: 'A phoropter, the instrument used to find your exact prescription',
  'slit-lamp': 'A smiling patient resting his chin on a slit lamp during an eye health check',
  'frames-flatlay': 'Glass shelves lined with designer optical frames',
  'frame-1': 'Round, thin black wire-rim glasses',
  'frame-2': 'Black square acetate frames on a clear display stand',
  'frame-3': 'Round wood-grain frames on a teal background',
  'patient-glasses': 'A smiling woman wearing glasses outdoors',
  family: 'A laughing family of four sitting together on the grass',
  'child-eye-test': 'A schoolgirl in glasses covering one eye while reading a chart',
  'care-consult': 'An optometrist talking warmly with a patient beside a slit lamp',
  'durban-beachfront': 'The Durban beachfront skyline reflected on wet sand at dusk',
  'moses-mabhida': 'The arch of Moses Mabhida Stadium in Durban against the sky',
  drakensberg: 'The Drakensberg Amphitheatre rising above a green valley',
  'eye-chart': 'A pair of glasses resting on a letter eye chart',
} as const;

export type ImageSlug = keyof typeof imageAlt;

/** Which photos the "See the difference" slider offers, in order. */
export const differenceScenes: { slug: ImageSlug; label: string }[] = [
  { slug: 'durban-beachfront', label: 'Durban beachfront' },
  { slug: 'drakensberg', label: 'Drakensberg' },
  { slug: 'moses-mabhida', label: 'Moses Mabhida' },
];

/** Static poster per scene (reduced motion / no WebGL). */
export const scenePosters = {
  cornea: 'iris-macro',
  iris: 'optometrist-exam',
  lens: 'frames-flatlay',
  retina: 'slit-lamp',
  nerve: 'phoropter',
} as const satisfies Record<string, ImageSlug>;
