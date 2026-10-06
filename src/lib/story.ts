/**
 * The single mutable state object shared between the scroll choreography (GSAP)
 * and the 3D layer (R3F `useFrame`). Never put this in React state — it changes
 * every frame. Values and ranges are specified in docs/motion-spec.md.
 */
export type Vec3 = { x: number; y: number; z: number };

export type Story = {
  /** Scene time, 0–7 (one unit per scene). */
  t: number;
  cam: Vec3;
  look: Vec3;
  fov: number;
  /** Eye group transform. */
  eye: { rx: number; ry: number; scale: number };
  /** 0 = centred, 1 = docked into `dockNdc` (Book scene). */
  dock: number;
  dockNdc: { x: number; y: number };
  /** 0 closed – 1 open. Multiplied with intro + blink. */
  lids: number;
  /** 1 = eyelids present, 0 = retracted/hidden (inside the eye, Book scene). */
  lidsShow: number;
  /** Base pupil dilation 0–1 from scroll; light reaction is layered on top. */
  pupil: number;
  cornea: number;
  corneaEnvRot: number;
  sclera: number;
  irisPeel: number;
  irisGlow: number;
  lensFloat: number;
  lensBlur: number;
  lensSquash: number;
  lensSpin: number;
  lensOffset: { x: number; y: number };
  lensFade: number;
  vitreous: number;
  retina: number;
  /** Retinal scan line progress 0–1. */
  scan: number;
  nerve: number;
  /** 0 ink background – 1 warm paper background. */
  bgWarm: number;
  /** Chromatic aberration pulse 0–1 (scene transitions). */
  ca: number;
  /** Lenis velocity (px/frame), written by the scroll layer. */
  velocity: number;
  /** World-space point the depth of field focuses on. */
  focus: Vec3;
  /** Intro choreography (time based, not scroll). */
  intro: { lids: number; pupil: number; fade: number };
  /** Pointer in NDC (-1..1), y up. */
  pointer: { x: number; y: number; active: boolean };
  /** Device tilt for touch devices, -1..1. */
  tilt: { x: number; y: number; active: boolean };
  /** Whether the canvas is fully covered by an opaque section (pause rendering). */
  covered: boolean;
};

export const createStory = (): Story => ({
  t: 0,
  cam: { x: 0, y: 0, z: 5.2 },
  look: { x: 0, y: 0, z: 0 },
  fov: 35,
  eye: { rx: 0, ry: 0, scale: 1 },
  dock: 0,
  dockNdc: { x: 0.52, y: 0.05 },
  lids: 1,
  lidsShow: 1,
  pupil: 0.45,
  cornea: 1,
  corneaEnvRot: 0,
  sclera: 1,
  irisPeel: 0,
  irisGlow: 0,
  lensFloat: 0,
  lensBlur: 1,
  lensSquash: 0,
  lensSpin: 0,
  lensOffset: { x: 0, y: 0 },
  lensFade: 1,
  vitreous: 0,
  retina: 0,
  scan: 0,
  nerve: 0,
  bgWarm: 0,
  ca: 0,
  velocity: 0,
  focus: { x: 0, y: 0, z: 0.9 },
  intro: { lids: 0, pupil: 0.45, fade: 0 },
  pointer: { x: 0, y: 0, active: false },
  tilt: { x: 0, y: 0, active: false },
  covered: false,
});

export const story: Story = createStory();

/** Frame-rate independent exponential smoothing. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));
