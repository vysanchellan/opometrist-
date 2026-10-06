'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { theme } from '@/config/theme';
import { irisFragment, irisVertex } from '@/shaders/iris';
import { story } from '@/lib/story';
import { IRIS_Z, LIMBUS_R, PETALS } from './anatomy';
import { pupilState } from './Pupil';

/** Iris: procedural GLSL (fibres, crypts, collarette, limbal ring), split into aperture blades. */
export function Iris({ segments, octaves }: { segments: number; octaves: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const seg = (Math.PI * 2) / PETALS;
    const parts = Array.from({ length: PETALS }, (_, i) => {
      const g = new THREE.RingGeometry(
        0.0005,
        LIMBUS_R * 0.998,
        Math.ceil(segments / PETALS) + 2,
        Math.round(segments / 4),
        i * seg,
        seg,
      );
      const n = g.attributes.position!.count;
      g.setAttribute('aPetal', new THREE.BufferAttribute(new Float32Array(n).fill(i), 1));
      return g;
    });
    const merged = mergeGeometries(parts)!;
    parts.forEach((p) => p.dispose());
    return merged;
  }, [segments]);
  useEffect(() => () => geo.dispose(), [geo]);

  const uniforms = useMemo(
    () => ({
      uColorA: { value: new THREE.Color(theme.irisA) },
      uColorB: { value: new THREE.Color(theme.irisB) },
      uColorC: { value: new THREE.Color(theme.irisC) },
      uPupil: { value: 0.2 },
      uOuter: { value: LIMBUS_R },
      uTime: { value: 0 },
      uGlow: { value: 0 },
      uPeel: { value: 0 },
      uPetals: { value: PETALS },
      uOpacity: { value: 1 },
      uOctaves: { value: octaves },
      uLight: { value: new THREE.Vector3(0.3, 0.4, 1) },
    }),
    [octaves],
  );

  useFrame((state) => {
    const u = uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uPupil.value = pupilState.radius;
    u.uGlow.value = story.irisGlow;
    u.uPeel.value = story.irisPeel;
    const p = story.pointer;
    u.uLight.value.set(p.x * 1.4, p.y * 1.4, 1);
    if (mesh.current) mesh.current.visible = story.sclera > 0.17;
  });

  return (
    <mesh ref={mesh} geometry={geo} position={[0, 0, IRIS_Z]}>
      <shaderMaterial
        vertexShader={irisVertex}
        fragmentShader={irisFragment}
        args={[{ uniforms: uniforms }]}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
