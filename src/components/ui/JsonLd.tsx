import { DAY_LONG, DAYS, practice } from '@/config/practice';

/** `Optician` (a LocalBusiness subtype) structured data, generated from practice.ts. */
export function JsonLd() {
  const openingHoursSpecification = DAYS.flatMap((d) => {
    const h = practice.hours[d];
    if (!h) return [];
    return [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${DAY_LONG[d]}`,
        opens: h[0],
        closes: h[1],
      },
    ];
  });

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Optician',
    '@id': `${practice.url}/#practice`,
    name: practice.name,
    slogan: practice.tagline,
    description: practice.seoDescription,
    url: practice.url,
    telephone: practice.contact.phoneE164,
    email: practice.contact.email,
    image: `${practice.url}/opengraph-image`,
    foundingDate: String(practice.established),
    priceRange: 'R',
    currenciesAccepted: 'ZAR',
    address: {
      '@type': 'PostalAddress',
      streetAddress: practice.address.line1,
      addressLocality: practice.address.suburb,
      addressRegion: practice.address.region,
      postalCode: practice.address.postalCode,
      addressCountry: practice.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: practice.address.geo.lat,
      longitude: practice.address.geo.lng,
    },
    areaServed: practice.address.serving.map((name) => ({ '@type': 'Place', name })),
    openingHoursSpecification,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Eye care services',
      itemListElement: practice.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, description: s.line },
      })),
    },
    sameAs: practice.social.map((s) => s.href),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
