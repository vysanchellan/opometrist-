'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { theme } from '@/config/theme';
import { damp, story } from '@/lib/story';
import { smoothstep } from './anatomy';

/** Camera rig: follows the master timeline, adds pointer parallax, velocity FOV kick and the ink → paper background shift. */
export function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const scene = useThree((s) => s.scene);
  const tmp = useMemo(
    () => ({
      look: new THREE.Vector3(),
      ink: new THREE.Color(theme.ink),
      paper: new THREE.Color(theme.paper),
      bg: new THREE.Color(theme.ink),
      vel: 0,
      px: 0,
      py: 0,
    }),
    [],
  );

  useEffect(() => {
    scene.background = tmp.bg;
    return () => {
      scene.background = null;
    };
  }, [scene, tmp]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const S = story;
    tmp.vel = damp(tmp.vel, Math.min(Math.abs(S.velocity), 120), 5, dt);
    tmp.px = damp(tmp.px, S.pointer.active ? S.pointer.x : S.tilt.x, 2.5, dt);
    tmp.py = damp(tmp.py, S.pointer.active ? S.pointer.y : S.tilt.y, 2.5, dt);
    const par = 1 - smoothstep(0.6, 1.4, S.t) + smoothstep(5.9, 6.2, S.t) * 0.5;
    camera.position.set(S.cam.x + tmp.px * 0.12 * par, S.cam.y + tmp.py * 0.08 * par, S.cam.z);
    tmp.look.set(S.look.x, S.look.y, S.look.z);
    camera.lookAt(tmp.look);
    const fov = S.fov + Math.min(tmp.vel * 0.03, 3);
    if (Math.abs(camera.fov - fov) > 1e-3) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    tmp.bg.copy(tmp.ink).lerp(tmp.paper, S.bgWarm);
    scene.environmentRotation.set(0, S.corneaEnvRot + tmp.px * 0.15, 0);
  });

  return null;
}
