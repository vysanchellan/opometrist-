'use client';

import type Lenis from 'lenis';
import { story } from './story';

let instance: Lenis | null = null;

/**
 * Lenis smooth scroll, driven by the GSAP ticker so ScrollTrigger and Lenis share one clock.
 * Loaded lazily (with GSAP) so neither sits on the critical path to first paint.
 */
export async function startLenis() {
  if (instance) return instance;
  const [{ default: Lenis }, { getGsap }] = await Promise.all([import('lenis'), import('./gsap')]);
  if (instance) return instance;
  const { gsap, ScrollTrigger } = getGsap();
  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.1,
    // Native touch scrolling on phones feels better and keeps address-bar behaviour intact.
    syncTouch: false,
  });
  lenis.on('scroll', (l: Lenis) => {
    story.velocity = l.velocity;
    ScrollTrigger.update();
  });
  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  instance = lenis;
  return lenis;
}

export function stopLenis() {
  instance?.destroy();
  instance = null;
}

export const getLenis = () => instance;

/** Scroll to an element or y position, using Lenis when it is running. */
export function scrollToTarget(target: string | HTMLElement | number, offset = 0) {
  if (instance) {
    instance.scrollTo(target, { offset, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return;
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  const y =
    typeof el === 'number' ? el : el ? el.getBoundingClientRect().top + window.scrollY + offset : 0;
  window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
}
