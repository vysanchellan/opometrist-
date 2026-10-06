# Motion spec — the contract

> One idea: **the page is an eye, and scrolling is how you look inside it.**

This document is the contract between the scroll story (DOM) and the 3D layer. The
implementation lives in `src/lib/scrollTimeline.ts` (master timeline) and
`src/lib/story.ts` (the mutable state object every 3D part reads in `useFrame`).
If a value here changes, change it there, and vice versa.

## Coordinate system

- Eye radius = **1 world unit**, centred at the origin, looking down **+Z** (towards the camera).
- Limbus (iris edge) sits at `z = 0.875`, radius `0.485` (≈29° from the optical axis — real anatomy).
- Cornea: sphere cap, radius `0.62`, apex at `z = 1.109`.
- Lens: biconvex lathe, radius `0.35`, thickness `0.33`, rest position `z = 0.62`.
- Retina: inner back cap, radius `0.96`. Optic disc offset `(−0.18, 0.04)` (nasal). Macula at centre.
- Optic nerve leaves the back at the disc and runs to `z ≈ −3.4`.
- Default camera: `fov 35`. Hero composition: desktop `(-1.55, -0.05, 6.0)` (eye sits right of the headline), phones/portrait tablets `(0, -1.35, 8.4)` (eye above the headline). Book scene: `(0, 0, 5.2)`.

## Time base

The master timeline is authored in **scene time `t ∈ [0, 7]`** — one unit per scene.
Scroll is mapped to `t` piecewise-linearly through DOM anchors (`[data-t]`), so the
story stays in sync whatever height a section ends up on a given phone. Lenis smooths
the scroll; the timeline is additionally eased with a 0.5s `power3.out` catch-up so
fast flicks never snap.

| Anchor element         | `data-t` | Anchor point                |
| ---------------------- | -------- | --------------------------- |
| `#top` (Hero)          | 0        | page top                    |
| `#cornea`              | 1        | section top at viewport top |
| `#services` (Iris)     | 2        | ″                           |
| `#frames` (Lens)       | 3        | ″                           |
| `#difference` (slider) | 3.86     | ″                           |
| `#health` (Retina)     | 4        | ″                           |
| `#care` (Nerve → Care) | 5        | ″                           |
| `#care-content`        | 5.55     | ″                           |
| `#book`                | 6        | section top at 35% viewport |
| document end           | 7        | max scroll                  |

## Scene table

| #   | Scene (DOM)         | `t`          | Camera pos → look                         | fov   | Story uniforms (from → to)                                                                                    | Copy / overlay                                                                                                  |
| --- | ------------------- | ------------ | ----------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | **Open** (Hero)     | intro (time) | hero composition (see above)              | 35    | lids `0 → 0.06` (sliver, 0.3s) `→ 1` (1.2s, expo); pupil beat `0.45 → 0.8 → 0.3 → 0.45` at 2.0–3.4s           | Headline mask-reveal per line (1.1s, 0.12 stagger). CTAs visible on first paint. Scroll cue line draws at 3.2s. |
|     |                     | 0 → 1        | hero → `(0.28,0.12,2.7)` look `(0,0,0.9)` | 35    | eye rotY `0 → −0.18` (show cornea profile); lids stay 1                                                       | Hero copy fades/lifts out 0.55–0.9                                                                              |
| 2   | **Cornea**          | 1 → 1.8      | → `(0.08,0.02,1.95)`                      | 35→40 | cornea env rotation slides `0 → 0.9 rad`; annotation leader line draws 1.08–1.35                              | Label “Cornea”, one-liner “Comprehensive eye exams”, stroke-dashoffset leader line                              |
|     |                     | 1.8 → 1.95   | → `(0,0,1.7)`                             | 40→46 | cornea opacity `1 → 0`; **CA pulse** `0 → 1 → 0` peak 1.87; lids `1 → 0` hidden past 1.9                      | Annotation fades                                                                                                |
| 3   | **Iris** (services) | 2 → 2.15     | `(0,0,1.62)` look `(0,0,0.8)`             | 46    | irisGlow `0 → 0.6`; pupil `0.45 → 0.25`                                                                       | Kicker + headline reveal                                                                                        |
|     |                     | 2.15 → 2.75  |                                           | 46→52 | irisPeel `0 → 1` (aperture blades peel outward, tilt to camera, gap opens); lens glow behind `0 → 1`          | Cards emerge from the gaps at 2.3 / 2.42 / 2.54 (y 60 → 0, blur 8 → 0, opacity)                                 |
| 4   | **Lens** (frames)   | 3 → 3.15     | → `(0,0,1.12)` (dive into aperture)       | 52→58 | petals spread out of frame; sclera opacity `1 → 0.18`                                                         | —                                                                                                               |
|     |                     | 3.15 → 3.35  | → `(0,0,3.2)` look `(0,0,1.9)`            | 58→38 | lensFloat `0 → 1` (lens z `0.62 → 1.9`, x `→ 0.42` desktop / y `→ 0.32` mobile), rotates 0.6 rad              | “We bring your world into focus.”                                                                               |
|     |                     | 3.35 → 3.7   |                                           | 38    | **Signature 1 – Focus pull**: lensBlur `1 → 0`, lensSquash `0.22 → 0` (accommodation), dioptre `−2.75 → 0.00` | Snellen chart sharpens line by line (blur 14px → 0, staggered)                                                  |
|     |                     | 3.7 → 3.86   |                                           |       | lens slow spin                                                                                                | Frame photos drift as 3 parallax layers (speeds 0.6 / 1 / 1.4); 2 service cards                                 |
|     | **The difference**  | 3.86 → 4     | hold                                      |       | —                                                                                                             | **Signature 2 – See the difference** slider (drag/keyboard, not scrubbed)                                       |
| 5   | **Retina** (health) | 4 → 4.35     | → `(0,0,0.55)` look `(0,0,−1)`            | 38→62 | lensFloat `1 → 0`, lens fade; sclera / iris hidden inside; vitreous `0 → 1` (floaters drift)                  | —                                                                                                               |
|     |                     | 4.35 → 4.75  |                                           | 62    | retinaGlow `0 → 1`; pulse speed `0.15`; DOF focus on retina                                                   | 3 items + animated icons at 4.45 / 4.55 / 4.65                                                                  |
| 6   | **Nerve → Care**    | 5 → 5.45     | → `(1.35,0.55,−3.7)` look `(0,0,−1.3)`    | 62→40 | retina fade; sclera back; nerve `0 → 1` (signal pulses travel away from the eye); vitreous `1 → 0`            | “Every signal, followed through.”                                                                               |
|     |                     | 5.3 → 5.6    |                                           |       | bgWarm `0 → 1` (ink `#05070D` → paper `#F6F3EE`); canvas paused once covered                                  | Care Promise, photos, testimonials, medical aids (opaque paper section)                                         |
|     |                     | 5.6          | **cut (hidden)** → `(0,0,5.2)`            | 35    | reassemble: peel 0, cornea 1, lens home, nerve 0, retina 0, lids hidden                                       | —                                                                                                               |
| 7   | **Close** (Book)    | 6 → 7        | `(0,0,5.2)`                               | 35    | dock `0 → 1`: eye scale `0.5`, NDC `(0.52, 0.05)` desktop / `(0, 0.62)` mobile; idle spin + cursor tracking   | Booking card, contact, map facade                                                                               |

## Always-on behaviours

| Behaviour       | Rule                                                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blink           | Every 2.8–6.5s (random), 0.16s close / 0.22s open, ease `sine.inOut`. Occasional double-blink (15%). Only while lids are visible.                                         |
| Cursor tracking | Eye yaw/pitch follow pointer, max ±0.22 / ±0.16 rad, critically damped (λ = 4). Touch: device tilt if permitted, else slow Lissajous drift.                               |
| Light → pupil   | Pointer = light. Light near the optical axis → pupil constricts (to 0.18), away → dilates (to 0.7). Constrict λ = 6 (fast), dilate λ = 1.6 (slow) — biological asymmetry. |
| Scroll velocity | `v = lenis.velocity` → CA offset `+= min(                                                                                                                                 | v   | × 0.00004, 0.0025)`, fov kick `+min( | v   | × 0.02, 3)°`. Capped, decays with λ = 5. |
| Iris shimmer    | Fibre highlight band rotates at 0.07 rad/s, ±8% brightness.                                                                                                               |

## Quality tiers

| Tier   | DPR | Post-processing          | Geometry        | Shaders                  | Extras                                                 |
| ------ | --- | ------------------------ | --------------- | ------------------------ | ------------------------------------------------------ |
| High   | ≤ 2 | Bloom, CA, DOF, Vignette | 128 seg spheres | full fbm, 5 octaves      | HDRI env, transmission cornea                          |
| Medium | 1.5 | Bloom, CA, Vignette      | 96 seg          | 4 octaves                | HDRI env, transmission cornea                          |
| Low    | 1   | none (vignette in CSS)   | 48 seg          | 2 octaves, no crypt pass | Lightformer env only, alpha cornea, 400 → 120 floaters |

## v2 additions

| Moment              | `t`                     | What                                                                                                                                   |
| ------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Headline focus-pull | each scene's title time | chars: opacity 0, blur 14px, scale 1.22, ±0.09em red/cyan fringe → sharp, staggered from centre                                        |
| Read-outs           | title time −0.02        | ScrambleText decode, 0.14 units                                                                                                        |
| Iris aperture       | 1.95–2.7                | camera pulls back to z 2.25 so the whole aperture is in frame; blades swing on rim pins (−1.35 rad), clock-wipe stagger                |
| Trial lenses drop   | 2.32 / 2.42 / 2.52      | y −90, rotate −50°…, scale 0.72, blur 10 → seated (`back.out(1.6)`)                                                                    |
| Blink 1             | 3.99–4.18               | page lids close over the lens → vitreous dive                                                                                          |
| Retinal scan        | 4.42–4.76               | `story.scan` 0 → 1 (laser line + imaging grid), annotations lock on at 4.50 / 4.58 / 4.66                                              |
| Blink 2 (warm)      | 5.30–5.52               | lids close on the dark nerve, glow red (`--warm`), the background switches to paper while they're closed, then they open into daylight |

## Boot policy (performance contract)

| Step           | What happens                                                                                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First paint    | Server-rendered HTML + a poster that _is_ a render of the 3D eye (`hero-poster`). Hero text reveals with CSS keyframes (no JS needed — it is the LCP element).                    |
| Hydration      | Only React, the nav and tiny islands. GSAP, ScrollTrigger, Lenis and the timeline are `import()`ed after hydration.                                                               |
| 3D boot        | Desktop: first pointer move / wheel / key, or 3.5s idle. Touch & Save-Data: first touch / scroll only. The CSS iris loader shows while booting.                                   |
| Shader compile | `renderer.compileAsync` (KHR_parallel_shader_compile) before the first frame; `checkShaderErrors` off in production.                                                              |
| Runtime        | `PerformanceMonitor` only scales DPR and, as a last resort, drops post — it never rebuilds geometry or shaders. Rendering pauses while the opaque Care section covers the canvas. |
| Fallback       | Software rasterisers (SwiftShader/llvmpipe), WebGL errors or 15s without a frame → static mode (`?force3d` overrides for demos).                                                  |

## Reduced motion / no WebGL

- `prefers-reduced-motion: reduce` → `html[data-motion="reduced"]`: no Lenis, no master timeline, no
  intro choreography. Each section shows its poster image and fades in once. The eye still renders in
  the hero (idle, no camera moves).
- No WebGL → `html[data-webgl="off"]`: no canvas at all; hero shows the eye poster, every section is
  fully readable with static imagery.
