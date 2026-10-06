import { ImageResponse } from 'next/og';
import { practice } from '@/config/practice';
import { theme } from '@/config/theme';

export const alt = `${practice.name} — ${practice.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Open Graph card generated from practice.ts + theme.ts (no external fonts or images). */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: theme.ink,
        color: theme.paper,
        padding: 72,
        position: 'relative',
        fontFamily: 'serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: -40,
          top: 55,
          width: 520,
          height: 520,
          borderRadius: 999,
          background: `radial-gradient(circle, ${theme.ink} 0 19%, ${theme.irisA} 21%, ${theme.irisB} 62%, #05070D 70%)`,
          boxShadow: `0 0 160px ${theme.irisB}55`,
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 175,
          top: 220,
          width: 40,
          height: 40,
          borderRadius: 999,
          background: theme.paper,
          opacity: 0.85,
          display: 'flex',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 640,
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 6,
            textTransform: 'uppercase',
            opacity: 0.7,
            display: 'flex',
          }}
        >
          {practice.name}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 112, lineHeight: 0.95, letterSpacing: -4 }}>
            {practice.tagline}
          </div>
          <div style={{ fontSize: 32, marginTop: 28, opacity: 0.75, fontFamily: 'sans-serif' }}>
            {`Optometrists in ${practice.address.suburb}, ${practice.address.city}`}
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
