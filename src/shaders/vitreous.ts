/** Vitreous floaters: soft points drifting slowly inside the eye. */
export const floaterVertex = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
varying float vSeed;
void main(){
  vSeed = aSeed;
  vec3 p = position;
  float t = uTime * (0.05 + aSeed * 0.05);
  p += vec3(sin(t + aSeed * 40.0), cos(t * 1.3 + aSeed * 17.0), sin(t * 0.7 + aSeed * 9.0)) * 0.05;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * uPixelRatio * (0.4 + aSeed) / max(-mv.z, 0.05);
  gl_Position = projectionMatrix * mv;
}
`;

export const floaterFragment = /* glsl */ `
uniform float uOpacity;
uniform vec3 uColor;
varying float vSeed;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  float ring = smoothstep(0.5, 0.35, d) * smoothstep(0.2, 0.35, d) * 0.4;
  gl_FragColor = vec4(uColor, (a * 0.5 + ring) * uOpacity * (0.35 + 0.65 * vSeed));
}
`;
