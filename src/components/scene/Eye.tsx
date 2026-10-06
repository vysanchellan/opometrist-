'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type * as THREE from 'three';
import type { TierSettings } from '@/lib/useQualityTier';
import { damp, story } from '@/lib/story';
import { lerp, smoothstep } from './anatomy';
import { Cornea } from './Cornea';
import { Iris } from './Iris';
import { Lens } from './Lens';
import { Lids } from './Lids';
import { OpticNerve } from './OpticNerve';
import { Pupil } from './Pupil';
import { Retina } from './Retina';
import { Sclera } from './Sclera';
import { Vitreous } from './Vitreous';

/**
 * The eye. `dock` positions/scales the whole thing (Book scene), `rot` is the eyeball
 * rotating in its socket (cursor / tilt tracking — lids stay put, like a real face),
 * `body` is everything except the lens, which can separate and float away.
 */
export function Eye({ q }: { q: TierSettings }) {
  const dock = useRef<THREE.Group>(null);
  const rot = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const aim = useRef({ yaw: 0, pitch: 0 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const S = story;
    const time = state.clock.elapsedTime;
    const aspect = state.size.width / Math.max(1, state.size.height);
    // matches the Book layout: two columns (eye docked right) from 1024px, stacked below
    const mobile = state.size.width < 1024;

    // dock into the Book layout: right half on desktop, top on mobile
    const ndcX = mobile ? 0 : 0.5;
    const ndcY = mobile ? 0.56 : 0.02;
    const halfH = Math.tan((35 * Math.PI) / 180 / 2) * 5.2;
    if (dock.current) {
      dock.current.position.set(ndcX * halfH * aspect * S.dock, ndcY * halfH * S.dock, 0);
      dock.current.scale.setScalar(lerp(1, mobile ? 0.4 : 0.56, S.dock) * S.eye.scale);
    }

    // where should the eye look?
    const w = 1 - smoothstep(1.2, 1.9, S.t) + smoothstep(5.7, 6.1, S.t);
    let tx: number;
    let ty: number;
    if (S.pointer.active) {
      tx = S.pointer.x - ndcX * S.dock;
      ty = S.pointer.y - ndcY * S.dock;
    } else if (S.tilt.active) {
      tx = S.tilt.x;
      ty = S.tilt.y;
    } else {
      tx = Math.sin(time * 0.31) * 0.45 + Math.sin(time * 0.83) * 0.08;
      ty = Math.sin(time * 0.23) * 0.25;
    }
    const a = aim.current;
    a.yaw = damp(a.yaw, Math.max(-1, Math.min(1, tx)) * 0.22 * w, 4, dt);
    a.pitch = damp(a.pitch, Math.max(-1, Math.min(1, ty)) * 0.16 * w, 4, dt);
    const idle = S.dock * (Math.sin(time * 0.35) * 0.35);
    if (rot.current) rot.current.rotation.set(S.eye.rx - a.pitch, S.eye.ry + a.yaw + idle, 0);
    if (body.current) body.current.position.z = -S.lensFloat * 1.1;
  });

  return (
    <group ref={dock}>
      <Pupil />
      <Lids segments={q.segments} />
      <group ref={rot}>
        <group ref={body}>
          <Sclera segments={q.segments} />
          <Iris segments={q.segments} octaves={q.octaves} />
          <Cornea segments={q.segments} transmission={q.transmission} />
          <Retina segments={q.segments} octaves={q.octaves} />
          <Vitreous count={q.floaters} />
          <OpticNerve fibres={q.tier === 'low' ? 14 : 30} />
        </group>
        <Lens segments={q.segments} transmission={q.transmission} />
      </group>
    </group>
  );
}
