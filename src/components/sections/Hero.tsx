import { practice, whatsappHref } from '@/config/practice';
import { images } from '@/config/images.generated';
import { Button } from '@/components/ui/Button';
import { IrisLoader } from '@/components/ui/IrisLoader';
import { MaskLines } from '@/components/ui/MaskLines';
import { Picture } from '@/components/ui/Picture';

/** Scene 1 — Open. Poster paints first (fast LCP); the 3D eye opens over it inside an instrument HUD. */
export function Hero() {
  const poster = images['hero-poster'] ? 'hero-poster' : 'iris-macro';
  return (
    <section
      id="top"
      data-t="0"
      data-theme="ink"
      data-cursor="scene"
      aria-labelledby="hero-title"
      className="scene relative min-h-svh overflow-hidden"
    >
      <div data-anim="hero-poster" className="absolute inset-0 -z-10">
        <Picture
          slug={poster}
          mobileSlug={poster === 'hero-poster' ? 'hero-poster-mobile' : undefined}
          eager
          sizes="100vw"
          className="absolute inset-0"
          imgClassName={`size-full object-cover ${poster === 'iris-macro' ? 'object-[50%_42%] opacity-70' : 'object-center'}`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_40%,transparent_30%,var(--ink)_85%)]" />
      </div>
      <div className="cine-only">
        <IrisLoader />
      </div>

      {/* instrument HUD: viewfinder corners + read-outs */}
      <div
        aria-hidden="true"
        data-anim="hero-hud"
        className="brackets text-paper/45 pointer-events-none absolute inset-3 z-10 [--bk:22px] md:inset-5"
      >
        <span className="bk" />
        <span className="bk" />
        <span className="bk" />
        <span className="bk" />
      </div>

      <div className="stage relative z-10 min-h-svh justify-end pb-[max(6.5rem,15svh)] md:pb-24">
        <div data-anim="hero-copy" className="max-w-[min(100%,62rem)]">
          <p className="label text-paper/75 mb-7 flex items-center gap-3" data-anim="hero-kicker">
            <span
              aria-hidden="true"
              className="inline-block size-2.5 rounded-full shadow-[0_0_0_3px_rgb(246_243_238/0.08)] [background:conic-gradient(var(--iris-b),var(--iris-c),var(--iris-a),var(--iris-b))]"
            />
            {practice.hero.kicker}
          </p>
          <MaskLines
            as="h1"
            id="hero-title"
            lines={practice.hero.headline}
            anim="hero-title"
            className="font-display display-xl text-paper accent-em text-balance"
          />
          <p
            data-anim="hero-support"
            className="text-paper/75 mt-8 max-w-[33rem] text-[1.06rem] leading-relaxed md:text-[1.18rem]"
          >
            {practice.hero.support}
          </p>
          <div data-anim="hero-ctas" className="mt-10 flex flex-wrap items-center gap-3">
            <Button href="#book" size="lg" iconRight="arrow" magnetic>
              {practice.hero.primaryCta}
            </Button>
            <Button href={whatsappHref()} external variant="ghost" icon="whatsapp" size="lg">
              {practice.hero.secondaryCta}
            </Button>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="label text-paper/55 absolute bottom-7 left-[var(--gutter)] hidden md:block"
        >
          {practice.address.coords} — {practice.address.suburb}
        </div>
        <div
          data-anim="scroll-cue"
          aria-hidden="true"
          className="text-paper/65 absolute right-[var(--gutter)] bottom-7 hidden items-center gap-4 md:flex"
        >
          <span className="label">Scroll to look closer</span>
          <span className="bg-paper/15 relative block h-14 w-px overflow-hidden">
            <span
              data-anim="scroll-cue-line"
              className="bg-paper absolute inset-x-0 top-0 h-full origin-top"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
