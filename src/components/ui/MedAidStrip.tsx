import { practice } from '@/config/practice';

const ACUITY = ['20/200', '20/100', '20/70', '20/50', '20/40', '20/30', '20/20'];

/**
 * Medical aids set as an eye chart: each scheme a line, shrinking down the chart.
 * Names only (no logos) to respect trademarks. Lines focus in one by one.
 */
export function MedAidStrip() {
  const schemes = practice.medicalAid.schemes;
  return (
    <div className="grid gap-10 md:grid-cols-[1fr_1.3fr] md:items-center">
      <div>
        <h3 className="font-display text-[2.2rem] leading-[0.95] md:text-[3.2rem]">
          Medical aid? <em>We read the fine print.</em>
        </h3>
        <p className="text-ink/70 mt-4 max-w-md text-[1.02rem] leading-snug">
          {practice.medicalAid.line}
        </p>
      </div>
      <figure
        data-focus-in
        className="bg-[#fbf9f4] px-6 py-8 text-center shadow-[0_30px_80px_-40px_rgb(5_7_13/0.4)] md:px-10"
        aria-label="Medical aids we assist with"
      >
        <ul>
          {schemes.map((s, i) => (
            <li
              key={s}
              className="mask-line relative font-sans leading-[1.15] font-extrabold tracking-[0.18em] uppercase"
              style={{
                fontSize: `clamp(0.9rem, ${(4.6 - i * 0.62).toFixed(2)}vw, ${(3.3 - i * 0.45).toFixed(2)}rem)`,
              }}
            >
              <span>{s}</span>
              <span
                aria-hidden="true"
                className="label text-ink/45 absolute top-1/2 right-0 hidden -translate-y-1/2 text-[0.55rem] tracking-[0.1em] sm:block"
              >
                {ACUITY[i]}
              </span>
            </li>
          ))}
        </ul>
        <figcaption className="label text-ink/60 mt-5">+ most other schemes</figcaption>
      </figure>
    </div>
  );
}
