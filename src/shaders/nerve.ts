/** Optic nerve: translucent sheath + fibre strands with signal pulses travelling away from the eye. */
export const nerveVertex = /* glsl */ `
attribute float aPhase;
varying vec2 vUv;
varying float vPhase;
varying vec3 vN;
varying vec3 vV;
void main(){
  vUv = uv;
  vPhase = aPhase;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

export const nerveFibreFragment = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform vec3 uSignal;
uniform vec3 uBase;
varying vec2 vUv;
varying float vPhase;
void main(){
  float ph = fract(vUv.x * 2.2 - uTime * 0.45 + vPhase);
  float pulse = smoothstep(0.0, 0.02, ph) * (1.0 - smoothstep(0.02, 0.12, ph));
  float fade = smoothstep(0.0, 0.06, vUv.x) * (1.0 - smoothstep(0.75, 1.0, vUv.x));
  vec3 col = uBase * 0.9 + uSignal * pulse * 4.0;
  gl_FragColor = vec4(col * fade * uIntensity, fade * uIntensity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const nerveSheathFragment = /* glsl */ `
uniform float uIntensity;
uniform vec3 uTint;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main(){
  float fr = pow(1.0 - abs(dot(vN, vV)), 2.2);
  float fade = smoothstep(0.0, 0.05, vUv.x) * (1.0 - smoothstep(0.7, 1.0, vUv.x));
  float a = (0.14 + fr * 0.75) * fade * uIntensity;
  gl_FragColor = vec4(uTint * (0.35 + fr), a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
