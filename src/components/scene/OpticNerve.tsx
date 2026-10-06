'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { theme } from '@/config/theme';
import { nerveFibreFragment, nerveSheathFragment, nerveVertex } from '@/shaders/nerve';
import { story } from '@/lib/story';
import { rng, RETINA_DISC } from '@/lib/textures';
import { RETINA_R } from './anatomy';

const discWorld = () => {
  const x = RETINA_DISC.x * RETINA_R;
  const y = RETINA_DISC.y * RETINA_R;
  return new THREE.Vector3(x, y, -Math.sqrt(RETINA_R ** 2 - x * x - y * y));
};

/** Optic nerve: tapered sheath leaving the back of the eye, with fibre strands carrying signal pulses away. */
export function OpticNerve({ fibres = 30 }: { fibres?: number }) {
  const group = useRef<THREE.Group>(null);
  const { sheath, strands } = useMemo(() => {
    const d = discWorld();
    const curve = new THREE.CatmullRomCurve3([
      d.clone().multiplyScalar(0.98),
      new THREE.Vector3(d.x - 0.05, d.y, -1.55),
      new THREE.Vector3(d.x - 0.2, d.y - 0.06, -2.4),
      new THREE.Vector3(d.x - 0.45, d.y - 0.18, -3.4),
      new THREE.Vector3(d.x - 0.8, d.y - 0.3, -4.6),
    ]);
    const sheathGeo = new THREE.TubeGeometry(curve, 96, 0.15, 24, false);
    const rand = rng(5);
    const parts: THREE.BufferGeometry[] = [];
    const frames = curve.computeFrenetFrames(64, false);
    for (let i = 0; i < fibres; i++) {
      const ang = rand() * Math.PI * 2;
      const rad = 0.03 + rand() * 0.095;
      const twist = (rand() - 0.5) * 2.5;
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 64; k++) {
        const u = k / 64;
        const p = curve.getPointAt(u);
        const a = ang + twist * u;
        const n = frames.normals[k]!;
        const b = frames.binormals[k]!;
        const taper = 1 - u * 0.25;
        p.addScaledVector(n, Math.cos(a) * rad * taper).addScaledVector(
          b,
          Math.sin(a) * rad * taper,
        );
        pts.push(p);
      }
      const g = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts),
        64,
        0.0045 + rand() * 0.004,
        4,
        false,
      );
      const count = g.attributes.position!.count;
      g.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array(count).fill(rand()), 1));
      parts.push(g);
    }
    const strandGeo = mergeGeometries(parts)!;
    parts.forEach((p) => p.dispose());
    const sc = sheathGeo.attributes.position!.count;
    sheathGeo.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array(sc), 1));
    return { sheath: sheathGeo, strands: strandGeo };
  }, [fibres]);
  useEffect(() => () => (sheath.dispose(), strands.dispose()), [sheath, strands]);

  const fibreU = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uSignal: { value: new THREE.Color(theme.signal) },
      uBase: { value: new THREE.Color(theme.irisB) },
    }),
    [],
  );
  const sheathU = useMemo(
    () => ({ uIntensity: { value: 0 }, uTint: { value: new THREE.Color(theme.sclera) } }),
    [],
  );

  useFrame((state) => {
    fibreU.uTime.value = state.clock.elapsedTime;
    fibreU.uIntensity.value = story.nerve;
    sheathU.uIntensity.value = story.nerve;
    if (group.current) group.current.visible = story.nerve > 0.003;
  });

  return (
    <group ref={group}>
      <mesh geometry={strands} renderOrder={7}>
        <shaderMaterial
          vertexShader={nerveVertex}
          fragmentShader={nerveFibreFragment}
          args={[{ uniforms: fibreU }]}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh geometry={sheath} renderOrder={8}>
        <shaderMaterial
          vertexShader={nerveVertex}
          fragmentShader={nerveSheathFragment}
          args={[{ uniforms: sheathU }]}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
