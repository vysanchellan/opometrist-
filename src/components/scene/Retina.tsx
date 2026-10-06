'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { theme } from '@/config/theme';
import { retinaFragment, retinaVertex } from '@/shaders/retina';
import { story } from '@/lib/story';
import { makeVeinTexture, RETINA_DISC, RETINA_MACULA } from '@/lib/textures';
import { RETINA_R } from './anatomy';

/** Retina: inner back surface with a glowing, procedurally grown vascular tree. */
export function Retina({ segments, octaves }: { segments: number; octaves: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const veins = useMemo(() => makeVeinTexture(segments >= 128 ? 2048 : 1024), [segments]);
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(RETINA_R, segments, segments / 2, 0, Math.PI * 2, 0, 1.25);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [segments]);
  useEffect(() => () => (geo.dispose(), veins.dispose()), [geo, veins]);

  const uniforms = useMemo(
    () => ({
      uVeins: { value: veins },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uRadius: { value: RETINA_R },
      uSignal: { value: new THREE.Color(theme.signal) },
      uAccent: { value: new THREE.Color(theme.irisB) },
      uDisc: { value: new THREE.Vector2(RETINA_DISC.x, RETINA_DISC.y) },
      uMacula: { value: new THREE.Vector2(RETINA_MACULA.x, RETINA_MACULA.y) },
      uOctaves: { value: octaves },
      uScan: { value: 0 },
    }),
    [veins, octaves],
  );

  // annotation anchors on the fundus (uv in [-1,1] → point on the retina sphere)
  const anchors = useMemo(() => {
    const at = (u: number, v: number) =>
      new THREE.Vector3(
        u * RETINA_R,
        v * RETINA_R,
        -Math.sqrt(RETINA_R ** 2 - (u * RETINA_R) ** 2 - (v * RETINA_R) ** 2),
      );
    return [
      { id: 'anno-disc', p: at(RETINA_DISC.x, RETINA_DISC.y) },
      { id: 'anno-macula', p: at(RETINA_MACULA.x, RETINA_MACULA.y) },
      { id: 'anno-arcade', p: at(0.12, 0.46) },
    ];
  }, []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const els = useRef<(HTMLElement | null)[] | null>(null);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uReveal.value = story.retina;
    uniforms.uScan.value = story.scan;
    // pin the HTML annotations to their 3D points (only while the retina is on screen)
    if (story.retina > 0.05 && mesh.current) {
      els.current ??= anchors.map((a) => document.getElementById(a.id));
      const { width, height } = state.size;
      anchors.forEach((a, i) => {
        const el = els.current?.[i];
        if (!el) return;
        tmp.copy(a.p).applyMatrix4(mesh.current!.matrixWorld).project(state.camera);
        const x = (tmp.x * 0.5 + 0.5) * width;
        const y = (-tmp.y * 0.5 + 0.5) * height;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });
    }
    if (mesh.current)
      mesh.current.visible =
        story.retina > 0.002 || (story.irisPeel > 0.02 && story.lensFloat < 0.3);
  });

  return (
    <mesh ref={mesh} geometry={geo}>
      <shaderMaterial
        vertexShader={retinaVertex}
        fragmentShader={retinaFragment}
        args={[{ uniforms: uniforms }]}
        side={THREE.BackSide}
      />
    </mesh>
  );
}
