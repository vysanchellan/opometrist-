'use client';

import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { practice } from '@/config/practice';
import { Icon } from './Icon';

import { TestimonialCard } from './TestimonialCard';

/** Drag / swipe / keyboard carousel. Max 3 testimonials, as per the content rules. */
export function Testimonials() {
  const items = practice.testimonials.slice(0, 3);
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  const measure = useCallback(() => {
    const first = track.current?.children[0] as HTMLElement | undefined;
    if (!first) return;
    const gap = parseFloat(getComputedStyle(track.current!).columnGap || '0');
    setStep(first.offsetWidth + gap);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (viewport.current) ro.observe(viewport.current);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    const c = animate(
      x,
      -index * step,
      reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 32 },
    );
    return c.stop;
  }, [index, step, x, reduce]);

  const go = (i: number) => setIndex(Math.max(0, Math.min(items.length - 1, i)));

  return (
    <section aria-roledescription="carousel" aria-label="Patient notes" className="relative">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="label text-ink/65">
          Patient notes
          {practice.testimonialsAreSample ? (
            <span className="ml-2 tracking-normal normal-case">(sample)</span>
          ) : null}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous story"
            className="ring-ink/20 hover:bg-ink hover:text-paper disabled:hover:text-ink grid size-11 place-items-center rounded-full ring-1 transition disabled:opacity-30 disabled:hover:bg-transparent"
            data-cursor="hover"
          >
            <Icon name="chevron-left" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === items.length - 1}
            aria-label="Next story"
            className="ring-ink/20 hover:bg-ink hover:text-paper disabled:hover:text-ink grid size-11 place-items-center rounded-full ring-1 transition disabled:opacity-30 disabled:hover:bg-transparent"
            data-cursor="hover"
          >
            <Icon name="chevron-right" />
          </button>
        </div>
      </div>
      <div ref={viewport} className="overflow-hidden" data-cursor="drag">
        <motion.div
          ref={track}
          className="flex cursor-grab touch-pan-y gap-4 active:cursor-grabbing md:gap-6"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -(items.length - 1) * step, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            const swipe = info.offset.x + info.velocity.x * 0.2;
            if (swipe < -step / 4) go(index + 1);
            else if (swipe > step / 4) go(index - 1);
            else animate(x, -index * step, { type: 'spring', stiffness: 260, damping: 32 });
          }}
        >
          {items.map((t, i) => (
            <div
              key={t.name}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${items.length}`}
              aria-hidden={i !== index}
              className="w-[86%] shrink-0 md:w-[58%]"
              onFocusCapture={() => go(i)}
            >
              <TestimonialCard t={t} n={i + 1} />
            </div>
          ))}
        </motion.div>
      </div>
      <div className="mt-5 flex gap-2" aria-hidden="true">
        {items.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'bg-ink w-10' : 'bg-ink/20 w-4'}`}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Story {index + 1} of {items.length}
      </p>
    </section>
  );
}
