/** Anatomical constants in eye-radius units (see docs/motion-spec.md). */
export const LIMBUS_R = 0.485;
export const LIMBUS_THETA = Math.asin(LIMBUS_R); // ≈ 29°
export const LIMBUS_Z = Math.cos(LIMBUS_THETA); // ≈ 0.875
export const CORNEA_R = 0.62;
export const CORNEA_THETA = Math.asin(LIMBUS_R / CORNEA_R);
export const CORNEA_CZ = LIMBUS_Z - Math.sqrt(CORNEA_R ** 2 - LIMBUS_R ** 2);
export const IRIS_Z = LIMBUS_Z - 0.012;
export const LENS_Z = 0.62;
export const LENS_R = 0.35;
export const LENS_FLOAT_Z = 1.9;
export const RETINA_R = 0.965;
export const LID_R = 1.13;
export const PETALS = 12;

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
