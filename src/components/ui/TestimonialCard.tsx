import type { practice } from '@/config/practice';

type T = (typeof practice.testimonials)[number];

/** A patient note: index-card paper, mono header, the words in italic display type. */
export function TestimonialCard({ t, n = 1 }: { t: T; n?: number }) {
  return (
    <figure className="text-ink relative flex h-full flex-col justify-between gap-10 bg-[#fbf9f4] bg-[repeating-linear-gradient(180deg,transparent_0_31px,rgb(47_140_125/0.12)_31px_32px)] p-7 shadow-[0_24px_60px_-30px_rgb(5_7_13/0.35)] md:p-10">
      <span aria-hidden="true" className="bg-hot/40 absolute inset-y-0 left-10 w-px md:left-14" />
      <p className="label text-ink/60 flex justify-between pl-6 md:pl-8" aria-hidden="true">
        <span>Patient note · 0{n}</span>
        <span>{t.suburb}</span>
      </p>
      <blockquote className="font-display pl-6 text-[1.4rem] leading-[1.18] italic md:pl-8 md:text-[1.65rem]">
        “{t.quote}”
      </blockquote>
      <figcaption className="flex items-center gap-3 pl-6 text-sm md:pl-8">
        <span className="bg-ink font-display text-paper grid size-10 place-items-center rounded-full text-lg italic">
          {t.name.charAt(0)}
        </span>
        <span>
          <strong className="block font-medium">{t.name}</strong>
          <span className="text-ink/65">{t.suburb}</span>
        </span>
      </figcaption>
    </figure>
  );
}
