import { DAY_LONG, DAYS, practice, telHref, whatsappHref } from '@/config/practice';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { LazyBookingForm } from '@/components/ui/Lazy';
import { MapFacade } from '@/components/ui/MapFacade';
import { MaskLines } from '@/components/ui/MaskLines';
import { OpenStatus } from '@/components/ui/OpenStatus';

/**
 * Scene 7 — close. The eye reassembles in miniature (docked into the right-hand column by the
 * 3D layer) beside a one-minute booking card, with everything you need to visit.
 */
export function Book() {
  const b = practice.scenes.book;
  return (
    <section
      id="book"
      data-t="6"
      data-t-offset="0.35"
      data-theme="paper"
      aria-labelledby="book-title"
      className="scene bg-paper text-ink cine:bg-transparent relative z-10"
    >
      <div className="mx-auto grid max-w-[1500px] gap-12 px-[var(--gutter)] pt-28 pb-24 md:pt-40 md:pb-32 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <div className="cine:max-lg:pt-[36svh]">
            <p className="label text-ink/65">{b.kicker}</p>
            <MaskLines
              id="book-title"
              lines={[b.headline]}
              anim="book-title"
              focusIn
              className="font-display display-md mt-4 text-balance"
            />
            <p className="text-ink/70 mt-4 max-w-md">{b.line}</p>
            <OpenStatus className="text-ink/80 mt-5" />
          </div>

          <div id="book-form" className="mt-10 scroll-mt-28">
            <LazyBookingForm
              fallback={
                <div className="bg-paper ring-ink/10 flex min-h-[44rem] flex-col justify-between rounded-[2rem] p-6 ring-1 md:min-h-[40rem] md:p-9">
                  <p className="font-display text-[1.9rem] leading-none md:text-[2.3rem]">
                    Book an eye test
                  </p>
                  <p className="text-ink/70 max-w-sm text-sm">
                    Loading the booking form… or reach us right now on{' '}
                    <a className="underline" href={whatsappHref()}>
                      WhatsApp
                    </a>{' '}
                    or{' '}
                    <a className="underline" href={telHref}>
                      {practice.contact.phoneDisplay}
                    </a>
                    .
                  </p>
                </div>
              }
            />
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="label text-ink/65">Find us</h3>
              <address className="mt-3 leading-relaxed not-italic">
                {practice.address.line1}
                <br />
                {practice.address.suburb}, {practice.address.city}
                <br />
                {practice.address.postalCode}
              </address>
              <p className="text-ink/60 mt-3 text-sm">{practice.address.parking}</p>
            </div>
            <div>
              <h3 className="label text-ink/65">Hours</h3>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-sm tabular-nums">
                {DAYS.map((d) => {
                  const h = practice.hours[d];
                  return (
                    <div key={d} className="contents">
                      <dt className="text-ink/60">
                        <abbr title={DAY_LONG[d]} className="no-underline">
                          {d}
                        </abbr>
                      </dt>
                      <dd>{h ? `${h[0]} – ${h[1]}` : 'Closed'}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={whatsappHref()} external variant="dark" icon="whatsapp">
              WhatsApp us
            </Button>
            <a
              href={telHref}
              className="ring-ink/25 hover:bg-ink/5 inline-flex min-h-12 items-center gap-2.5 rounded-full px-5 font-medium ring-1 transition"
              data-cursor="hover"
            >
              <Icon name="phone" className="size-[1.1em]" /> {practice.contact.phoneDisplay}
            </a>
          </div>
          <div className="mt-8">
            <MapFacade />
          </div>
          <p className="text-ink/60 mt-4 flex items-start gap-2 text-sm">
            <Icon name="pin" className="mt-0.5 size-4 shrink-0" /> Serving{' '}
            {practice.address.serving.join(', ')}.
          </p>
        </div>

        {/* The docked 3D eye lives in this column (cinematic mode). */}
        <div aria-hidden="true" className="md:cine:block hidden">
          <div className="sticky top-0 flex h-svh flex-col items-center justify-end pb-[10svh] text-center">
            <p className="label text-ink/65">Iris · reassembled</p>
            <p className="text-ink/65 mt-2 max-w-xs text-sm">
              Move your cursor — it’s looking back at you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
