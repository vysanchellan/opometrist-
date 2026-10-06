'use client';

import { effectiveTier, useExperience, type Tier } from './experience';

export type TierSettings = {
  tier: Tier;
  dpr: [number, number];
  post: { bloom: boolean; ca: boolean; dof: boolean; vignette: boolean } | null;
  segments: number;
  octaves: number;
  transmission: boolean;
  hdri: boolean;
  floaters: number;
};

export const TIERS: Record<Tier, TierSettings> = {
  high: {
    tier: 'high',
    dpr: [1, 2],
    post: { bloom: true, ca: true, dof: true, vignette: true },
    segments: 128,
    octaves: 5,
    transmission: true,
    hdri: true,
    floaters: 420,
  },
  medium: {
    tier: 'medium',
    dpr: [1, 1.5],
    post: { bloom: true, ca: true, dof: false, vignette: true },
    segments: 96,
    octaves: 4,
    transmission: true,
    hdri: true,
    floaters: 260,
  },
  low: {
    tier: 'low',
    dpr: [1, 1],
    post: null,
    segments: 48,
    octaves: 2,
    transmission: false,
    hdri: false,
    floaters: 120,
  },
};

/** Effective quality settings (auto-detected, PerformanceMonitor-adjusted, or user override). */
export function useQualityTier(): TierSettings {
  const tier = useExperience(effectiveTier);
  return TIERS[tier];
}
