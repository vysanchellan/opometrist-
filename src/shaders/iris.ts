import { noiseGLSL } from './noise';

/**
 * Iris: one merged ring geometry split into `uPetals` aperture blades (aPetal attribute).
 * The pattern is computed from the *original* position so it stays glued to each blade while
 * the vertex shader opens the blades like a real camera iris: every blade swings about a pin
 * on the outer ring, one after another (clock-wipe), and lifts a hair toward the camera.
 */
export const irisVertex = /* glsl */ `
attribute float aPetal;
uniform float uPeel;
uniform float uPetals;
uniform float uOuter;
varying vec2 vPos;
varying float vEdge;
varying float vSide;
varying float vPeelI;
void main(){
  vec3 p = position;
  vPos = p.xy;
  float r = length(p.xy);
  float a = atan(p.y, p.x);
  float seg = 6.28318530718 / uPetals;
  float ac = (aPetal + 0.5) * seg;
  float d = mod(a - ac + 3.14159265, 6.28318530718) - 3.14159265;
  vEdge = 1.0 - abs(d) / (seg * 0.5);
  vSide = d / (seg * 0.5);

  float order = aPetal / uPetals;
  float pk = clamp(uPeel * 1.7 - order * 0.7, 0.0, 1.0);
  pk = pk * pk * (3.0 - 2.0 * pk);
  vPeelI = pk;

  // aperture mechanics: swing about a pin on the rim
  float pinA = (aPetal + 1.0) * seg;
  vec2 pin = vec2(cos(pinA), sin(pinA)) * uOuter * 1.04;
  float th = -pk * 1.35;
  vec2 dd = p.xy - pin;
  vec2 q = pin + vec2(dd.x * cos(th) - dd.y * sin(th), dd.x * sin(th) + dd.y * cos(th));
  q += vec2(cos(ac), sin(ac)) * pk * pk * 0.28 * uOuter;
  float z = pk * (0.03 + 0.07 * (1.0 - r / uOuter)) + aPetal * 0.0007 * pk;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(q, z, 1.0);
}
`;

export const irisFragment = /* glsl */ `
${noiseGLSL}
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uPupil;
uniform float uOuter;
uniform float uTime;
uniform float uGlow;
uniform float uPeel;
uniform float uOpacity;
uniform int uOctaves;
uniform vec3 uLight;
varying vec2 vPos;
varying float vEdge;
varying float vSide;
varying float vPeelI;
void main(){
  float r = length(vPos);
  float a = atan(vPos.y, vPos.x);
  vec2 dir = vec2(cos(a), sin(a));
  float pr = uPupil;
  float t = clamp((r - pr) / (uOuter - pr), 0.0, 1.0);
  float pupilMask = smoothstep(pr - 0.003, pr + 0.003, r);
  if (uPeel > 0.02 && pupilMask < 0.5) discard;

  // domain-warped radial fibres (stroma), three frequencies
  float warp = snoise(vec3(dir * 5.0, t * 2.5)) * 0.7;
  float f1 = snoise(vec3(dir * 34.0, t * 2.4 + warp));
  float f2 = snoise(vec3(dir * 96.0, t * 6.0 + warp * 2.0 + 3.0));
  float f3 = snoise(vec3(dir * 190.0, t * 12.0 + 9.0));
  float fb = fbm(vec3(dir * 4.0, t * 1.6 + 11.0), uOctaves);
  float fib = clamp(0.5 + 0.5 * (0.55 * f1 + 0.3 * f2 + 0.15 * f3), 0.0, 1.0);

  // three-stop hazel: gold (pupillary) → warm brown (body) → sea-green (rim)
  float g1 = smoothstep(0.06, 0.46, t + f1 * 0.07 + fb * 0.05);
  float g2 = smoothstep(0.58, 0.97, t + fb * 0.14);
  vec3 col = mix(uColorA, uColorC, g1);
  col = mix(col, uColorB, g2 * 0.8);
  col *= 0.42 + 0.9 * fib;

  // gold flecks scattered through the ciliary zone
  float fl = smoothstep(0.72, 0.92, snoise(vec3(dir * 38.0, t * 13.0 + 20.0)));
  col = mix(col, uColorA * 1.25, fl * 0.55 * smoothstep(0.32, 0.55, t) * (1.0 - smoothstep(0.82, 0.95, t)));

  // collarette — the jagged ring between the pupillary and ciliary zones
  float cr = 0.3 + 0.055 * snoise(vec3(dir * 5.0, 1.3));
  float coll = exp(-pow((t - cr) / 0.03, 2.0));
  col = mix(col, uColorA * 1.25 + 0.02, coll * 0.42);
  col *= mix(0.68, 1.0, smoothstep(0.0, cr, t));

  // crypts of Fuchs (elongated, radial) + contraction furrows
  float cz = smoothstep(cr + 0.04, cr + 0.14, t) * (1.0 - smoothstep(0.78, 0.92, t));
  float crypt = smoothstep(0.42, 0.9, snoise(vec3(dir * 22.0, t * 2.2 + 7.0)));
  col *= 1.0 - crypt * cz * 0.55;
  float fur = smoothstep(0.86, 1.0, sin(t * 38.0 + snoise(vec3(dir * 4.0, 0.0)) * 2.0)) * smoothstep(0.55, 0.75, t);
  col *= 1.0 - fur * 0.24;

  // pupillary ruff + soft deep limbal ring
  col = mix(col, vec3(0.06, 0.03, 0.02), (1.0 - smoothstep(0.0, 0.045, t)) * 0.9);
  float limb = smoothstep(0.78, 1.0, t);
  col = mix(col, vec3(0.03, 0.05, 0.06), limb * 0.86);

  // relief lighting from the fibres
  vec3 n = normalize(vec3(dir * (f1 * 0.4 + f2 * 0.15), 1.0));
  col *= 0.68 + 0.5 * max(dot(n, normalize(uLight)), 0.0);

  // living shimmer: a slow sheen sweeping around + sparkles
  float band = pow(0.5 + 0.5 * cos(a * 2.0 - uTime * 0.35), 6.0);
  col += uColorA * band * fib * fib * 0.09 * (1.0 - limb);
  float spark = pow(max(f2, 0.0), 7.0) * (0.5 + 0.5 * sin(uTime * 1.7 + a * 23.0));
  col += spark * 0.14 * uColorA;

  // scene glow (feeds bloom), kept restrained
  col += uGlow * (uColorA * 0.55 * fib * fib + uColorA * 0.25 * coll) * (1.0 - limb * 0.8);

  // aperture blades: each reads as a separate leaf, with a dark leading edge and a lit trailing edge
  if (vPeelI > 0.001) {
    col *= mix(1.0, 0.55 + 0.45 * smoothstep(-1.0, 0.4, -vSide), vPeelI);
    float edge = 1.0 - smoothstep(0.0, 0.06, vEdge);
    col += edge * vPeelI * uColorA * 0.9 * step(0.0, vSide);
    col *= mix(1.0, 0.25, edge * vPeelI * step(vSide, 0.0));
  }
  if (!gl_FrontFacing) col = vec3(0.025, 0.02, 0.02) + col * 0.08;

  col = mix(vec3(0.004), col, pupilMask);
  gl_FragColor = vec4(col, uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
