import { practice } from '@/config/practice';
import { scenePosters } from '@/config/images';
import { MaskLines } from '@/components/ui/MaskLines';
import { Picture } from '@/components/ui/Picture';
import { ServiceCard } from '@/components/ui/ServiceCard';

/**
 * Scene 3 — the iris opens like a camera aperture; three trial lenses (services) drop into
 * the frame from between the blades.
 */
export function Iris() {
  const s = practice.scenes.iris;
  const services = practice.services.filter((x) => x.scene === 'iris');
  return (
    <section
      id="services"
      data-t="2"
      data-theme="ink"
      data-cursor="scene"
      aria-labelledby="iris-title"
      className="scene scene-tall"
      style={{ ['--h' as string]: '280vh' }}
    >
      <div className="poster static-only">
        <Picture slug={scenePosters.iris} sizes="100vw" decorative />
      </div>
      <div className="stage justify-between gap-8 md:justify-center">
        <div data-anim="iris-head" className="text-center">
          <p className="label text-iris-a">{s.kicker}</p>
          <p className="label text-paper/55 mt-1" data-anim="iris-readout">
            {s.readout}
          </p>
          <MaskLines
            id="iris-title"
            lines={[s.headline]}
            anim="iris-title"
            className="font-display display-lg text-paper accent-em mx-auto mt-5 max-w-5xl text-balance"
          />
        </div>
        <div className="mx-auto grid w-full max-w-6xl gap-5 md:mt-[9vh] md:grid-cols-3 md:gap-10">
          {services.map((svc, i) => (
            <ServiceCard
              key={svc.id}
              title={svc.title}
              line={svc.line}
              icon={svc.icon}
              index={i}
              anim="iris-card"
              className="reveal"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
