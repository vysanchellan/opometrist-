/**
 * The page blinks between chapters. Two eyelids sweep closed over everything (scrubbed by the
 * master timeline via `--blink`), and on the last blink they glow warm red — daylight through
 * closed lids — before opening onto the paper-white care section.
 */
export function BlinkOverlay() {
  const lid = 'color-mix(in oklab, #5c170a calc(var(--warm, 0) * 100%), var(--ink))';
  return (
    <div
      aria-hidden="true"
      data-anim="blink"
      className="cine-only"
      style={{ ['--blink' as string]: 0, ['--warm' as string]: 0 }}
    >
      <div
        className="blink-lid top"
        style={{
          background: `linear-gradient(180deg, var(--ink) 35%, ${lid} 92%, color-mix(in oklab, #ff7a3d calc(var(--warm, 0) * 60%), ${lid}))`,
          boxShadow: '0 14px 40px rgb(0 0 0 / 0.5)',
        }}
      />
      <div
        className="blink-lid bottom"
        style={{
          background: `linear-gradient(0deg, var(--ink) 35%, ${lid} 92%, color-mix(in oklab, #ff7a3d calc(var(--warm, 0) * 60%), ${lid}))`,
          boxShadow: '0 -14px 40px rgb(0 0 0 / 0.5)',
        }}
      />
    </div>
  );
}
