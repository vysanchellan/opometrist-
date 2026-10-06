import { DAY_LONG, DAYS, fullAddress, practice, telHref, whatsappHref } from '@/config/practice';
import { Emph } from './MaskLines';
import { QualityToggle } from './QualityToggle';

function hoursRows() {
  // group consecutive days with identical hours: "Mon – Wed 08:30 – 17:00"
  const rows: { days: string; hours: string }[] = [];
  let i = 0;
  while (i < DAYS.length) {
    const d = DAYS[i]!;
    const h = practice.hours[d];
    let j = i;
    while (
      j + 1 < DAYS.length &&
      JSON.stringify(practice.hours[DAYS[j + 1]!]) === JSON.stringify(h)
    )
      j++;
    rows.push({
      days: i === j ? DAY_LONG[d] : `${d} – ${DAYS[j]}`,
      hours: h ? `${h[0]} – ${h[1]}` : 'Closed',
    });
    i = j + 1;
  }
  return rows;
}

/**
 * The footer is the bottom of an eye chart: a huge wordmark, lines that shrink as you read
 * down, and a last line small enough to make the point.
 */
export function Footer() {
  return (
    <footer className="bg-ink text-paper relative z-10 overflow-hidden" data-theme="ink">
      <div className="mx-auto max-w-[1600px] px-[var(--gutter)] pt-20 md:pt-28">
        <p
          data-focus-in
          className="font-display accent-em text-center text-[clamp(3.4rem,15vw,15rem)] leading-[0.85] tracking-[-0.03em]"
        >
          <span className="mask-line">
            <span>
              <Emph text={practice.tagline.replace(/(\w+)\.$/, '*$1.*')} />
            </span>
          </span>
        </p>

        <div className="mt-14 grid gap-12 text-center md:mt-20 md:grid-cols-3 md:text-left">
          <address className="not-italic">
            <p className="label text-paper/60">Visit</p>
            <p className="mt-3 text-[1.05rem] leading-relaxed">{fullAddress}</p>
            <p className="mt-2 flex flex-wrap justify-center gap-x-4 md:justify-start">
              <a
                href={telHref}
                className="focus-link inline-flex min-h-11 items-center"
                data-cursor="hover"
              >
                {practice.contact.phoneDisplay}
              </a>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-link inline-flex min-h-11 items-center"
                data-cursor="hover"
              >
                WhatsApp
              </a>
              <a
                href={`mailto:${practice.contact.email}`}
                className="focus-link inline-flex min-h-11 items-center break-all"
                data-cursor="hover"
              >
                Email
              </a>
            </p>
          </address>
          <div>
            <p className="label text-paper/60">Hours</p>
            <dl className="readout mx-auto mt-3 grid max-w-xs grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-left text-[0.8rem] md:mx-0">
              {hoursRows().map((r) => (
                <div key={r.days} className="contents">
                  <dt className="text-paper/60">{r.days}</dt>
                  <dd>{r.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="label text-paper/60">Elsewhere</p>
            <ul className="mt-2 flex flex-wrap justify-center gap-x-5 md:block">
              {practice.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-link text-paper/80 hover:text-paper inline-flex min-h-11 items-center"
                    data-cursor="hover"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* the last lines of the chart */}
        <div aria-label="Eye chart" className="mt-20 text-center md:mt-28">
          <p className="font-sans text-[1.15rem] font-extrabold tracking-[0.4em] uppercase opacity-90">
            {practice.name}
          </p>
          <p className="mt-2 font-sans text-[0.72rem] font-bold tracking-[0.42em] uppercase opacity-80">
            {practice.address.suburb} · {practice.address.city} · Est {practice.established}
          </p>
          <p className="mt-2 font-sans text-[0.5rem] font-bold tracking-[0.38em] uppercase opacity-70">
            {practice.scenes.footer.chartLine}
          </p>
        </div>
      </div>

      <div className="border-paper/10 text-paper/65 mx-auto mt-12 flex max-w-[1600px] flex-col gap-4 border-t px-[var(--gutter)] py-6 pb-28 text-xs md:flex-row md:items-center md:justify-between md:pb-6">
        <p className="label normal-case">
          © {new Date().getFullYear()} {practice.name} · No tracking, no ad cookies · Photography
          via Unsplash &amp; Pexels
        </p>
        <QualityToggle />
      </div>
    </footer>
  );
}
