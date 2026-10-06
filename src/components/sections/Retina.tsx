import { practice } from '@/config/practice';
import { scenePosters } from '@/config/images';
import { Icon } from '@/components/ui/Icon';
import { MaskLines } from '@/components/ui/MaskLines';
import { Picture } from '@/components/ui/Picture';

/** Labels pinned to real points on the 3D retina (positions written each frame by the scene). */
const ANNOTATIONS = [
  { id: 'disc', label: 'Optic disc', value: 'C/D 0.3 · healthy' },
  { id: 'macula', label: 'Macula', value: 'Fovea · 0.35 mm' },
  { id: 'arcade', label: 'Vessel arcade', value: 'A/V 2:3' },
] as const;

/**
 * Scene 5 — through the vitreous to the retina. The scene performs a retinal scan: a laser
 * line sweeps the fundus while annotations lock onto the disc, macula and vessels.
 */
export function Retina() {
  const s = practice.scenes.retina;
  const health = practice.services.find((x) => x.scene === 'retina');
  return (
    <section
      id="health"
      data-t="4"
      data-theme="ink"
      data-cursor="scene"
      aria-labelledby="retina-title"
      className="scene scene-tall"
      style={{ ['--h' as string]: '270vh' }}
    >
      <div className="poster static-only">
        <Picture slug={scenePosters.retina} sizes="100vw" decorative />
      </div>
      <div className="stage justify-end gap-10 md:justify-center">
        <div
          aria-hidden="true"
          data-anim="retina-scrim"
          className="cine-only pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgb(5_7_13/0.78)_0%,rgb(5_7_13/0.3)_42%,transparent_68%),linear-gradient(0deg,rgb(5_7_13/0.75)_0%,transparent_45%)]"
        />

        {/* tracked annotations (cinematic) */}
        <div aria-hidden="true" className="cine-only pointer-events-none absolute inset-0">
          <div className="max-md:hidden">
            {ANNOTATIONS.map((a) => (
              <div
                key={a.id}
                id={`anno-${a.id}`}
                data-anim="retina-anno"
                className="absolute top-0 left-0 opacity-0"
                style={{ transform: 'translate3d(-999px,-999px,0)' }}
              >
                <span className="border-paper/80 absolute -top-3 -left-3 size-6 rounded-full border">
                  <span className="bg-paper absolute top-1/2 left-1/2 size-1 -translate-1/2 rounded-full" />
                </span>
                <span className="bg-paper/60 absolute top-0 left-3 h-px w-14 origin-left -rotate-[28deg]" />
                <span className="absolute -top-[3.6rem] left-[3.6rem] whitespace-nowrap">
                  <span className="label text-paper block">{a.label}</span>
                  <span className="readout text-signal block text-[0.7rem]">{a.value}</span>
                </span>
              </div>
            ))}
            <div
              data-anim="scan-readout"
              className="label text-signal absolute top-[calc(var(--nav-h)+0.5rem)] right-[var(--gutter)] text-right opacity-0"
            >
              Fundus scan · <span data-anim="scan-pct">0</span>%
            </div>
          </div>
        </div>

        <div data-anim="retina-head" className="relative max-w-2xl">
          <p className="label text-iris-a">{s.kicker}</p>
          <p className="label text-paper/55 mt-1">{s.readout}</p>
          <MaskLines
            id="retina-title"
            lines={[s.headline]}
            anim="retina-title"
            className="font-display display-lg text-paper accent-em mt-5 text-balance"
          />
          <p data-anim="retina-line" className="text-paper/75 mt-5 max-w-md">
            {s.line}
            {health ? (
              <span className="sr-only">
                {' '}
                {health.title}: {health.line}
              </span>
            ) : null}
          </p>
        </div>
        <ul
          data-observe
          className="relative grid max-w-5xl gap-4 md:mt-[14vh] md:grid-cols-3 md:gap-8"
        >
          {s.checks.map((c, i) => (
            <li key={c.title} data-anim="retina-item" className="reveal">
              <p className="label text-signal flex items-center gap-2" aria-hidden="true">
                <span className="readout">SCAN 0{i + 1}</span>
                <span className="bg-signal/40 h-px flex-1" />
              </p>
              <div className="mt-3 flex gap-4">
                <span className="text-signal ring-signal/40 relative grid size-11 shrink-0 place-items-center rounded-full ring-1">
                  <span
                    aria-hidden="true"
                    className="ring-signal/30 ping-when-seen absolute inset-0 rounded-full ring-1 [animation-duration:2.8s]"
                    style={{ animationDelay: `${i * 0.6}s` }}
                  />
                  <Icon name={c.icon} className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-paper text-[1.35rem] leading-tight">
                    {c.title}
                  </h3>
                  <p className="text-paper/70 mt-1 text-[0.93rem] leading-snug">{c.line}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
