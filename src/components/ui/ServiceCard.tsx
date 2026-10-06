import { Emph } from './MaskLines';
import { Icon, type IconName } from './Icon';

type Props = {
  title: string;
  line: string;
  icon: IconName;
  index?: number;
  tone?: 'dark' | 'light';
  anim?: string;
  className?: string;
  /** `auto`: compact row on phones, full round trial lens from md. `row`: always compact. */
  variant?: 'auto' | 'row';
};

/** Decorative powers stamped on each trial-lens handle (aria-hidden). */
const POWERS = ['+0.25', '−0.75', '+1.50', '−2.00', '+0.50', '−1.25'];

/** The steel rim + tinted glass of an optometrist's trial lens. */
function LensBody({ big }: { big: boolean }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`glass absolute inset-[3px] rounded-full ${big ? 'transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.015]' : ''}`}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full p-[3px] [background:conic-gradient(from_140deg,#5d6066,#d9dadc,#7a7d83,#f4f4f2,#6b6e74,#c9cacc,#5d6066)] [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-[4px] rounded-full bg-[radial-gradient(120%_90%_at_30%_18%,rgb(255_255_255/0.16),transparent_42%),radial-gradient(80%_80%_at_72%_88%,color-mix(in_oklab,var(--iris-b)_24%,transparent),transparent_70%)] transition-transform duration-1000 ease-[var(--ease-out-expo)] group-hover:rotate-[24deg]"
      />
    </>
  );
}

/**
 * A service, presented as a trial lens from the optometrist's kit: steel rim, tinted glass
 * and a handle tab stamped with a (decorative) power. Title + one line + tiny icon.
 */
export function ServiceCard({
  title,
  line,
  icon,
  index = 0,
  tone = 'dark',
  anim,
  className = '',
  variant = 'auto',
}: Props) {
  const dark = tone === 'dark';
  const power = POWERS[index % POWERS.length];
  const auto = variant === 'auto';
  const md = (cls: string) => (auto ? cls : '');

  return (
    <article
      data-anim={anim}
      className={`group relative flex items-center gap-4 ${dark ? 'text-paper' : 'text-ink'} ${md(
        'md:mx-auto md:block md:aspect-square md:w-full md:max-w-[19.5rem]',
      )} ${className}`}
    >
      {/* lens body: small icon-lens on phones, the whole card from md */}
      <div className={`relative size-16 shrink-0 ${md('md:absolute md:inset-0 md:size-auto')}`}>
        <LensBody big={auto} />
        <span
          aria-hidden="true"
          className={`absolute top-1/2 -right-7 hidden h-9 w-12 -translate-y-1/2 items-center justify-end rounded-r-md bg-[linear-gradient(180deg,#d6d7d9,#7d8086)] pr-1.5 shadow-[0_2px_10px_rgb(0_0_0/0.35)] ${md('md:flex')}`}
        >
          <span className="readout text-ink text-[0.58rem]">{power}</span>
        </span>
        <span className={`text-iris-a absolute inset-0 grid place-items-center ${md('md:hidden')}`}>
          <Icon name={icon} className="size-5" />
        </span>
      </div>

      <div
        className={`relative min-w-0 ${md(
          'md:flex md:h-full md:flex-col md:items-center md:justify-center md:px-[14%] md:text-center',
        )}`}
      >
        <p className={`label ${dark ? 'text-paper/60' : 'text-ink/60'}`} aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
          <span className={md('md:hidden')}> · {power} D</span>
        </p>
        <span
          className={`text-iris-a mt-3 hidden size-10 place-items-center rounded-full ring-1 ring-current/30 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110 ${md('md:grid')}`}
        >
          <Icon name={icon} className="size-[1.15rem]" />
        </span>
        <h3
          className={`font-display mt-1 text-[1.35rem] leading-[1.02] ${md('md:mt-4 md:text-[1.6rem] lg:text-[1.8rem]')}`}
        >
          <Emph text={title} />
        </h3>
        <p
          className={`mt-1 text-[0.92rem] leading-snug ${dark ? 'text-paper/70' : 'text-ink/70'} ${md('md:mt-3 md:text-[0.88rem]')}`}
        >
          {line}
        </p>
      </div>
    </article>
  );
}
