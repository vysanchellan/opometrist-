/** Soft radial glow sprite (lens glow behind the opening iris). */
export const glowVertex = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
export const glowFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying vec2 vUv;
void main(){
  float d = length(vUv - 0.5) * 2.0;
  float a = pow(max(1.0 - d, 0.0), 2.4);
  gl_FragColor = vec4(uColor * a * uIntensity, a * uIntensity);
}
`;

/**
 * Focus card behind the floating lens: blur → sharp via mip bias. Rendered OPAQUE on the
 * exact background colour so the lens's transmission pass can refract it.
 */
export const focusFragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uBlur;
uniform float uOpacity;
uniform vec3 uBg;
uniform vec3 uInk;
varying vec2 vUv;
void main(){
  float a = texture2D(uMap, vUv, uBlur * 5.0).a;
  float a2 = texture2D(uMap, vUv + vec2(uBlur * 0.014, 0.0), uBlur * 5.5).a;
  a = mix(a, (a + a2) * 0.5, uBlur);
  vec3 col = mix(uBg, uInk, a * uOpacity);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;
