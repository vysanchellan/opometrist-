'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { story } from '@/lib/story';
import { CORNEA_CZ, CORNEA_R, CORNEA_THETA } from './anatomy';

/**
 * Cornea: transparent glossy dome. High/Medium tiers use real transmission (refraction of
 * the iris through the curved surface); Low tier renders reflections only, additively.
 */
export function Cornea({ segments, transmission }: { segments: number; transmission: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(
      CORNEA_R,
      segments,
      segments / 2,
      0,
      Math.PI * 2,
      0,
      CORNEA_THETA,
    );
    g.rotateX(Math.PI / 2);
    g.translate(0, 0, CORNEA_CZ);
    return g;
  }, [segments]);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(() => {
    const m = mat.current;
    if (!m || !mesh.current) return;
    const c = story.cornea;
    mesh.current.visible = c > 0.01;
    m.envMapIntensity = 2.6 * c;
    m.specularIntensity = c;
    m.clearcoat = c;
    if (transmission) m.transmission = c;
  });

  return (
    <mesh ref={mesh} geometry={geo} renderOrder={5}>
      {transmission ? (
        <meshPhysicalMaterial
          ref={mat}
          transmission={1}
          thickness={0.06}
          roughness={0.015}
          ior={1.376}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={2.6}
          color="#ffffff"
        />
      ) : (
        <meshPhysicalMaterial
          ref={mat}
          color="#000000"
          roughness={0.02}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={2.6}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      )}
    </mesh>
  );
}
