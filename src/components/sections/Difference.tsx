import { practice } from '@/config/practice';
import { differenceScenes } from '@/config/images';
import { LazyVisionSlider } from '@/components/ui/Lazy';
import { Emph } from '@/components/ui/MaskLines';
import { Picture } from '@/components/ui/Picture';

/** Signature moment 2 — "See the difference" over real KZN views. */
export function Difference() {
  const s = practice.scenes.difference;
  return (
    <section
      id="difference"
      data-t="3.86"
      data-t-offset="1"
      data-theme="ink"
      aria-labelledby="difference-title"
      className="scene bg-ink/92 relative z-10 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-[1400px] px-[var(--gutter)] py-24 md:py-32">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div className="reveal">
            <p className="label text-iris-a">{s.kicker}</p>
            <h2
              id="difference-title"
              data-focus-in
              className="font-display display-md text-paper accent-em mt-4 max-w-3xl text-balance"
            >
              <span className="mask-line">
                <span>
                  <Emph text={s.headline} />
                </span>
              </span>
            </h2>
          </div>
          <p className="reveal text-paper/60 max-w-xs md:text-right">{s.line}</p>
        </div>
        <div className="reveal mt-10 md:mt-14">
          <LazyVisionSlider
            fallback={
              <Picture
                slug={differenceScenes[0]!.slug}
                sizes="100vw"
                className="ring-paper/10 block aspect-[4/5] overflow-hidden rounded-[1.75rem] ring-1 sm:aspect-[16/10]"
                imgClassName="size-full object-cover"
              />
            }
          />
        </div>
      </div>
    </section>
  );
}
