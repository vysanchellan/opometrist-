'use client';

import { getGsap } from './gsap';
import { chars, focusFrom, focusTo, headlineChars } from './textFx';
import { createStory, story } from './story';

/**
 * Master scroll choreography. One GSAP timeline authored in *scene time* (t ∈ [0, 7]),
 * scrubbed from scroll via DOM anchors ([data-t]). See docs/motion-spec.md — that table is
 * the contract this file implements.
 */

type Anchor = { t: number; y: number };

const END_T = 7;

function measureAnchors(maxScroll: number): Anchor[] {
  const vh = window.innerHeight;
  const raw = Array.from(document.querySelectorAll<HTMLElement>('[data-t]')).map((el) => {
    const t = Number(el.dataset.t);
    const off = Number(el.dataset.tOffset ?? 0);
    const top = el.getBoundingClientRect().top + window.scrollY - off * vh;
    return { t, y: Math.max(0, Math.min(maxScroll, top)) };
  });
  raw.push({ t: END_T, y: maxScroll });
  raw.sort((a, b) => a.t - b.t);
  // enforce strictly increasing y so the mapping is always invertible
  for (let i = 1; i < raw.length; i++) raw[i]!.y = Math.max(raw[i]!.y, raw[i - 1]!.y + 1);
  return raw;
}

function scrollToTime(y: number, anchors: Anchor[]) {
  if (anchors.length === 0) return 0;
  if (y <= anchors[0]!.y) return anchors[0]!.t;
  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1]!;
    const b = anchors[i]!;
    if (y <= b.y) return a.t + ((y - a.y) / (b.y - a.y)) * (b.t - a.t);
  }
  return END_T;
}

const q = <T extends Element = HTMLElement>(sel: string) =>
  Array.from(document.querySelectorAll<T>(sel));

function buildTimeline(isMobile: boolean) {
  const { gsap } = getGsap();
  const S = story;
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  // Reset the story to its rest state before recording tweens (important on rebuild).
  Object.assign(S, {
    ...createStory(),
    pointer: S.pointer,
    tilt: S.tilt,
    intro: S.intro,
    velocity: S.velocity,
  });

  // Hero composition: the eye sits right on desktop, high on mobile.
  const heroCam = isMobile ? { x: 0, y: -1.35, z: 8.4 } : { x: -1.55, y: -0.05, z: 6.0 };
  Object.assign(S.cam, heroCam);
  Object.assign(S.look, { x: heroCam.x, y: heroCam.y, z: 0 });

  const D = (selector: string) => q(selector);
  const fromTo = (
    targets: gsap.TweenTarget,
    from: gsap.TweenVars,
    to: gsap.TweenVars,
    at: number,
  ) => tl.fromTo(targets, from, { ...to, immediateRender: false }, at);

  /** Scrubbed focus-pull for a headline: chars converge from blurred, fringed and enlarged. */
  const title = (anim: string, at: number, dur = 0.2) => {
    const ch = headlineChars(anim);
    if (!ch.length) return;
    gsap.set(ch, focusFrom);
    tl.fromTo(
      ch,
      focusFrom,
      {
        ...focusTo,
        immediateRender: false,
        duration: dur * 0.55,
        ease: 'power3.out',
        stagger: { amount: dur * 0.45, from: 'center' },
      },
      at,
    );
  };
  /** Mono read-outs decode like an instrument settling (ScrambleText). */
  const SCRAMBLE = '0123456789·.°ØΔ+−';
  const readout = (selector: string, at: number) => {
    D(selector).forEach((el) => {
      const text = el.textContent ?? '';
      gsap.set(el, { autoAlpha: 0 });
      tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02, immediateRender: false }, at);
      tl.fromTo(
        el,
        { scrambleText: { text: ' ', chars: SCRAMBLE } },
        {
          scrambleText: { text, chars: SCRAMBLE, revealDelay: 0.3 },
          duration: 0.14,
          immediateRender: false,
        },
        at,
      );
    });
  };
  /** Close + open the page's eyelids around `at` (warm = daylight through the lids). */
  const blink = (at: number, warm = false) => {
    const el = D('[data-anim="blink"]')[0];
    if (!el) return;
    gsap.set(el, { '--blink': 0, '--warm': 0 });
    tl.fromTo(
      el,
      { '--blink': 0 },
      { '--blink': 1, duration: 0.06, ease: 'power2.in', immediateRender: false },
      at,
    );
    if (warm)
      tl.fromTo(
        el,
        { '--warm': 0 },
        { '--warm': 1, duration: 0.08, immediateRender: false },
        at + 0.02,
      );
    tl.fromTo(
      el,
      { '--blink': 1 },
      { '--blink': 0, duration: 0.09, ease: 'power2.out', immediateRender: false },
      at + 0.1,
    );
    if (warm)
      tl.fromTo(
        el,
        { '--warm': 1 },
        { '--warm': 0, duration: 0.06, immediateRender: false },
        at + 0.16,
      );
  };

  /* ── Scene 1 → 2: approach (t 0 → 1) ─────────────────────────────── */
  tl.to(S.cam, { x: 0.28, y: 0.12, z: 2.7, duration: 1, ease: 'power1.inOut' }, 0);
  tl.to(S.look, { x: 0, y: 0, z: 0.9, duration: 1, ease: 'power1.inOut' }, 0);
  tl.to(S.eye, { ry: -0.18, duration: 1, ease: 'power1.inOut' }, 0);
  fromTo(
    D('[data-anim="hero-copy"]'),
    { autoAlpha: 1, y: 0, filter: 'blur(0px)' },
    { autoAlpha: 0, y: -60, filter: 'blur(10px)', duration: 0.35, ease: 'power2.in' },
    0.42,
  );
  fromTo(
    D('[data-anim="hero-hud"]'),
    { autoAlpha: 1, scale: 1 },
    { autoAlpha: 0, scale: 0.94, duration: 0.3 },
    0.5,
  );
  fromTo(D('[data-anim="scroll-cue"]'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1 }, 0.04);

  /* ── Scene 2: cornea (t 1 → 2) ───────────────────────────────────── */
  tl.to(S.cam, { x: 0.08, y: 0.02, z: 1.95, duration: 0.8, ease: 'power1.inOut' }, 1);
  tl.to(S, { fov: 40, corneaEnvRot: 0.9, duration: 0.8 }, 1);
  gsap.set(D('[data-anim="cornea-svg"]'), { clipPath: 'inset(0% 0% 0% 100%)' });
  gsap.set(D('[data-anim="cornea-dot"]'), { autoAlpha: 0 });
  gsap.set(D('[data-anim="cornea-copy"] > .label:first-child, [data-anim="cornea-line-copy"]'), {
    autoAlpha: 0,
  });
  fromTo(
    D('[data-anim="cornea-dot"]'),
    { scale: 2.4, rotate: -90, autoAlpha: 0 },
    { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.1, ease: 'expo.out' },
    1.02,
  );
  fromTo(
    D('[data-anim="cornea-svg"]'),
    { clipPath: 'inset(0% 0% 0% 100%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.24, ease: 'power2.inOut' },
    1.08,
  );
  fromTo(
    D('[data-anim="cornea-copy"] > .label:first-child'),
    { autoAlpha: 0, x: -12 },
    { autoAlpha: 1, x: 0, duration: 0.08 },
    1.2,
  );
  readout('[data-anim="cornea-readout"]', 1.22);
  title('cornea-title', 1.24, 0.24);
  fromTo(
    D('[data-anim="cornea-line-copy"]'),
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: 0.12 },
    1.36,
  );
  // crossing the surface
  tl.to(S.cam, { x: 0, y: 0, z: 1.7, duration: 0.15, ease: 'power2.in' }, 1.8);
  tl.to(S.look, { z: 0.8, duration: 0.15 }, 1.8);
  tl.to(S, { fov: 46, duration: 0.15 }, 1.8);
  tl.to(S, { cornea: 0, duration: 0.1 }, 1.8);
  tl.to(S, { ca: 1, duration: 0.07, ease: 'power2.in' }, 1.8);
  tl.to(S, { ca: 0, duration: 0.1, ease: 'power2.out' }, 1.87);
  tl.to(S, { lidsShow: 0, duration: 0.06 }, 1.86);
  tl.to(S.eye, { ry: 0, duration: 0.2 }, 1.8);
  fromTo(
    D('[data-anim="cornea-copy"], [data-anim="cornea-dot"], [data-anim="cornea-svg"]'),
    { autoAlpha: 1, filter: 'blur(0px)' },
    { autoAlpha: 0, filter: 'blur(8px)', duration: 0.1 },
    1.76,
  );

  /* ── Scene 3: the iris opens like a camera aperture (t 2 → 3) ────── */
  // pull back so the whole aperture is in frame while the blades swing open
  tl.to(S.cam, { z: 2.25, duration: 0.18, ease: 'power2.out' }, 1.95);
  tl.to(S.look, { z: 0.85, duration: 0.18 }, 1.95);
  tl.to(S, { fov: 44, irisGlow: 0.35, pupil: 0.25, duration: 0.15 }, 2);
  tl.to(S, { irisPeel: 1, duration: 0.55, ease: 'power2.inOut' }, 2.12);
  tl.to(S, { irisGlow: 0.6, duration: 0.5 }, 2.15);
  gsap.set(D('[data-anim="iris-head"] .label'), { autoAlpha: 0 });
  gsap.set(D('[data-anim="iris-card"]'), { autoAlpha: 0 });
  fromTo(
    D('[data-anim="iris-head"] > .label:first-child'),
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.06 },
    2.02,
  );
  readout('[data-anim="iris-readout"]', 2.03);
  title('iris-title', 2.05, 0.24);
  D('[data-anim="iris-card"]').forEach((el, i) => {
    // trial lenses drop into the frame, spinning into place like a lens seated in a trial frame
    fromTo(
      el,
      { autoAlpha: 0, y: -90, rotate: -50 + i * 18, scale: 0.72, filter: 'blur(10px)' },
      {
        autoAlpha: 1,
        y: 0,
        rotate: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.16,
        ease: 'back.out(1.6)',
      },
      2.32 + i * 0.1,
    );
  });
  fromTo(
    D('#services .stage > *'),
    { autoAlpha: 1, y: 0, filter: 'blur(0px)' },
    { autoAlpha: 0, y: -40, filter: 'blur(10px)', duration: 0.1, ease: 'power2.in' },
    2.84,
  );

  /* ── Scene 4: lens (t 3 → 4) ─────────────────────────────────────── */
  tl.to(S.cam, { z: 1.12, duration: 0.15, ease: 'power2.in' }, 2.98);
  tl.to(S, { fov: 60, sclera: 0.18, irisGlow: 0, duration: 0.15 }, 3);
  tl.to(S, { ca: 0.6, duration: 0.05 }, 3.08);
  tl.to(S, { ca: 0, duration: 0.08 }, 3.13);
  tl.to(S.cam, { z: 3.2, duration: 0.2, ease: 'power2.out' }, 3.15);
  tl.to(S.look, { x: 0, y: 0, z: 1.9, duration: 0.2, ease: 'power2.out' }, 3.15);
  tl.to(S, { lensFloat: 1, fov: 38, lensSpin: 0.6, duration: 0.2, ease: 'power2.out' }, 3.15);
  tl.to(
    S.lensOffset,
    isMobile ? { x: 0, y: 0.34, duration: 0.2 } : { x: 0.42, y: 0, duration: 0.2 },
    3.15,
  );
  tl.to(S, { sclera: 0, duration: 0.08 }, 3.17);
  // copy
  gsap.set(D('[data-anim="lens-kicker"]'), { autoAlpha: 0 });
  gsap.set(D('[data-anim="snellen"]'), { autoAlpha: 0, y: 30 });
  fromTo(D('[data-anim="lens-kicker"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 3.18);
  readout('[data-anim="lens-readout"]', 3.19);
  title('lens-title', 3.2, 0.2);
  fromTo(
    D('[data-anim="snellen"]'),
    { autoAlpha: 0, y: 30 },
    { autoAlpha: 1, y: 0, duration: 0.1 },
    3.28,
  );
  // Signature 1 — focus pull
  tl.to(S, { lensBlur: 0, duration: 0.35, ease: 'power1.inOut' }, 3.35);
  tl.fromTo(
    S,
    { lensSquash: 0.22 },
    { lensSquash: 0, duration: 0.35, ease: 'power2.out', immediateRender: false },
    3.35,
  );
  tl.to(S, { lensSpin: 1.7, duration: 0.5 }, 3.35);
  D('[data-anim="snellen-line"]').forEach((el, i) => {
    const b = 16 - i * 1.2;
    const f = (b * 0.45).toFixed(1);
    // out-of-focus chart lines carry a chromatic fringe that collapses as they sharpen
    const from = {
      filter: `blur(${b}px)`,
      opacity: 0.4,
      textShadow: `-${f}px 0px 0px rgba(255,72,48,0.8), ${f}px 0px 0px rgba(48,196,255,0.8)`,
      letterSpacing: '0.5em',
    };
    gsap.set(el, from);
    fromTo(
      el,
      from,
      {
        filter: 'blur(0px)',
        opacity: 1,
        textShadow: '0px 0px 0px rgba(255,72,48,0), 0px 0px 0px rgba(48,196,255,0)',
        letterSpacing: '0.32em',
        duration: 0.11,
        ease: 'power1.out',
      },
      3.37 + i * 0.038,
    );
  });
  const dio = D('[data-anim="dioptre"]')[0];
  const power = { v: -2.75 };
  if (dio) dio.textContent = '−2.75 D';
  tl.to(
    power,
    {
      v: 0,
      duration: 0.34,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (!dio) return;
        const v = Math.round(power.v * 4) / 4;
        dio.textContent = `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(2)} D`;
      },
    },
    3.35,
  );
  fromTo(D('[data-anim="focus-hint"]'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.04 }, 3.66);
  fromTo(D('[data-anim="focus-done"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 3.68);
  // frames
  fromTo(
    D('[data-anim="lens-focus"]'),
    { autoAlpha: 1, y: 0, filter: 'blur(0px)' },
    { autoAlpha: 0, y: -60, filter: 'blur(8px)', duration: 0.07, ease: 'power2.in' },
    3.72,
  );
  gsap.set(D('[data-anim="lens-frames"]'), { autoAlpha: 0 });
  fromTo(D('[data-anim="lens-frames"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 3.76);
  {
    const ch = D('[data-anim="frames-title"] > span').flatMap((el) => chars(el));
    gsap.set(ch, focusFrom);
    tl.fromTo(
      ch,
      focusFrom,
      {
        ...focusTo,
        immediateRender: false,
        duration: 0.05,
        stagger: { amount: 0.05, from: 'center' },
      },
      3.77,
    );
  }
  D('[data-anim="lens-card"]').forEach((el, i) => {
    gsap.set(el, { autoAlpha: 0, x: -40 });
    fromTo(el, { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.06 }, 3.79 + i * 0.03);
  });
  const vh = window.innerHeight;
  D('[data-anim="frame-layer"]').forEach((el) => {
    const sp = Number(el.dataset.speed ?? 1);
    fromTo(
      el,
      { y: vh * 0.7 * sp, rotate: -5 * sp, filter: 'blur(6px)' },
      { y: -vh * 0.35 * sp, rotate: 3 * sp, filter: 'blur(0px)', duration: 0.24 },
      3.72,
    );
  });
  tl.to(S, { lensFade: 0.6, duration: 0.1 }, 3.74);

  /* ── Scene 5: retina (t 4 → 5) — the page blinks, we're inside ────── */
  blink(3.99);
  tl.to(S, { lensFade: 0, duration: 0.05 }, 4.0);
  tl.to(S, { lensFloat: 0, duration: 0.2 }, 4.04);
  tl.to(S.lensOffset, { x: 0, y: 0, duration: 0.2 }, 4.04);
  tl.to(S.cam, { x: 0, y: 0, z: 0.55, duration: 0.35, ease: 'power2.inOut' }, 4.02);
  tl.to(S.look, { x: 0, y: 0, z: -1, duration: 0.35, ease: 'power2.inOut' }, 4.02);
  tl.to(S, { fov: 62, vitreous: 1, duration: 0.35 }, 4.02);
  tl.to(S, { irisPeel: 1, duration: 0.01 }, 4);
  tl.to(S, { retina: 1, duration: 0.3, ease: 'power1.inOut' }, 4.3);
  // retinal scan: a laser line sweeps the fundus, annotations lock on
  tl.fromTo(
    S,
    { scan: 0 },
    { scan: 1, duration: 0.34, ease: 'power1.inOut', immediateRender: false },
    4.42,
  );
  const pct = D('[data-anim="scan-pct"]')[0];
  const scanP = { v: 0 };
  tl.to(
    scanP,
    {
      v: 100,
      duration: 0.34,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (pct) pct.textContent = String(Math.round(scanP.v));
      },
    },
    4.42,
  );
  gsap.set(D('[data-anim="scan-readout"]'), { autoAlpha: 0 });
  fromTo(D('[data-anim="scan-readout"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 4.42);
  D('[data-anim="retina-anno"]').forEach((el, i) => {
    gsap.set(el, { autoAlpha: 0 });
    fromTo(
      el,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.05, ease: 'expo.out' },
      4.5 + i * 0.08,
    );
  });
  gsap.set(
    D('[data-anim="retina-head"] .label, [data-anim="retina-line"], [data-anim="retina-scrim"]'),
    { autoAlpha: 0 },
  );
  fromTo(D('[data-anim="retina-scrim"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 4.3);
  fromTo(
    D('[data-anim="retina-head"] .label'),
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.08 },
    4.36,
  );
  title('retina-title', 4.38, 0.22);
  fromTo(
    D('[data-anim="retina-line"]'),
    { autoAlpha: 0, y: 12 },
    { autoAlpha: 1, y: 0, duration: 0.1 },
    4.46,
  );
  D('[data-anim="retina-item"]').forEach((el, i) => {
    gsap.set(el, { autoAlpha: 0, y: 40 });
    fromTo(
      el,
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, duration: 0.1, ease: 'power2.out' },
      4.52 + i * 0.09,
    );
  });
  fromTo(
    D('#health .stage > *'),
    { autoAlpha: 1, y: 0, filter: 'blur(0px)' },
    { autoAlpha: 0, y: -40, filter: 'blur(10px)', duration: 0.1, ease: 'power2.in' },
    4.86,
  );

  /* ── Scene 6: optic nerve → blink → daylight (t 5 → 6) ───────────── */
  tl.to(S, { retina: 0, vitreous: 0, scan: 0, duration: 0.15 }, 5);
  tl.to(S, { sclera: 1, duration: 0.12 }, 5.06);
  tl.to(S.cam, { x: 2.5, y: 0.95, z: -5.4, duration: 0.45, ease: 'power2.inOut' }, 5);
  tl.to(S.look, { x: -0.5, y: 0.55, z: -2.2, duration: 0.45, ease: 'power2.inOut' }, 5);
  tl.to(S, { fov: 40, nerve: 1, duration: 0.3 }, 5);
  gsap.set(D('[data-anim="nerve-kicker"]'), { autoAlpha: 0 });
  fromTo(D('[data-anim="nerve-kicker"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 5.1);
  readout('[data-anim="nerve-readout"]', 5.11);
  title('nerve-title', 5.12, 0.18);
  // close the eyes on the dark, open them into daylight
  blink(5.3, true);
  tl.set(S, { bgWarm: 1 }, 5.37);
  tl.set(D('[data-anim="nerve-copy"]'), { color: 'var(--ink)' }, 5.37);
  // hidden reassembly while the opaque care content covers the canvas
  tl.set(S, { covered: true }, 5.62);
  tl.set(
    S,
    {
      irisPeel: 0.75,
      cornea: 0,
      lensFloat: 0,
      lensFade: 1,
      lensBlur: 1,
      lensSpin: 0,
      lensSquash: 0,
      nerve: 0,
      retina: 0,
      vitreous: 0,
      sclera: 1,
      irisGlow: 0.3,
      pupil: 0.45,
      fov: 35,
      lidsShow: 0,
      dock: 1,
    },
    5.63,
  );
  tl.set(S.cam, { x: 0, y: 0, z: 5.2 }, 5.63);
  tl.set(S.look, { x: 0, y: 0, z: 0 }, 5.63);
  tl.set(S.eye, { rx: 0, ry: 0, scale: 0.6 }, 5.63);
  tl.set(S, { covered: false }, 5.9);

  /* ── Scene 7: the eye reassembles in miniature (t 6 → 7) ─────────── */
  tl.to(S, { irisPeel: 0, cornea: 1, irisGlow: 0, duration: 0.3, ease: 'power2.out' }, 5.92);
  tl.to(S.eye, { scale: 1, duration: 0.3, ease: 'power2.out' }, 5.92);
  // stacked Book layout (< 1024px): the docked eye sits above the form, so it bows out
  if (window.innerWidth < 1024)
    tl.to(S.eye, { scale: 0.0001, duration: 0.18, ease: 'power2.in' }, 6.3);

  tl.set({}, {}, END_T);
  return tl;
}

/** Text intro (time-based): headline mask-reveals line by line, scroll cue draws itself. CTAs never hidden. */
function playTextIntro() {
  // The headline/kicker/support reveal is pure CSS (globals.css, hero keyframes) so it starts at
  // first paint without waiting for JS — the headline is the LCP element.
  const { gsap } = getGsap();
  const tl = gsap.timeline({ delay: 0.1 });
  tl.set(all(['[data-anim="scroll-cue-line"]']), { scaleY: 0 });
  tl.to(
    all(['[data-anim="scroll-cue-line"]']),
    { scaleY: 1, duration: 1, ease: 'expo.inOut' },
    2.6,
  );
  tl.fromTo(
    all(['[data-anim="scroll-cue-line"]']),
    { yPercent: 0 },
    { yPercent: 100, duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 0.6 },
    3.8,
  );
  return tl;
}

/** Eye intro, once the 3D is ready: black → sliver of light → lids open → pupil beat. */
export function playEyeIntro() {
  const { gsap } = getGsap();
  const S = story;
  const canvas = document.getElementById('eye-canvas');
  const tl = gsap.timeline();
  S.intro.lids = 0;
  S.intro.pupil = 0.45;
  if (canvas) tl.to(canvas, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0);
  tl.to(S.intro, { lids: 0.06, duration: 0.5, ease: 'power2.out' }, 0.25);
  tl.to(S.intro, { lids: 1, duration: 1.3, ease: 'expo.inOut' }, 1.0);
  tl.to(S.intro, { pupil: 0.82, duration: 0.7, ease: 'sine.inOut' }, 2.1);
  tl.to(S.intro, { pupil: 0.26, duration: 0.45, ease: 'power2.out' }, 2.85);
  tl.to(S.intro, { pupil: 0.45, duration: 1.2, ease: 'sine.inOut' }, 3.3);
  return tl;
}

function all(selectors: string[]) {
  return selectors.flatMap((s) => q(s));
}

/**
 * Boot the cinematic story. Returns a cleanup function.
 * Rebuilds on breakpoint changes (gsap.matchMedia) and re-measures anchors on refresh.
 */
export function initStory() {
  const { gsap, ScrollTrigger } = getGsap();
  const mm = gsap.matchMedia();
  let intro: gsap.core.Timeline | null = null;

  // The text intro runs straight away; the eye intro is started by the canvas once it has rendered.
  intro = playTextIntro();

  mm.add(
    {
      // phones, and tablets held upright, get the stacked composition
      mobile: '(max-width: 767px), (max-width: 1023px) and (orientation: portrait)',
      desktop: '(min-width: 768px) and (orientation: landscape), (min-width: 1024px)',
    },
    (ctx) => {
      const isMobile = Boolean(ctx.conditions?.mobile);
      const tl = buildTimeline(isMobile);
      let anchors: Anchor[] = measureAnchors(ScrollTrigger.maxScroll(window));
      let seek: gsap.core.Tween | null = null;

      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const target = scrollToTime(self.scroll(), anchors);
          seek?.kill();
          seek = gsap.to(tl, {
            time: target,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: true,
            onUpdate: () => {
              story.t = tl.time();
            },
          });
        },
      });
      anchors = measureAnchors(ScrollTrigger.maxScroll(window));
      tl.time(scrollToTime(window.scrollY, anchors));
      story.t = tl.time();

      // Re-measure anchors *after* every refresh completes (layout changes, lazy content,
      // resize). During a refresh ScrollTrigger may report a transient scroll of 0, so we
      // only seek once it has finished, from the real scroll position.
      const onRefreshed = () => {
        anchors = measureAnchors(ScrollTrigger.maxScroll(window));
        seek?.kill();
        tl.time(scrollToTime(window.scrollY, anchors));
        story.t = tl.time();
      };
      ScrollTrigger.addEventListener('refresh', onRefreshed);

      return () => {
        ScrollTrigger.removeEventListener('refresh', onRefreshed);
        seek?.kill();
        st.kill();
        tl.kill();
      };
    },
  );

  // batch layout changes (font swaps, lazy islands) into one refresh — each refresh forces layout
  let refreshTimer = 0;
  const ro = new ResizeObserver(() => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 250);
  });
  const main = document.getElementById('main');
  if (main) ro.observe(main);

  return () => {
    ro.disconnect();
    intro?.kill();
    mm.revert();
  };
}

/** Reduced motion / static: no scroll choreography; just a calm idle eye and an instant hero. */
export function initStatic() {
  // if the cinematic story ran before falling back, put scrubbed DOM text back to rest
  document.querySelectorAll('[data-anim="dioptre"]').forEach((el) => (el.textContent = '0.00 D'));
  Object.assign(story, { ...createStory(), pointer: story.pointer, tilt: story.tilt });
  story.intro.lids = 1;
  story.intro.pupil = 0.45;
  const mobile = window.matchMedia(
    '(max-width: 767px), (max-width: 1023px) and (orientation: portrait)',
  ).matches;
  Object.assign(story.cam, mobile ? { x: 0, y: -1.35, z: 8.4 } : { x: -1.55, y: -0.05, z: 6.0 });
  Object.assign(story.look, { x: story.cam.x, y: story.cam.y, z: 0 });
  const canvas = document.getElementById('eye-canvas');
  if (canvas) canvas.style.opacity = '1';
  // static-mode reveals
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }),
    { rootMargin: '0px 0px -10% 0px' },
  );
  q('.reveal').forEach((el) => io.observe(el));
  return () => io.disconnect();
}
