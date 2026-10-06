import { practice } from '@/config/practice';
import { scenePosters } from '@/config/images';
import { Brackets } from '@/components/ui/Brackets';
import { CountUp } from '@/components/ui/CountUp';
import { LazyTestimonials } from '@/components/ui/Lazy';
import { MaskLines } from '@/components/ui/MaskLines';
import { MedAidStrip } from '@/components/ui/MedAidStrip';
import { Picture } from '@/components/ui/Picture';
import { RxCard } from '@/components/ui/RxCard';
import { TestimonialCard } from '@/components/ui/TestimonialCard';

const PHOTOS = [
  { slug: 'family', caption: 'Whole-family eye tests, one visit.' },
  { slug: 'child-eye-test', caption: 'Picture charts for little ones.' },
  { slug: 'patient-glasses', caption: 'Frames fitted to faces, not trends.' },
] as const;

/**
 * Scene 6 — follow the optic nerve out of the eye; the eye blinks, wakes into daylight, and the
 * story turns human: the Care Promise as a prescription, real people, patient notes, medical aid.
 */
export function Care() {
  const n = practice.scenes.nerve;
  const c = practice.scenes.care;
  return (
    <section id="care" data-t="5" aria-labelledby="care-title" className="scene">
      {/* Nerve transition */}
      <div
        className="scene-tall relative"
        style={{ ['--h' as string]: '160vh' }}
        data-theme="ink"
        data-cursor="scene"
      >
        <div className="poster static-only">
          <Picture
            slug={scenePosters.nerve}
            sizes="100vw"
            decorative
            imgClassName="object-[50%_35%]"
          />
        </div>
        <div className="stage justify-end md:justify-center">
          <div
            data-anim="nerve-copy"
            className="max-w-3xl md:-mt-[38vh] md:mr-[6vw] md:ml-auto md:text-right"
          >
            <p className="label text-iris-a" data-anim="nerve-kicker">
              {n.kicker}
            </p>
            <p className="label text-paper/55 mt-1" data-anim="nerve-readout">
              {n.readout}
            </p>
            <MaskLines
              lines={[n.headline]}
              anim="nerve-title"
              className="font-display display-lg text-paper accent-em mt-5 text-balance"
            />
          </div>
        </div>
      </div>

      {/* Care content (opaque paper) */}
      <div
        id="care-content"
        data-t="5.55"
        data-theme="paper"
        className="bg-paper text-ink relative z-10"
      >
        <div className="mx-auto max-w-[1500px] px-[var(--gutter)] pt-28 pb-24 md:pt-40 md:pb-36">
          <header className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="label text-ink/65">{c.kicker}</p>
              <MaskLines
                id="care-title"
                lines={[c.headline]}
                anim="care-title"
                focusIn
                className="font-display display-lg mt-5 text-balance"
              />
            </div>
            <p className="reveal text-ink/70 max-w-sm md:pb-3 md:text-right">
              {practice.accessibility}
            </p>
          </header>

          <div className="mt-16 grid items-center gap-14 md:mt-24 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
            <figure className="reveal brackets bk-hover text-ink relative p-3 [--bk:18px]">
              <Brackets />
              <Picture
                slug="care-consult"
                sizes="(min-width: 768px) 42vw, 100vw"
                className="block overflow-hidden"
                imgClassName="aspect-[4/5] w-full object-cover"
              />
              <figcaption className="label text-ink/65 mt-3 flex justify-between">
                <span>Consult room · Umhlanga</span>
                <span>40:00 min</span>
              </figcaption>
            </figure>
            <div className="reveal">
              <RxCard />
            </div>
          </div>

          {/* instrument read-outs */}
          <dl className="border-ink/15 mt-20 grid grid-cols-3 border-y md:mt-28">
            {practice.stats.map((s, i) => (
              <div
                key={s.label}
                className={`reveal px-2 py-7 md:px-8 md:py-10 ${i > 0 ? 'border-ink/15 border-l' : ''}`}
              >
                <dt className="label text-ink/65 order-2">{s.label}</dt>
                <dd className="font-display mt-3 text-[2.3rem] leading-none md:text-[4.2rem]">
                  <CountUp
                    value={s.value}
                    suffix={s.suffix}
                    decimals={'decimals' in s ? s.decimals : 0}
                  />
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-20 grid grid-cols-2 gap-4 md:mt-32 md:grid-cols-12 md:gap-6">
            {PHOTOS.map((p, i) => (
              <figure
                key={p.slug}
                className={`reveal brackets bk-hover text-ink relative p-2.5 [--bk:14px] ${
                  [
                    'col-span-2 md:col-span-7',
                    'md:col-span-5 md:mt-28',
                    'md:col-span-4 md:col-start-2 md:-mt-20',
                  ][i]
                }`}
              >
                <Brackets />
                <Picture
                  slug={p.slug}
                  sizes={
                    i === 0 ? '(min-width: 768px) 58vw, 100vw' : '(min-width: 768px) 38vw, 50vw'
                  }
                  className="block overflow-hidden"
                  imgClassName={`${['aspect-[3/2]', 'aspect-[4/5] object-[60%_50%]', 'aspect-[4/5]'][i]} w-full object-cover`}
                />
                <figcaption className="label text-ink/65 mt-3 flex justify-between gap-4">
                  <span>{p.caption}</span>
                  <span aria-hidden="true">0{i + 1}</span>
                </figcaption>
              </figure>
            ))}
            <div className="reveal col-span-2 self-end md:col-span-6 md:col-start-7">
              <LazyTestimonials
                fallback={
                  <div className="grid gap-4">
                    <p className="label text-ink/65">Patient notes</p>
                    {practice.testimonials.slice(0, 1).map((t) => (
                      <TestimonialCard key={t.name} t={t} />
                    ))}
                  </div>
                }
              />
            </div>
          </div>

          <div className="mt-24 md:mt-36">
            <p className="label text-ink/65 mb-6">Medical aid</p>
            <MedAidStrip />
          </div>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            {practice.team.map((m) => (
              <div
                key={m.name}
                className="reveal border-ink/15 flex items-center gap-4 border-t pt-5"
              >
                <span
                  className="font-display text-paper relative grid size-12 place-items-center rounded-full text-lg italic [background:conic-gradient(from_200deg,var(--iris-b),var(--iris-c),var(--iris-a),var(--iris-b))]"
                  aria-hidden="true"
                >
                  <span className="bg-ink absolute inset-[5px] rounded-full" />
                  <span className="relative">{m.name.replace(/^Dr\s+/, '').charAt(0)}</span>
                </span>
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="label text-ink/65">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
