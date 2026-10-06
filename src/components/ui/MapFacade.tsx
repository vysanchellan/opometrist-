'use client';

import { useState } from 'react';
import { fullAddress, mapsHref, practice } from '@/config/practice';
import { Icon } from './Icon';

/**
 * Lightweight map: a stylised, zero-request illustration until the visitor asks for the
 * interactive map (privacy-friendly — no third-party requests or cookies by default).
 */
export function MapFacade() {
  const [live, setLive] = useState(false);
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(practice.address.mapsQuery)}&z=15&output=embed`;
  return (
    <figure className="bg-paper-deep ring-ink/10 relative overflow-hidden rounded-3xl ring-1">
      <div className="relative aspect-[16/10] w-full">
        {live ? (
          <iframe
            title={`Map showing ${practice.name}`}
            src={src}
            className="absolute inset-0 size-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <>
            <svg viewBox="0 0 400 250" className="absolute inset-0 size-full" aria-hidden="true">
              <rect width="400" height="250" fill="var(--paper-deep)" />
              <path
                d="M300 0 C 320 80, 360 140, 400 170 L400 0Z"
                fill="color-mix(in oklab, var(--iris-b) 22%, var(--paper-deep))"
              />
              <g
                stroke="color-mix(in oklab, var(--ink) 14%, transparent)"
                strokeWidth="1.2"
                fill="none"
              >
                <path d="M-10 60 C 80 70, 160 40, 260 80 S 380 120, 420 110" />
                <path d="M-10 160 C 90 150, 170 190, 270 160 S 360 120, 410 140" />
                <path d="M60 -10 C 70 80, 40 160, 70 260" />
                <path d="M180 -10 C 170 70, 210 150, 190 260" />
                <path d="M280 -10 C 270 60, 300 120, 290 260" />
              </g>
              <g
                stroke="color-mix(in oklab, var(--ink) 30%, transparent)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              >
                <path d="M-10 115 C 100 120, 200 100, 300 125 S 380 150, 420 145" />
              </g>
              <circle
                cx="205"
                cy="112"
                r="34"
                fill="color-mix(in oklab, var(--hot) 16%, transparent)"
              />
              <circle cx="205" cy="112" r="9" fill="var(--hot)" />
              <circle cx="205" cy="112" r="3.5" fill="var(--ink)" />
            </svg>
            <button
              type="button"
              onClick={() => setLive(true)}
              className="bg-ink text-paper hover:bg-ink-soft absolute bottom-4 left-4 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm transition"
              data-cursor="hover"
            >
              <Icon name="pin" className="size-4" /> Show interactive map
            </button>
          </>
        )}
      </div>
      <figcaption className="text-ink/75 flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
        <span>{fullAddress}</span>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink decoration-ink/30 hover:decoration-ink inline-flex min-h-11 items-center gap-1.5 font-medium underline underline-offset-4"
          data-cursor="hover"
        >
          Directions <Icon name="arrow" className="size-4" />
        </a>
      </figcaption>
    </figure>
  );
}
