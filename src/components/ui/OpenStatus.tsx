'use client';

import { useEffect, useState } from 'react';
import { DAYS, practice, type Day } from '@/config/practice';

const TZ = 'Africa/Johannesburg';

function status(now: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const wd = parts.find((p) => p.type === 'weekday')?.value as Day;
  const hm = `${parts.find((p) => p.type === 'hour')?.value}:${parts.find((p) => p.type === 'minute')?.value}`;
  const today = practice.hours[wd];
  if (today && hm >= today[0] && hm < today[1])
    return { open: true, text: `Open now · until ${today[1]}` };
  // next opening
  const idx = DAYS.indexOf(wd);
  if (today && hm < today[0]) return { open: false, text: `Opens today at ${today[0]}` };
  for (let i = 1; i <= 7; i++) {
    const d = DAYS[(idx + i) % 7]!;
    const h = practice.hours[d];
    if (h) return { open: false, text: `Closed · opens ${i === 1 ? 'tomorrow' : d} at ${h[0]}` };
  }
  return { open: false, text: 'Closed' };
}

/** Live "open now" pill, in South African time. Rendered client-side only (no hydration mismatch). */
export function OpenStatus({ className = '' }: { className?: string }) {
  const [s, setS] = useState<{ open: boolean; text: string } | null>(null);
  useEffect(() => {
    setS(status(new Date()));
    const id = setInterval(() => setS(status(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className={`inline-flex min-h-6 items-center gap-2 text-sm ${className}`} aria-live="polite">
      {s ? (
        <>
          <span
            className={`relative inline-flex size-2 rounded-full ${s.open ? 'bg-emerald-500' : 'bg-hot'}`}
          >
            {s.open ? (
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70" />
            ) : null}
          </span>
          {s.text}
        </>
      ) : null}
    </p>
  );
}
