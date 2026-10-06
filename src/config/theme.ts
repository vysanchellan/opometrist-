/**
 * THEME — colours for both the CSS layer and the 3D shaders.
 * Re-theme the iris per client by changing `irisA` / `irisB`; everything
 * (iris shader, accents, cursor, loader, gradients) follows.
 */
export const theme = {
  ink: '#05070D', // cinematic scenes
  inkSoft: '#0C111C',
  paper: '#F6F3EE', // content scenes
  paperDeep: '#ECE6DC',
  /**
   * Iris: three-stop hazel — gold collarette (A) → warm brown body (C) → deep sea-green rim (B).
   * Brown/hazel is the most common iris in KZN; re-theme per client here.
   */
  irisA: '#E2A548', // gold
  irisC: '#6E4426', // hazel brown
  irisB: '#2F8C7D', // sea green
  /** Small hot accent, CTAs only. Text on it is ink (AA contrast). */
  hot: '#FF6A3D',
  /** Retina / nerve signal colour. */
  signal: '#FFB067',
  sclera: '#F3EEE6',
} as const;

export type Theme = typeof theme;

/** CSS custom properties injected into :root by the root layout. */
export const themeCssVars = (t: Theme = theme) =>
  `:root{--ink:${t.ink};--ink-soft:${t.inkSoft};--paper:${t.paper};--paper-deep:${t.paperDeep};--iris-a:${t.irisA};--iris-b:${t.irisB};--iris-c:${t.irisC};--hot:${t.hot};--signal:${t.signal};--sclera:${t.sclera};}`;
