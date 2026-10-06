import { practice } from '@/config/practice';
import { scenePosters } from '@/config/images';
import { MaskLines } from '@/components/ui/MaskLines';
import { Picture } from '@/components/ui/Picture';

/** Scene 2 — push through the cornea. An anatomical callout: reticle target, leader line, read-out. */
export function Cornea() {
  const c = practice.scenes.cornea;
  return (
    <section
      id="cornea"
      data-t="1"
      data-theme="ink"
      data-cursor="scene"
      aria-labelledby="cornea-title"
      className="scene scene-tall"
      style={{ ['--h' as string]: '170vh' }}
    >
      <div className="poster static-only">
        <Picture
          slug={scenePosters.cornea}
          sizes="100vw"
          decorative
          imgClassName="object-[50%_40%]"
        />
      </div>
      <div className="stage justify-end md:justify-center">
        {/* leader line (cinematic only) */}
        <svg
          aria-hidden="true"
          className="cine-only pointer-events-none absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          data-anim="cornea-svg"
        >
          <path
            d="M 58 47 L 44 31 L 9 31"
            fill="none"
            stroke="var(--paper)"
            strokeOpacity="0.6"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* reticle on the corneal apex */}
        <span
          aria-hidden="true"
          data-anim="cornea-dot"
          className="cine-only absolute top-[47%] left-[58%] size-16 -translate-x-1/2 -translate-y-1/2"
        >
          <svg viewBox="0 0 64 64" className="size-full">
            <circle
              cx="32"
              cy="32"
              r="22"
              fill="none"
              stroke="var(--paper)"
              strokeOpacity="0.55"
              strokeDasharray="2 4"
            />
            <circle cx="32" cy="32" r="3" fill="var(--paper)" />
            <path
              d="M32 2v10M32 52v10M2 32h10M52 32h10"
              stroke="var(--paper)"
              strokeOpacity="0.8"
            />
          </svg>
        </span>

        <div
          data-anim="cornea-copy"
          className="relative max-w-xl md:absolute md:top-[calc(31%+1.25rem)] md:left-[9%]"
        >
          <p className="label text-iris-a flex items-center gap-3">
            <span className="tabular-nums">01</span> — {c.label}
          </p>
          <p className="label text-paper/55 mt-1" data-anim="cornea-readout">
            {c.readout}
          </p>
          <MaskLines
            id="cornea-title"
            lines={[c.promise]}
            anim="cornea-title"
            className="font-display display-md text-paper accent-em mt-6 md:mt-8"
          />
          <p data-anim="cornea-line-copy" className="text-paper/70 mt-5 max-w-sm text-[1.05rem]">
            {c.line}
          </p>
        </div>
      </div>
    </section>
  );
}
