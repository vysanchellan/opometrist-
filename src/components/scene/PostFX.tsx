'use client';

import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import {
  ToneMappingMode,
  type ChromaticAberrationEffect,
  type VignetteEffect,
} from 'postprocessing';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { story } from '@/lib/story';
import type { TierSettings } from '@/lib/useQualityTier';

/** Restrained post: bloom, transition chromatic aberration (+ velocity), DOF that pulls focus per scene, vignette. */
export function PostFX({
  post,
  multisampling,
}: {
  post: NonNullable<TierSettings['post']>;
  multisampling: number;
}) {
  const ca = useRef<ChromaticAberrationEffect>(null);
  const vig = useRef<VignetteEffect>(null);
  const target = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const caOffset = useMemo(() => new THREE.Vector2(0.0004, 0.0003), []);

  useFrame(() => {
    target.set(story.look.x, story.look.y, story.look.z);
    // on paper scenes the vignette would grey the page out — fade it with the warm shift
    if (vig.current) vig.current.darkness = 0.62 * (1 - story.bgWarm);
    if (ca.current) {
      const v = Math.min(Math.abs(story.velocity) * 0.00004, 0.0025);
      const o = 0.0004 + story.ca * 0.014 + v;
      ca.current.offset.set(o, o * 0.6);
    }
  });

  const effects = [
    post.dof ? (
      <DepthOfField key="dof" target={target} focalLength={0.05} bokehScale={1.6} />
    ) : null,
    post.bloom ? (
      <Bloom
        key="bloom"
        mipmapBlur
        intensity={0.7}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.3}
        radius={0.72}
      />
    ) : null,
    post.ca ? (
      <ChromaticAberration
        key="ca"
        ref={ca}
        offset={caOffset}
        radialModulation
        modulationOffset={0.2}
      />
    ) : null,
    post.vignette ? <Vignette key="vig" ref={vig} offset={0.28} darkness={0.62} /> : null,
    <ToneMapping key="tm" mode={ToneMappingMode.NEUTRAL} />,
  ].filter((e): e is React.JSX.Element => e !== null);

  return (
    <EffectComposer multisampling={multisampling} enableNormalPass={false}>
      {effects}
    </EffectComposer>
  );
}
