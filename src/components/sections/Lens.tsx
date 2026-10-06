import { practice } from '@/config/practice';
import type { ImageSlug } from '@/config/images';
import { Emph, MaskLines } from '@/components/ui/MaskLines';
import { Picture } from '@/components/ui/Picture';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { SnellenChart } from '@/components/ui/SnellenChart';

/**
 * Scene 4 — the lens separates and floats; the world snaps into focus (signature moment 1),
 * then frames drift past as parallax layers.
 */
export function Lens() {
  const s = practice.scenes.lens;
  const services = practice.services.filter((x) => x.scene === 'lens');
  return (
    <section
      id="frames"
      data-t="3"
      data-theme="ink"
      data-cursor="scene"
      aria-labelledby="lens-title"
      className="scene scene-tall"
      style={{ ['--h' as string]: '420vh' }}
    >
      <div className="stage cine:block cine:p-0">
        {/* Layer 1+2: headline + focus pull */}
        <div
          data-anim="lens-focus"
          className="cine:absolute cine:inset-0 cine:flex cine:flex-col cine:justify-end cine:px-[var(--gutter)] cine:pt-[calc(var(--nav-h)+1rem)] cine:pb-[max(2rem,6svh)] md:cine:justify-center"
        >
          <div className="max-w-[min(34rem,100%)] md:ml-[2vw]">
            <p className="label text-iris-a" data-anim="lens-kicker">
              {s.kicker}
            </p>
            <p className="label text-paper/55 mt-1" data-anim="lens-readout">
              {s.readout}
            </p>
            <MaskLines
              id="lens-title"
              lines={[s.headline]}
              anim="lens-title"
              className="font-display display-md text-paper accent-em mt-5 text-balance"
            />
            <div className="mt-8 md:mt-10" data-anim="snellen">
              <SnellenChart />
              <p className="label text-paper/65 mt-4 grid">
                <span
                  data-anim="focus-hint"
                  aria-hidden="true"
                  className="still:hidden [grid-area:1/1]"
                >
                  {s.focusHint}
                </span>
                <span data-anim="focus-done" className="text-iris-a cine:opacity-0 [grid-area:1/1]">
                  {s.focusDone}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Layer 3: frames */}
        <div
          data-anim="lens-frames"
          className="cine:invisible cine:absolute cine:inset-0 cine:mt-0 cine:flex cine:flex-col cine:justify-end cine:px-[var(--gutter)] cine:pb-[max(2rem,6svh)] md:cine:justify-center mt-20"
        >
          <div
            aria-hidden="true"
            className="still:hidden cine:pointer-events-none cine:absolute cine:inset-0"
          >
            {s.frames.map((f, i) => {
              const pos = [
                'top-[11%] right-[6%] w-[40vw] md:right-[9%] md:w-[22vw]',
                'top-[38%] right-[31%] hidden w-[17vw] md:block',
                'top-[57%] right-[4%] w-[32vw] md:top-[61%] md:w-[19vw]',
              ][i];
              const speed = ['0.7', '1.3', '1'][i];
              const ratio = ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-[5/4]'][i];
              return (
                <figure
                  key={f.slug}
                  data-anim="frame-layer"
                  data-speed={speed}
                  className={`brackets text-paper/70 absolute max-w-[420px] p-2.5 [--bk:12px] ${pos}`}
                >
                  <span className="bk" />
                  <span className="bk" />
                  <span className="bk" />
                  <span className="bk" />
                  <Picture
                    slug={f.slug as ImageSlug}
                    sizes="(min-width:768px) 22vw, 40vw"
                    decorative
                    className="block overflow-hidden rounded-[0.35rem]"
                    imgClassName={`${ratio} w-full object-cover`}
                  />
                  <figcaption className="label text-paper/75 mt-2.5 flex justify-between gap-3">
                    <span>
                      FR-0{i + 1} · {f.name}
                    </span>
                    <span className="readout text-paper/55">{f.size}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
          <div className="relative max-w-xl md:ml-[2vw]">
            <h3
              className="font-display display-md text-paper accent-em text-balance"
              data-anim="frames-title"
            >
              <span>
                <Emph text={s.framesHeadline} />
              </span>
            </h3>
            <div className="mt-9 grid gap-6">
              {services.map((svc, i) => (
                <ServiceCard
                  key={svc.id}
                  title={svc.title}
                  line={svc.line}
                  icon={svc.icon}
                  index={i + 3}
                  variant="row"
                  anim="lens-card"
                  className="reveal"
                />
              ))}
            </div>
          </div>
          <div className="cine:hidden mt-8 grid grid-cols-3 gap-3">
            {s.frames.map((f) => (
              <Picture
                key={f.slug}
                slug={f.slug as ImageSlug}
                sizes="33vw"
                className="block overflow-hidden rounded-2xl"
                imgClassName="aspect-square w-full object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
