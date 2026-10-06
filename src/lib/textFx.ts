'use client';

import { getGsap } from './gsap';

/**
 * The signature "focus pull" for text: characters arrive out of focus — blurred, slightly
 * enlarged and split into a red/cyan chromatic fringe like a misaligned lens — and converge
 * into sharp type from the centre outwards. Used scrubbed (in the master timeline) and
 * triggered (content sections).
 */
const FRINGE_FROM = '-0.09em 0px 0px rgba(255,72,48,0.75), 0.09em 0px 0px rgba(48,196,255,0.75)';
const FRINGE_TO = '0em 0px 0px rgba(255,72,48,0), 0em 0px 0px rgba(48,196,255,0)';

const cache = new WeakMap<Element, HTMLElement[]>();

/** Split an element's text into characters once (idempotent). Screen readers keep the words. */
export function chars(el: Element | null | undefined): HTMLElement[] {
  if (!el) return [];
  const hit = cache.get(el);
  if (hit) return hit;
  const { SplitText } = getGsap();
  // Screen readers get one clean copy of the words; the split characters are hidden from them.
  const text = el.textContent ?? '';
  const split = SplitText.create(el, { type: 'words,chars', charsClass: 'fx-ch', aria: 'none' });
  el.setAttribute('aria-hidden', 'true');
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = text;
  el.after(sr);
  const list = split.chars as HTMLElement[];
  cache.set(el, list);
  return list;
}

export const focusFrom = {
  opacity: 0,
  filter: 'blur(14px)',
  scale: 1.22,
  textShadow: FRINGE_FROM,
};
export const focusTo = {
  opacity: 1,
  filter: 'blur(0px)',
  scale: 1,
  textShadow: FRINGE_TO,
};

/** Characters of every `.mask-line` inside a `[data-anim=…]` headline. */
export function headlineChars(anim: string) {
  return Array.from(document.querySelectorAll(`[data-anim="${anim}"] .mask-line > span`)).flatMap(
    (el) => chars(el),
  );
}

/** One-shot focus-in when the element scrolls into view (content sections). */
export function focusOnView(root: ParentNode = document) {
  const { gsap, ScrollTrigger } = getGsap();
  const triggers: ScrollTrigger[] = [];
  root.querySelectorAll<HTMLElement>('[data-focus-in]').forEach((el) => {
    const targets = Array.from(el.querySelectorAll('.mask-line > span')).flatMap((l) => chars(l));
    if (targets.length === 0) return;
    gsap.set(targets, focusFrom);
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top 82%',
        once: true,
        onEnter: () =>
          gsap.to(targets, {
            ...focusTo,
            duration: 1.3,
            ease: 'expo.out',
            stagger: { each: 0.018, from: 'center' },
          }),
      }),
    );
  });
  return () => triggers.forEach((t) => t.kill());
}
