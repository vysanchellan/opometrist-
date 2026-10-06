const ROWS: [string, string][] = [
  ['E', '20/200'],
  ['F P', '20/100'],
  ['T O Z', '20/70'],
  ['L P E D', '20/50'],
  ['P E C F D', '20/40'],
  ['E D F C Z P', '20/30'],
  ['F E L O P Z D', '20/20'],
];

/**
 * Signature moment 1 — the focus pull. Real text (readable by screen readers and search),
 * blurred by the master timeline and sharpened line by line as you scroll, while a
 * dioptre readout counts down to zero.
 */
export function SnellenChart() {
  return (
    <figure className="relative select-none" aria-label="An eye chart coming into focus">
      <div className="border-paper/15 flex items-baseline justify-between gap-6 border-b pb-3">
        <span className="label text-paper/65">Lens power</span>
        <span
          className="font-display text-paper text-[2rem] leading-none tabular-nums md:text-[2.6rem]"
          data-anim="dioptre"
        >
          0.00 D
        </span>
      </div>
      <ol
        className="text-paper mt-4 space-y-[0.35em] text-center font-sans font-semibold"
        aria-hidden="true"
      >
        {ROWS.map(([letters, acuity], i) => (
          <li
            key={acuity}
            data-anim="snellen-line"
            className="relative flex items-center justify-center leading-none tracking-[0.32em]"
            style={{
              fontSize: `clamp(0.9rem, ${(7.2 - i * 0.92).toFixed(2)}vmin, ${(5.4 - i * 0.68).toFixed(2)}rem)`,
            }}
          >
            {letters}
            <span className="label text-paper/65 absolute right-0 hidden text-[0.6rem] font-normal tracking-[0.2em] md:block">
              {acuity}
            </span>
          </li>
        ))}
      </ol>
      <figcaption className="sr-only">
        A Snellen eye chart, from the large letter E (20/200) down to the 20/20 line.
      </figcaption>
    </figure>
  );
}
