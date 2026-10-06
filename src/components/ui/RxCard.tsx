import { practice } from '@/config/practice';
import { Emph } from './MaskLines';

/**
 * The Care Promise, written as a prescription: OD (right eye), OS (left eye), OU (both).
 * Paper slip, typed in mono, signed and stamped. The signature draws itself in view.
 */
export function RxCard() {
  const c = practice.scenes.care;
  const owner = practice.team[0];
  return (
    <article
      data-observe
      className="rx group text-ink relative mx-auto w-full max-w-[44rem] -rotate-[1.2deg] bg-[#fbf9f4] p-6 shadow-[0_1px_0_rgb(5_7_13/0.05),0_30px_80px_-30px_rgb(5_7_13/0.35)] md:p-11"
    >
      {/* perforation along the top edge */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 -top-[6px] h-3 bg-[radial-gradient(circle_at_6px_0,transparent_5px,#fbf9f4_5.5px)] bg-[length:16px_12px]"
      />
      <header className="flex items-start justify-between gap-6">
        <p
          className="font-display text-[4.5rem] leading-[0.7] italic md:text-[6rem]"
          aria-hidden="true"
        >
          R<span className="text-[0.6em]">x</span>
        </p>
        <dl className="label text-ink/70 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-right">
          <dt>Patient</dt>
          <dd className="text-ink">You</dd>
          <dt>Valid</dt>
          <dd className="text-ink">Every visit</dd>
          <dt>Prescriber</dt>
          <dd className="text-ink">{practice.name}</dd>
        </dl>
      </header>
      <h3 className="font-display mt-6 text-[1.6rem] leading-tight md:text-[2rem]">
        <Emph text={c.rxTitle} />
      </h3>
      <div className="ruler text-ink mt-5" aria-hidden="true" />
      <ol className="mt-2">
        {practice.carePromise.map((p) => (
          <li
            key={p.code}
            className="border-ink/12 grid grid-cols-[3.4rem_1fr] gap-4 border-b border-dashed py-6 last:border-0 md:grid-cols-[4.5rem_1fr]"
          >
            <span className="readout text-ink/80 pt-1 text-[1.1rem] md:text-[1.35rem]">
              {p.code}
              <span className="label text-ink/60 mt-1 block">
                {p.code === 'OD' ? 'right eye' : p.code === 'OS' ? 'left eye' : 'both eyes'}
              </span>
            </span>
            <div>
              <h4 className="font-display text-[1.55rem] leading-[1.02] md:text-[2rem]">
                {p.title}
              </h4>
              <p className="text-ink/70 mt-2 max-w-md text-[0.98rem]">{p.line}</p>
            </div>
          </li>
        ))}
      </ol>
      <footer className="mt-6 flex items-end justify-between gap-6">
        <div>
          <svg viewBox="0 0 220 70" className="h-14 w-48 overflow-visible" aria-hidden="true">
            <path
              className="rx-sign"
              d="M6 52c14-6 22-30 30-38 6-6 6 10 2 22-4 13 2 15 10 4 9-13 13-10 12 2-1 9 5 8 11-1 6-10 9-5 9 2 1 7 6 6 12-2 7-10 13-12 14-3 2 8 9 4 16-4 6-7 11-6 12 1 1 6 6 5 13-1 9-8 20-14 34-14"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
            />
          </svg>
          <p className="label text-ink/60 -mt-1">{owner?.name}</p>
        </div>
        <svg
          viewBox="0 0 120 120"
          className="text-hot size-24 shrink-0 rotate-[14deg] opacity-80 md:size-28"
          aria-hidden="true"
        >
          <defs>
            <path id="rx-stamp" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1 -88 0" />
          </defs>
          <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" strokeWidth="1" />
          <text
            fill="currentColor"
            fontSize="10.5"
            letterSpacing="2.2"
            fontFamily="var(--font-mono)"
          >
            <textPath href="#rx-stamp">
              {`${practice.shortName.toUpperCase()} · ${owner?.hpcsa ?? 'HPCSA'} · EST ${practice.established} ·`}
            </textPath>
          </text>
          <text
            x="60"
            y="66"
            textAnchor="middle"
            fill="currentColor"
            fontSize="17"
            fontStyle="italic"
            fontFamily="var(--font-serif-display)"
          >
            Cared
          </text>
        </svg>
      </footer>
    </article>
  );
}
