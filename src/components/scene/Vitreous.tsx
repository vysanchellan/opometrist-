'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { theme } from '@/config/theme';
import { floaterFragment, floaterVertex } from '@/shaders/vitreous';
import { story } from '@/lib/story';
import { rng } from '@/lib/textures';

/** Vitreous: the gel interior — a faint volume tint plus slow-drifting floaters. */
export function Vitreous({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);
  const shell = useRef<THREE.Mesh>(null);
  const shellMat = useRef<THREE.MeshBasicMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);
  const geo = useMemo(() => {
    const rand = rng(99);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 0.85 * Math.cbrt(rand());
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph) * 0.9 - 0.05;
      seed[i] = rand();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);
  useEffect(() => () => geo.dispose(), [geo]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 12 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color(theme.signal).lerp(new THREE.Color('#ffffff'), 0.5) },
    }),
    [],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPixelRatio.value = dpr;
    uniforms.uOpacity.value = story.vitreous;
    const vis = story.vitreous > 0.005;
    if (points.current) points.current.visible = vis;
    if (shell.current) shell.current.visible = vis;
    if (shellMat.current) shellMat.current.opacity = story.vitreous * 0.025;
  });

  return (
    <>
      <points ref={points} geometry={geo} renderOrder={6}>
        <shaderMaterial
          vertexShader={floaterVertex}
          fragmentShader={floaterFragment}
          args={[{ uniforms: uniforms }]}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={shell} renderOrder={3}>
        <sphereGeometry args={[0.94, 32, 16]} />
        <meshBasicMaterial
          ref={shellMat}
          color={theme.irisB}
          transparent
          opacity={0}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}
