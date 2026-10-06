'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

/** True once the element is within `margin` of the viewport (or immediately without IO). */
function useNear<T extends HTMLElement>(margin = '900px') {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, near] as const;
}

/*
 * The booking form (zod + react-hook-form + framer-motion) and the testimonial carousel
 * are fetched only as they approach the viewport, keeping them off the critical path.
 * Their server-rendered fallbacks keep the content (and SEO) intact meanwhile.
 */

const BookingForm = dynamic(() => import('./BookingForm').then((m) => m.BookingForm), {
  ssr: false,
});
const Testimonials = dynamic(() => import('./Testimonial').then((m) => m.Testimonials), {
  ssr: false,
});
const VisionSlider = dynamic(() => import('./VisionSlider').then((m) => m.VisionSlider), {
  ssr: false,
});

export function LazyBookingForm({ fallback }: { fallback: React.ReactNode }) {
  const [ref, near] = useNear<HTMLDivElement>();
  return <div ref={ref}>{near ? <BookingForm /> : fallback}</div>;
}

export function LazyTestimonials({ fallback }: { fallback: React.ReactNode }) {
  const [ref, near] = useNear<HTMLDivElement>();
  return <div ref={ref}>{near ? <Testimonials /> : fallback}</div>;
}

export function LazyVisionSlider({ fallback }: { fallback: React.ReactNode }) {
  const [ref, near] = useNear<HTMLDivElement>();
  return <div ref={ref}>{near ? <VisionSlider /> : fallback}</div>;
}
