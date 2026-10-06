'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { theme } from '@/config/theme';
import { focusFragment, glowFragment, glowVertex } from '@/shaders/glow';
import { story } from '@/lib/story';
import { makeFocusTexture } from '@/lib/textures';
import { LENS_FLOAT_Z, LENS_R, LENS_Z, lerp } from './anatomy';

/** Biconvex lens profile (posterior surface more curved, like the real crystalline lens). */
function lensGeometry(segments: number) {
  const pts: THREE.Vector2[] = [];
  const n = 48;
  const front = 0.14;
  const back = 0.19;
  for (let i = 0; i <= n; i++) {
    const r = (i / n) * LENS_R;
    pts.push(new THREE.Vector2(r, front * Math.pow(1 - (r / LENS_R) ** 2, 0.85)));
  }
  for (let i = n - 1; i >= 0; i--) {
    const r = (i / n) * LENS_R;
    pts.push(new THREE.Vector2(r, -back * Math.pow(1 - (r / LENS_R) ** 2, 0.85)));
  }
  const g = new THREE.LatheGeometry(pts, segments);
  g.rotateX(Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

/**
 * Lens: rests behind the iris, then separates and floats towards the camera (Scene 4).
 * Its transmission roughness *is* the focus: blur → sharp as the focus pull scrubs.
 */
export function Lens({ segments, transmission }: { segments: number; transmission: boolean }) {
  const group = useRef<THREE.Group>(null);
  const lens = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const glow = useRef<THREE.Mesh>(null);
  const card = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => lensGeometry(segments), [segments]);
  const focusMap = useMemo(() => makeFocusTexture(1024, theme.paper), []);
  useEffect(() => () => (geo.dispose(), focusMap.dispose()), [geo, focusMap]);

  const glowUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(theme.signal) }, uIntensity: { value: 0 } }),
    [],
  );
  const cardUniforms = useMemo(
    () => ({
      uMap: { value: focusMap },
      uBlur: { value: 1 },
      uOpacity: { value: 0 },
      uBg: { value: new THREE.Color(theme.ink) },
      uInk: { value: new THREE.Color(theme.paper) },
    }),
    [focusMap],
  );

  useFrame((state) => {
    const S = story;
    const g = group.current;
    if (!g || !lens.current || !mat.current) return;
    const f = S.lensFloat;
    const time = state.clock.elapsedTime;
    g.position.set(
      S.lensOffset.x * f,
      S.lensOffset.y * f + Math.sin(time * 0.8) * 0.015 * f,
      lerp(LENS_Z, LENS_FLOAT_Z, f),
    );
    lens.current.rotation.set(
      Math.sin(S.lensSpin) * 0.25 + Math.sin(time * 0.5) * 0.05 * f,
      Math.sin(S.lensSpin * 1.3) * 0.55,
      0,
    );
    const sq = S.lensSquash;
    const k = lerp(1, 0.62, f);
    lens.current.scale.set(k * (1 + sq * 0.12), k * (1 + sq * 0.12), k * (1 - sq * 0.9));
    const vis = S.lensFade;
    lens.current.visible = vis > 0.01;
    const m = mat.current;
    m.roughness = lerp(0.04, 0.55, S.lensBlur * f);
    if (transmission) m.transmission = vis;
    else m.opacity = 0.32 * vis;
    m.envMapIntensity = 1.6 * vis;

    glowUniforms.uIntensity.value = S.irisPeel * (1 - f) * vis * 1.4;
    if (glow.current) glow.current.visible = glowUniforms.uIntensity.value > 0.005;

    cardUniforms.uBlur.value = S.lensBlur;
    // the card is opaque (for refraction) — only show it once the eye body has faded away
    cardUniforms.uOpacity.value = Math.max(0, (f - 0.6) / 0.4) * (1 - S.sclera) * vis * 0.9;
    if (card.current) {
      card.current.visible = cardUniforms.uOpacity.value > 0.01 && S.sclera < 0.01;
      card.current.position.set(S.lensOffset.x * f, S.lensOffset.y * f, lerp(LENS_Z, 1.15, f));
      card.current.scale.setScalar(state.size.width < state.size.height ? 0.62 : 1);
    }
  });

  return (
    <>
      <group ref={group}>
        <mesh ref={lens} geometry={geo} renderOrder={4}>
          {transmission ? (
            <meshPhysicalMaterial
              ref={mat}
              transmission={1}
              thickness={0.4}
              ior={1.42}
              roughness={0.5}
              iridescence={0.55}
              iridescenceIOR={1.3}
              iridescenceThicknessRange={[180, 520]}
              attenuationColor="#ffe2b8"
              attenuationDistance={1.6}
              clearcoat={1}
              clearcoatRoughness={0.05}
              envMapIntensity={1.6}
            />
          ) : (
            <meshPhysicalMaterial
              ref={mat}
              color="#cfe9ff"
              transparent
              opacity={0.32}
              roughness={0.1}
              iridescence={0.6}
              clearcoat={1}
              envMapIntensity={1.6}
              depthWrite={false}
            />
          )}
        </mesh>
        <mesh ref={glow} position={[0, 0, -0.08]} renderOrder={1}>
          <planeGeometry args={[1.4, 1.4]} />
          <shaderMaterial
            vertexShader={glowVertex}
            fragmentShader={glowFragment}
            args={[{ uniforms: glowUniforms }]}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
      <mesh ref={card} renderOrder={2}>
        <planeGeometry args={[0.85, 0.85]} />
        <shaderMaterial
          vertexShader={glowVertex}
          fragmentShader={focusFragment}
          args={[{ uniforms: cardUniforms }]}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}
