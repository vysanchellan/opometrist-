'use client';

import { useSyncExternalStore } from 'react';

export type Tier = 'high' | 'medium' | 'low';
export type TierSetting = Tier | 'auto';

type State = {
  /** Has the client inspected the device yet (false during SSR / first paint). */
  ready: boolean;
  reducedMotion: boolean;
  webgl: boolean;
  /** The tier the heuristics + PerformanceMonitor settled on. */
  autoTier: Tier;
  /** The user's manual override from the footer. */
  tierSetting: TierSetting;
  /** The 3D chunk has started loading. */
  booting: boolean;
  /** First 3D frame has rendered. */
  canvasReady: boolean;
  /** Asset loading progress 0–100. */
  progress: number;
};

let state: State = {
  ready: false,
  reducedMotion: false,
  webgl: true,
  autoTier: 'high',
  tierSetting: 'auto',
  booting: false,
  canvasReady: false,
  progress: 0,
};

const listeners = new Set<() => void>();

export const experience = {
  get: () => state,
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

const serverState = state;

export function useExperience<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    experience.subscribe,
    () => selector(experience.get()),
    () => selector(serverState),
  );
}

export const effectiveTier = (s: State): Tier =>
  s.tierSetting === 'auto' ? s.autoTier : s.tierSetting;

/** Cinematic = WebGL available and motion allowed. */
export const isCinematic = (s: State) => s.ready && s.webgl && !s.reducedMotion;

const TIER_KEY = 'iris:tier';

export function detectDevice() {
  const html = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const webgl = html.dataset.webgl !== 'off';
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const saveData = nav.connection?.saveData === true;
  const slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType ?? '');
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  let autoTier: Tier = 'high';
  if (saveData || slowNet || memory <= 2 || cores <= 2) autoTier = 'low';
  else if (coarse || memory <= 4 || cores <= 4) autoTier = 'medium';

  let tierSetting: TierSetting = 'auto';
  try {
    const saved = localStorage.getItem(TIER_KEY);
    if (saved === 'high' || saved === 'medium' || saved === 'low' || saved === 'auto')
      tierSetting = saved;
  } catch {
    /* storage unavailable */
  }
  experience.set({ ready: true, reducedMotion, webgl, autoTier, tierSetting });
}

export function setTierSetting(tierSetting: TierSetting) {
  try {
    localStorage.setItem(TIER_KEY, tierSetting);
  } catch {
    /* storage unavailable */
  }
  experience.set({ tierSetting });
}

/** Fall back to the static experience (no/unusable WebGL). */
export function disableWebgl(reason: string) {
  if (process.env.NODE_ENV !== 'production') console.info('[iris] 3D disabled:', reason);
  const html = document.documentElement;
  html.dataset.webgl = 'off';
  html.dataset.cinematic = 'off';
  experience.set({ webgl: false });
}

/** Software rasterisers make WebGL a slideshow — treat them as "no WebGL" unless ?force3d. */
export function isSoftwareRenderer(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  if (/force3d/.test(location.search)) return false;
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const name = String(
    info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
  );
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
}
