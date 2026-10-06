'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { theme } from '@/config/theme';
import { story } from '@/lib/story';
import { LID_R } from './anatomy';

const lidVertex = /* glsl */ `
uniform float uR;
varying float vY;
varying vec3 vN;
varying vec3 vV;
void main(){
  vY = position.y / uR;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const lidFragment = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uRim;
uniform vec3 uMargin;
uniform float uMarginGlow;
uniform float uSide;
varying float vY;
varying vec3 vN;
varying vec3 vV;
void main(){
  // s > 0: the lid itself; s < 0: a soft "skirt" past the lid margin that lays a contact
  // shadow onto the eyeball (ambient occlusion), so the eye sits *in* its lids
  float s = vY * uSide;
  float m = exp(-abs(s) / 0.012);
  if (s < 0.0) {
    float a = (1.0 - smoothstep(0.0, 0.14, -s)) * 0.82;
    vec3 sh = mix(vec3(0.0), uMargin * 0.25, m * uMarginGlow);
    gl_FragColor = vec4(sh, a);
  } else {
    vec3 col = uBase + uMargin * m * uMarginGlow;
    gl_FragColor = vec4(col, 1.0);
  }
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

const easeInOut = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)));

/** Eyelids: two shells that part to open the eye, with natural, randomised blinking. */
export function Lids({ segments }: { segments: number }) {
  const upper = useRef<THREE.Mesh>(null);
  const lower = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const blink = useRef({ next: 3.2, start: -10, double: false });

  const [upperGeo, lowerGeo] = useMemo(() => {
    const s = Math.max(32, segments / 2);
    return [
      // each shell runs 0.2 rad past the margin for the contact-shadow skirt
      new THREE.SphereGeometry(LID_R, s, s / 2 + 6, 0, Math.PI * 2, 0, Math.PI / 2 + 0.2),
      new THREE.SphereGeometry(
        LID_R,
        s,
        s / 2 + 6,
        0,
        Math.PI * 2,
        Math.PI / 2 - 0.2,
        Math.PI / 2 + 0.2,
      ),
    ];
  }, [segments]);
  useEffect(() => () => (upperGeo.dispose(), lowerGeo.dispose()), [upperGeo, lowerGeo]);

  const uniforms = useMemo(
    () => ({
      uR: { value: LID_R },
      uBase: { value: new THREE.Color(theme.ink) },
      uRim: { value: new THREE.Color(theme.irisB) },
      uMargin: { value: new THREE.Color(theme.signal) },
      uMarginGlow: { value: 0.25 },
    }),
    [],
  );
  const upperU = useMemo(() => ({ ...uniforms, uSide: { value: 1 } }), [uniforms]);
  const lowerU = useMemo(() => ({ ...uniforms, uSide: { value: -1 } }), [uniforms]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const b = blink.current;
    const introDone = story.intro.lids > 0.98;
    if (introDone && time > b.next) {
      b.start = time;
      b.double = Math.random() < 0.15;
      b.next = time + 2.8 + Math.random() * 3.7 + (b.double ? 0.45 : 0);
    }
    const dt = time - b.start;
    const one = (x: number) =>
      x < 0.16 ? easeInOut(x / 0.16) : x < 0.38 ? 1 - easeInOut((x - 0.16) / 0.22) : 0;
    const closed = Math.max(one(dt), b.double ? one(dt - 0.42) : 0);

    const open = story.intro.lids * story.lids * (1 - closed) + (1 - story.lidsShow) * 2.2;
    if (upper.current) upper.current.rotation.x = -open * 0.43;
    if (lower.current) lower.current.rotation.x = open * 0.36;
    uniforms.uMarginGlow.value = 0.06 + 0.6 * (1 - Math.min(1, story.intro.lids * 3));
    if (group.current) group.current.visible = story.lidsShow > 0.01;
  });

  return (
    <group ref={group}>
      <mesh ref={upper} geometry={upperGeo} renderOrder={9}>
        <shaderMaterial
          vertexShader={lidVertex}
          fragmentShader={lidFragment}
          args={[{ uniforms: upperU }]}
          side={THREE.DoubleSide}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh ref={lower} geometry={lowerGeo} renderOrder={9}>
        <shaderMaterial
          vertexShader={lidVertex}
          fragmentShader={lidFragment}
          args={[{ uniforms: lowerU }]}
          side={THREE.DoubleSide}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
