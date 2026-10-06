'use client';

import { useFrame } from '@react-three/fiber';
import { damp, story } from '@/lib/story';
import { clamp, lerp, smoothstep } from './anatomy';

/** Live pupil state, read by the iris shader every frame. */
export const pupilState = { value: 0.45, radius: 0.2, light: 0.45 };

/**
 * Pupil dynamics. The pointer is a light source: bring it onto the optical axis and the
 * pupil constricts quickly; take it away and it dilates slowly (biological asymmetry).
 * Scroll scenes and the intro beat are layered on top, plus a faint physiological hippus.
 */
export function Pupil() {
  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const p = story.pointer;
    let light = 0.45;
    if (p.active) {
      const wide = state.size.width >= 1024;
      const ex = story.dock * (wide ? 0.5 : 0);
      const ey = story.dock * (wide ? 0 : 0.56);
      const d = Math.hypot(p.x - ex, (p.y - ey) * 0.85);
      light = lerp(0.74, 0.14, 1 - smoothstep(0.04, 1.05, d));
    }
    pupilState.light = light;
    const inside = story.irisPeel > 0.01 ? 0 : 1;
    const target = clamp(
      story.pupil + (light - 0.45) * 0.9 * inside + (story.intro.pupil - 0.45),
      0.04,
      1,
    );
    const lambda = target < pupilState.value ? 6 : 1.6;
    pupilState.value = damp(pupilState.value, target, lambda, dt);
    const hippus =
      1 +
      0.012 * Math.sin(state.clock.elapsedTime * 2.1) +
      0.006 * Math.sin(state.clock.elapsedTime * 5.3);
    // as the iris peels open the aperture widens too
    pupilState.radius = lerp(0.1, 0.3, pupilState.value) * hippus + story.irisPeel * 0.12;
  });
  return null;
}
