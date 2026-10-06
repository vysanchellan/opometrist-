'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Cursor } from '@/components/ui/Cursor';
import { detectDevice, disableWebgl, experience, useExperience } from '@/lib/experience';
import { startLenis, stopLenis } from '@/lib/lenis';
import { story } from '@/lib/story';
import { useQualityTier } from '@/lib/useQualityTier';

// The whole 3D layer is a lazy, client-only chunk: it never blocks first paint or LCP.
const EyeCanvas = dynamic(() => import('@/components/scene/EyeCanvas'), {
  ssr: false,
  loading: () => null,
});

/** Client orchestrator: device detection, smooth scroll, the story timeline, pointer/tilt input, cursor. */
export function Experience() {
  const ready = useExperience((s) => s.ready);
  const webgl = useExperience((s) => s.webgl);
  const reduced = useExperience((s) => s.reducedMotion);
  const q = useQualityTier();
  const cinematic = ready && webgl && !reduced;
  // Mount the 3D only after the page has loaded and the main thread is idle: the poster
  // (a render of the same eye) carries LCP, so the swap is seamless. On touch devices and
  // data-saver connections the 3D chunk is only fetched once the visitor engages
  // (first touch / scroll / key) or after a quiet pause — capped data stays capped.
  const [mount3d, setMount3d] = useState(false);
  useEffect(() => {
    if (!ready || !webgl) return;
    let idle = 0;
    const mount = () => {
      experience.set({ booting: true });
      setMount3d(true);
    };
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const onDemand =
      window.matchMedia('(pointer: coarse)').matches || nav.connection?.saveData === true;
    const intents = ['pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown'] as const;
    const go = () => {
      if (onDemand) {
        intents.forEach((e) => window.addEventListener(e, mount, { once: true, passive: true }));
        return;
      }
      // desktop: first sign of life (mouse, wheel, key) or a short idle pause
      intents.forEach((e) => window.addEventListener(e, mount, { once: true, passive: true }));
      window.addEventListener('pointermove', mount, { once: true, passive: true });
      const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
      idle = window.setTimeout(() => ric(mount, { timeout: 1500 } as IdleRequestOptions), 3500);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => {
      window.removeEventListener('load', go);
      intents.forEach((e) => window.removeEventListener(e, mount));
      window.removeEventListener('pointermove', mount);
      window.clearTimeout(idle);
    };
  }, [ready, webgl]);

  useEffect(() => {
    detectDevice();
    if (process.env.NODE_ENV !== 'production' || location.search.includes('debug')) {
      (window as unknown as { __iris: unknown }).__iris = { story, experience };
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      document.documentElement.dataset.motion = mq.matches ? 'reduced' : 'full';
      document.documentElement.dataset.cinematic =
        !mq.matches && experience.get().webgl ? 'on' : 'off';
      experience.set({ reducedMotion: mq.matches });
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // pointer = light source + gaze target
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      story.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      story.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      story.pointer.active = e.pointerType === 'mouse';
    };
    const onLeave = () => (story.pointer.active = false);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    // touch devices: gentle device tilt where the browser allows it without a prompt
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      story.tilt.x = Math.max(-1, Math.min(1, e.gamma / 30));
      story.tilt.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30)) * -1;
      story.tilt.active = true;
    };
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const DOE = window.DeviceOrientationEvent as unknown as
      { requestPermission?: () => Promise<string> } | undefined;
    if (coarse && DOE && typeof DOE.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', onTilt, { passive: true });
    }
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, []);

  // story: cinematic (Lenis + master timeline) or static (calm reveals)
  useEffect(() => {
    if (!ready) return;
    // GSAP + ScrollTrigger + Lenis are imported on demand — off the critical path.
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    void Promise.all([import('@/lib/scrollTimeline'), import('@/lib/textFx')]).then(
      async ([{ initStatic, initStory }, { focusOnView }]) => {
        if (cancelled) return;
        // content headlines focus-pull in on view (both modes, unless reduced motion)
        const killFocus = reduced ? () => undefined : focusOnView();
        if (!cinematic) {
          const killStatic = initStatic();
          cleanup = () => {
            killStatic();
            killFocus();
          };
          return;
        }
        await startLenis();
        if (cancelled) return;
        const kill = initStory();
        cleanup = () => {
          kill();
          killFocus();
          stopLenis();
        };
      },
    );
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [ready, cinematic, reduced]);

  // [data-observe] elements get [data-seen] once visible (CSS-driven moments, e.g. the Rx signature)
  useEffect(() => {
    if (!ready) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.seen = '';
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.35 },
    );
    document.querySelectorAll('[data-observe]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ready]);

  // eye intro once the first 3D frame is on screen; watchdog falls back to static if WebGL fails
  useEffect(() => {
    if (!cinematic || !mount3d) return;
    let played = false;
    const check = () => {
      if (!played && experience.get().canvasReady) {
        played = true;
        void import('@/lib/scrollTimeline').then((m) => m.playEyeIntro());
      }
    };
    check();
    const unsub = experience.subscribe(check);
    // Count *rendered* frames (rAF pauses in background tabs), so a slow or hidden tab never
    // trips the fallback — only a canvas that genuinely fails to draw for ~15s of visible time.
    let frames = 0;
    let raf = 0;
    const watch = () => {
      if (experience.get().canvasReady) return;
      if (++frames > 900) {
        disableWebgl('no frame rendered');
        return;
      }
      raf = requestAnimationFrame(watch);
    };
    raf = requestAnimationFrame(watch);
    return () => {
      unsub();
      cancelAnimationFrame(raf);
    };
  }, [cinematic, mount3d]);

  return (
    <>
      {mount3d && webgl ? <EyeCanvas mode={reduced ? 'hero' : 'fixed'} /> : null}
      {!q.post || !cinematic ? <div className="vignette" aria-hidden="true" /> : null}
      <div className="grain" aria-hidden="true" />
      <Cursor />
    </>
  );
}
