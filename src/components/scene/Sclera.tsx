'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { story } from '@/lib/story';
import { makeScleraTexture } from '@/lib/textures';
import { LIMBUS_THETA } from './anatomy';

/** Sclera: off-white sphere with procedural vessels, wet clearcoat and a warm sheen at grazing angles. */
export function Sclera({ segments }: { segments: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const map = useMemo(() => makeScleraTexture(segments >= 128 ? 2048 : 1024), [segments]);
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(
      1,
      segments,
      segments / 2,
      0,
      Math.PI * 2,
      LIMBUS_THETA,
      Math.PI - LIMBUS_THETA,
    );
    g.rotateX(Math.PI / 2);
    return g;
  }, [segments]);
  useEffect(() => () => (geo.dispose(), map.dispose()), [geo, map]);

  useFrame(() => {
    const m = mat.current;
    if (!m || !mesh.current) return;
    const o = story.sclera;
    const transparent = o < 0.999;
    if (m.transparent !== transparent) {
      m.transparent = transparent;
      m.depthWrite = !transparent;
      m.needsUpdate = true;
    }
    m.opacity = o;
    mesh.current.visible = o > 0.004;
  });

  return (
    <mesh ref={mesh} geometry={geo}>
      <meshPhysicalMaterial
        ref={mat}
        map={map}
        roughness={0.36}
        clearcoat={1}
        clearcoatRoughness={0.1}
        sheen={0.8}
        sheenColor="#ff9f8f"
        sheenRoughness={0.45}
        envMapIntensity={0.9}
      />
    </mesh>
  );
}
