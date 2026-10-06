import { noiseGLSL } from './noise';

/**
 * Retina: interior back cap of the eye, seen from inside. The vessel tree is a
 * procedurally generated canvas (see lib/textures.ts): R = vessel mask,
 * G = normalised distance along the tree (drives the travelling pulse and the
 * progressive "light-up" from the optic disc), B = vessel calibre.
 */
export const retinaVertex = /* glsl */ `
uniform float uRadius;
varying vec2 vUv2;
void main(){
  vUv2 = position.xy / uRadius;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const retinaFragment = /* glsl */ `
${noiseGLSL}
uniform sampler2D uVeins;
uniform float uTime;
uniform float uReveal;
uniform vec3 uSignal;
uniform vec3 uAccent;
uniform vec2 uDisc;
uniform vec2 uMacula;
uniform int uOctaves;
uniform float uScan;
varying vec2 vUv2;
void main(){
  vec2 uv = vUv2;
  vec4 v = texture2D(uVeins, uv * 0.5 + 0.5);
  float vessel = v.r;
  float dist = v.g;
  float calibre = v.b;

  float rad = length(uv);
  float n = fbm(vec3(uv * 6.0, 2.0), uOctaves);
  vec3 base = mix(vec3(0.42, 0.07, 0.03), vec3(0.85, 0.32, 0.08), smoothstep(1.0, 0.0, rad) * 0.8 + n * 0.08);
  base *= (0.85 + 0.25 * n) * 1.15;

  // macula + foveal reflex
  float dm = length(uv - uMacula);
  base *= 1.0 - 0.65 * exp(-dm * dm / 0.012);
  base += vec3(1.0, 0.9, 0.7) * exp(-dm * dm / 0.00005) * 1.4;

  // optic disc with cup
  float dd = length((uv - uDisc) * vec2(1.0, 0.88));
  float disc = 1.0 - smoothstep(0.075, 0.09, dd);
  float cup = 1.0 - smoothstep(0.02, 0.045, dd);
  base = mix(base, vec3(1.0, 0.78, 0.48), disc);
  base = mix(base, vec3(1.0, 0.95, 0.85), cup * 0.8);

  // reveal sweeps out from the disc along the vessel tree
  float front = uReveal * 1.25;
  float lit = 1.0 - smoothstep(front - 0.12, front, dist);

  vec3 vesselCol = mix(vec3(0.38, 0.02, 0.02), vec3(0.62, 0.05, 0.03), calibre);
  vec3 col = mix(base, vesselCol, vessel * 0.9);
  float glow = vessel * lit;
  col += glow * uSignal * 1.3;

  // pulse travelling outward along the tree
  float ph = fract(dist * 1.6 - uTime * 0.22);
  float pulse = smoothstep(0.0, 0.03, ph) * (1.0 - smoothstep(0.03, 0.16, ph));
  col += vessel * lit * pulse * (uSignal * 2.6 + uAccent * 0.8);

  // the reveal front itself flares
  float flare = exp(-pow((dist - front + 0.04) / 0.035, 2.0)) * vessel * step(0.001, uReveal) * (1.0 - step(0.999, uReveal));
  col += flare * uSignal * 3.0;

  // retinal scan: a laser line sweeps top → bottom; scanned area gets an imaging grid
  if (uScan > 0.001 && uScan < 0.999) {
    float ly = mix(1.05, -1.05, uScan);
    float dl = uv.y - ly;
    float line = exp(-dl * dl / 0.00012);
    float trail = smoothstep(0.0, 0.35, dl) * (1.0 - smoothstep(0.35, 0.9, dl));
    vec2 gp = abs(fract(uv * 14.0) - 0.5);
    float grid = (1.0 - smoothstep(0.0, 0.02, min(gp.x, gp.y))) * step(0.0, dl);
    vec3 cyan = vec3(0.35, 0.95, 1.0);
    col += cyan * line * 2.2 + cyan * grid * 0.05 + cyan * trail * vessel * 0.25;
  }
  float edge = 1.0 - smoothstep(0.85, 1.02, rad);
  col *= edge * (0.08 + 0.92 * uReveal);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
