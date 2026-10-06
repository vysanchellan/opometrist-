import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Martian_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { practice } from '@/config/practice';
import { theme, themeCssVars } from '@/config/theme';
import { JsonLd } from '@/components/ui/JsonLd';
import './globals.css';

/**
 * Type system — "the exam room":
 *  · Bodoni Moda  — fashion-eyewear didone for headlines, display-size instance (src/fonts)
 *  · Bricolage Grotesque — warm, slightly quirky grotesk for reading
 *  · Martian Mono — instrument read-outs, labels and numbers
 */
const display = localFont({
  // Bodoni Moda (OFL), instanced at its display optical size (opsz 96, wght 400) and subset
  // to Latin with fontTools: the full hairline contrast in ~27 KB for both styles.
  src: [
    { path: '../fonts/bodoni-display-normal.woff2', style: 'normal', weight: '400' },
    { path: '../fonts/bodoni-display-italic.woff2', style: 'italic', weight: '400' },
  ],
  variable: '--font-serif-display',
  display: 'swap',
  fallback: ['Didot', 'Georgia', 'serif'],
});

const sans = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-grotesk',
  display: 'swap',
});

const mono = Martian_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-mono',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(practice.url),
  title: {
    default: `${practice.name} — ${practice.tagline} | Optometrist in ${practice.address.suburb}`,
    template: `%s · ${practice.name}`,
  },
  description: practice.seoDescription,
  applicationName: practice.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: practice.locale,
    url: practice.url,
    siteName: practice.name,
    title: `${practice.name} — ${practice.tagline}`,
    description: practice.seoDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${practice.name} — ${practice.tagline}`,
    description: practice.seoDescription,
  },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: theme.ink,
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Runs before first paint: decides cinematic vs. static mode so there is no layout shift
 * once React hydrates. Feature detection only — creating a WebGL context here would block
 * first paint (~1s on some GPUs); the real capability check happens when the 3D boots.
 * No tracking, no network.
 */
const bootScript = `(function(){try{var d=document.documentElement;d.dataset.js='on';var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var g=!!(window.WebGL2RenderingContext||window.WebGLRenderingContext);d.dataset.motion=r?'reduced':'full';d.dataset.webgl=g?'on':'off';d.dataset.cinematic=(g&&!r)?'on':'off';d.dataset.pointer=window.matchMedia('(pointer: fine)').matches?'fine':'coarse';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-ZA"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      data-cinematic="off"
      suppressHydrationWarning
    >
      <body>
        {/* Boot script first in <body>: still runs before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <style dangerouslySetInnerHTML={{ __html: themeCssVars() }} />
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
