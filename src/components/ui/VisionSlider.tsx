'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { differenceScenes } from '@/config/images';
import { Picture } from './Picture';

type Condition = 'short' | 'astig' | 'cloudy';

const CONDITIONS: { id: Condition; label: string; note: string }[] = [
  {
    id: 'short',
    label: 'Short-sighted',
    note: 'Distance melts away — road signs, scoreboards, faces across the room.',
  },
  {
    id: 'astig',
    label: 'Astigmatism',
    note: 'Edges double and smear, worst at night under lights.',
  },
  {
    id: 'cloudy',
    label: 'Cloudy lens',
    note: 'A warm haze and glare, often an early sign of cataract.',
  },
];

/**
 * Signature moment 2 — "See the difference". Drag (or use arrow keys) across a real KZN
 * view to correct it. Pure CSS filters over pre-optimised photos: no canvas, no jank.
 */
export function VisionSlider() {
  const [scene, setScene] = useState(0);
  const [cond, setCond] = useState<Condition>('short');
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const hinted = useRef(false);

  const fromClientX = useCallback((clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  }, []);

  // one gentle sweep the first time it scrolls into view, to show it's interactive
  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting || hinted.current) return;
        hinted.current = true;
        io.disconnect();
        const t0 = performance.now();
        const run = (now: number) => {
          if (dragging.current) return;
          const p = Math.min(1, (now - t0) / 2200);
          setPos(50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p));
          if (p < 1) raf = requestAnimationFrame(run);
        };
        raf = requestAnimationFrame(run);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const s = differenceScenes[scene]!;
  const filter =
    cond === 'short'
      ? 'blur(7px) saturate(0.92)'
      : cond === 'astig'
        ? 'blur(2.2px)'
        : 'blur(3px) sepia(0.5) contrast(0.72) brightness(1.12) saturate(0.8)';

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setPos((p) => Math.max(0, p - step));
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setPos((p) => Math.min(100, p + step));
    else if (e.key === 'Home') setPos(0);
    else if (e.key === 'End') setPos(100);
    else return;
    e.preventDefault();
  };

  return (
    <div>
      <div
        ref={box}
        className="bg-ink-soft ring-paper/10 relative aspect-[4/5] w-full touch-pan-y overflow-hidden rounded-[1.75rem] ring-1 select-none sm:aspect-[16/10]"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          fromClientX(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && fromClientX(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        data-cursor="drag"
      >
        {/* corrected (sharp) */}
        <Picture
          key={`sharp-${s.slug}`}
          slug={s.slug}
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="absolute inset-0"
          imgClassName="size-full object-cover"
        />
        {/* uncorrected, clipped to the left of the handle */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          aria-hidden="true"
        >
          <div className="absolute -inset-4" style={{ filter }}>
            <Picture
              slug={s.slug}
              sizes="50vw"
              decorative
              className="absolute inset-0"
              imgClassName="size-full object-cover"
            />
            {cond === 'astig' ? (
              <Picture
                slug={s.slug}
                sizes="50vw"
                decorative
                className="absolute inset-0 translate-x-[9px] -translate-y-[5px] opacity-45 mix-blend-screen"
                imgClassName="size-full object-cover"
              />
            ) : null}
          </div>
          {cond === 'cloudy' ? (
            <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_60%_35%,rgb(255_240_210/0.55),transparent_70%)]" />
          ) : null}
        </div>

        <span className="label bg-ink/55 text-paper absolute top-4 left-4 rounded-full px-3 py-1.5 backdrop-blur">
          Without correction
        </span>
        <span className="label bg-ink/55 text-paper absolute top-4 right-4 rounded-full px-3 py-1.5 backdrop-blur">
          After your eye test
        </span>

        {/* handle */}
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
          <div className="bg-paper/90 absolute inset-y-0 -left-px w-0.5 shadow-[0_0_24px_rgb(255_255_255/0.6)]" />
          <div
            role="slider"
            tabIndex={0}
            aria-label="Compare uncorrected and corrected vision"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${Math.round(pos)}% uncorrected`}
            onKeyDown={onKey}
            className="text-paper pointer-events-auto absolute top-1/2 left-0 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
            data-cursor="drag"
          >
            {/* the handle is a trial lens: steel rim, glass, live dioptre read-out */}
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full p-[3px] shadow-[0_10px_40px_rgb(0_0_0/0.45)] [background:conic-gradient(from_140deg,#5d6066,#d9dadc,#7a7d83,#f4f4f2,#6b6e74,#c9cacc,#5d6066)] [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-[3px] rounded-full bg-[radial-gradient(110%_90%_at_30%_20%,rgb(255_255_255/0.35),rgb(255_255_255/0.06)_45%,rgb(5_7_13/0.25))] backdrop-blur-[1px]"
            />
            <span aria-hidden="true" className="readout relative text-[0.62rem] leading-none">
              {(-2.75 * (pos / 100)).toFixed(2).replace('-', '−')}
              <span className="block text-center opacity-60">D</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="label text-paper/65 mb-3" id="cond-label">
            Condition
          </p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="cond-label">
            {CONDITIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={cond === c.id}
                onClick={() => setCond(c.id)}
                className={`min-h-11 rounded-full px-4 text-sm ring-1 transition ${
                  cond === c.id
                    ? 'bg-paper text-ink ring-paper'
                    : 'text-paper/80 ring-paper/20 hover:ring-paper/60'
                }`}
                data-cursor="hover"
              >
                {c.label}
              </button>
            ))}
          </div>
          <p className="text-paper/60 mt-3 max-w-md text-sm" aria-live="polite">
            {CONDITIONS.find((c) => c.id === cond)?.note}
          </p>
        </div>
        <div>
          <p className="label text-paper/65 mb-3 md:text-right" id="scene-label">
            View
          </p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="scene-label">
            {differenceScenes.map((d, i) => (
              <button
                key={d.slug}
                type="button"
                role="radio"
                aria-checked={scene === i}
                onClick={() => setScene(i)}
                className={`min-h-11 rounded-full px-4 text-sm ring-1 transition ${
                  scene === i
                    ? 'bg-iris-a text-ink ring-iris-a'
                    : 'text-paper/80 ring-paper/20 hover:ring-paper/60'
                }`}
                data-cursor="hover"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
