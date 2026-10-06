'use client';

import { useEffect, useRef, useState } from 'react';
import { scrollToTarget } from '@/lib/lenis';
import { story } from '@/lib/story';

/** Real depths into the eye (mm from the corneal surface) for each part. */
const PARTS = [
  { id: 'cornea', label: 'Cornea', target: '#cornea', mm: 0.5 },
  { id: 'iris', label: 'Iris', target: '#services', mm: 3.1 },
  { id: 'lens', label: 'Lens', target: '#frames', mm: 5.6 },
  { id: 'retina', label: 'Retina', target: '#health', mm: 23.8 },
  { id: 'nerve', label: 'Nerve', target: '#care', mm: 26.0 },
];
const MAX_MM = 26;

/** scene time t → depth in mm (piecewise, matches the story's scenes). */
function depthAt(t: number) {
  const k = [0, 0.5, 3.1, 5.6, 23.8, 26];
  const i = Math.max(0, Math.min(k.length - 2, Math.floor(t)));
  const f = Math.max(0, Math.min(1, t - i));
  return k[i]! + (k[i + 1]! - k[i]!) * f;
}

/**
 * Anatomical depth gauge: a measuring ruler that reads how far into the eye you are, in
 * real millimetres, and jumps to any part on click. Works in cinematic and static modes.
 */
export function DepthMeter() {
  const [active, setActive] = useState(-1);
  const [visible, setVisible] = useState(false);
  const read = useRef<HTMLSpanElement>(null);
  const needle = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let ticking = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let idx = -1;
      PARTS.forEach((p, i) => {
        const el = document.querySelector<HTMLElement>(p.target);
        if (el && el.getBoundingClientRect().top <= mid) idx = i;
      });
      const careContent = document.getElementById('care-content');
      const pastNerve = careContent ? careContent.getBoundingClientRect().top < mid : false;
      setActive(idx);
      setVisible(idx >= 0 && !pastNerve);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // live read-out: follows the scrubbed story time (or the active part in static mode)
    // only touch the DOM when the value actually changes (no per-frame layout)
    let lastText = '';
    let lastY = -1;
    const tick = () => {
      if (document.documentElement.dataset.cinematic === 'on') {
        const mm = depthAt(story.t);
        const text = mm.toFixed(2).padStart(5, '0');
        if (read.current && text !== lastText) {
          read.current.textContent = text;
          lastText = text;
        }
        const y = Math.round((Math.min(mm, MAX_MM) / MAX_MM) * 1000) / 10;
        if (needle.current && y !== lastY) {
          needle.current.style.transform = `translateY(${y}%)`;
          lastY = y;
        }
      }
      ticking = requestAnimationFrame(tick);
    };
    ticking = requestAnimationFrame(tick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(ticking);
    };
  }, []);

  return (
    <nav
      aria-label="Depth into the eye"
      className={`text-paper fixed top-1/2 right-[max(0.75rem,calc(var(--gutter)-1rem))] z-40 hidden h-[min(56vh,30rem)] -translate-y-1/2 transition-opacity duration-700 lg:block ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <p className="label absolute -top-12 right-0 text-right whitespace-nowrap" aria-hidden="true">
        <span className="text-paper/55 block">Depth</span>
        <span className="readout text-paper text-[0.8rem]">
          <span ref={read}>
            {active >= 0 ? PARTS[active]!.mm.toFixed(2).padStart(5, '0') : '00.00'}
          </span>{' '}
          mm
        </span>
      </p>
      {/* ruler */}
      <span aria-hidden="true" className="absolute top-0 right-0 bottom-0 w-3">
        <span className="absolute inset-y-0 right-0 w-px bg-current opacity-30" />
        <span className="absolute inset-0 bg-[repeating-linear-gradient(180deg,currentColor_0_1px,transparent_1px_8px)] opacity-30 [mask:linear-gradient(90deg,transparent_60%,#000_60%)]" />
        <span
          ref={needle}
          className="absolute inset-x-[-6px] top-0 h-0 transition-transform duration-300 ease-out"
          style={{ transform: 'translateY(0%)' }}
        >
          <span className="bg-hot absolute -top-px right-0 h-0.5 w-6" />
        </span>
      </span>
      <ol className="relative h-full">
        {PARTS.map((p, i) => {
          const on = i === active;
          return (
            <li
              key={p.id}
              className="absolute right-5"
              style={{ top: `calc(${(p.mm / MAX_MM) * 100}% - 1.375rem)` }}
            >
              <button
                type="button"
                onClick={() => scrollToTarget(p.target)}
                aria-current={on ? 'step' : undefined}
                className="group flex min-h-11 items-center justify-end gap-2"
                data-cursor="hover"
              >
                <span
                  className={`label transition-all duration-500 ${
                    on
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-70 group-focus-visible:opacity-70'
                  }`}
                >
                  {p.label}
                </span>
                <span
                  aria-hidden="true"
                  className={`block h-px transition-all duration-500 ${on ? 'bg-iris-a w-4' : 'w-2 bg-current opacity-50'}`}
                />
                <span className="sr-only">{on ? '(current)' : ''}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
