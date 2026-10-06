'use client';

import { useEffect, useRef, useState } from 'react';

/** Counts up once when scrolled into view. Server-renders the final value (SEO + no-JS). */
export function CountUp({
  value,
  decimals = 0,
  suffix = '',
  from,
  duration = 1600,
  group = false,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  from?: number;
  duration?: number;
  group?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = from ?? (value > 1000 ? value - 40 : 0);
    setDisplay(start);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          setDisplay(start + (value - start) * eased);
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, from, duration]);
  const txt = group
    ? display.toLocaleString('en-ZA', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : display.toFixed(decimals);
  return (
    <span ref={ref} className="tabular-nums">
      {txt}
      {suffix}
    </span>
  );
}
