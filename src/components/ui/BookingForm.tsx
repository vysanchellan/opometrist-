'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DAY_LONG, openDays, practice, whatsappHref } from '@/config/practice';
import { bookingSchema, type Booking, type BookingInput } from '@/lib/booking';
import { Button } from './Button';
import { Icon } from './Icon';

const fieldCls =
  'mt-1.5 block min-h-12 w-full rounded-none border-0 border-b border-ink/25 bg-transparent px-0 text-[1.08rem] text-ink transition placeholder:text-ink/40 focus:border-ink focus:ring-0 focus:outline-none focus-visible:outline-none focus:shadow-[0_1px_0_var(--ink)] aria-[invalid=true]:border-[#c2410c]';

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return (
    <p
      id={id}
      role={msg ? 'alert' : undefined}
      className="mt-1.5 min-h-5 text-[0.82rem] text-[#9a3412]"
    >
      {msg ?? ''}
    </p>
  );
}

/** Minimal booking card: name, phone, preferred day, service. Zod-validated on both ends. */
export function BookingForm() {
  const uid = useId();
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [sent, setSent] = useState<Booking | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<BookingInput, unknown, Booking>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { time: 'any', service: practice.services[0]?.id },
    shouldFocusError: true,
  });

  const onSubmit = async (data: Booking) => {
    setState('sending');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSent(data);
      setState('done');
    } catch {
      setState('error');
    }
  };

  const id = (n: string) => `${uid}-${n}`;
  const service = sent ? practice.services.find((s) => s.id === sent.service)?.title : '';

  return (
    <div className="text-ink relative bg-[#fbf9f4] p-6 shadow-[0_1px_0_rgb(5_7_13/0.05),0_40px_100px_-40px_rgb(5_7_13/0.45)] md:p-10">
      {/* appointment slip: perforated top edge + stub */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 -top-[6px] h-3 bg-[radial-gradient(circle_at_6px_0,transparent_5px,#fbf9f4_5.5px)] bg-[length:16px_12px]"
      />
      <AnimatePresence mode="wait" initial={false}>
        {state === 'done' && sent ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[26rem] flex-col justify-center"
            role="status"
          >
            <span className="bg-ink text-paper grid size-14 place-items-center rounded-full">
              <Icon name="check" className="size-6" strokeWidth={2} />
            </span>
            <h3 className="font-display mt-6 text-[2.2rem] leading-none">
              Thank you, {sent.name.split(' ')[0]}.
            </h3>
            <p className="text-ink/70 mt-3 max-w-sm">
              We’ve got your request for {service?.toLowerCase()} on a {DAY_LONG[sent.day]}
              {sent.time === 'any' ? '' : ` ${sent.time}`}. We’ll call or WhatsApp you within one
              working day to confirm a time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                href={whatsappHref(
                  `Hi ${practice.name}, I just sent a booking request (${sent.name}).`,
                )}
                external
                variant="dark"
                icon="whatsapp"
              >
                Message us now
              </Button>
              <button
                type="button"
                className="text-ink/60 hover:text-ink min-h-12 px-3 text-sm underline underline-offset-4"
                onClick={() => {
                  setState('idle');
                  setSent(null);
                }}
                data-cursor="hover"
              >
                Make another booking
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit, () => undefined)}
            noValidate
            aria-describedby={id('privacy')}
          >
            <div className="border-ink/15 flex items-end justify-between gap-4 border-b border-dashed pb-5">
              <div>
                <p className="label text-ink/60">Appointment slip</p>
                <h3 className="font-display mt-2 text-[2rem] leading-none md:text-[2.5rem]">
                  Book an <em>eye test</em>
                </h3>
              </div>
              <span className="label text-ink/60 text-right">
                ~ 1 min
                <br />
                no account
              </span>
            </div>

            <div className="mt-7 grid gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor={id('name')} className="label text-ink/70">
                  Your name
                </label>
                <input
                  id={id('name')}
                  autoComplete="name"
                  className={fieldCls}
                  placeholder="e.g. Thandi Mkhize"
                  aria-invalid={!!errors.name}
                  aria-describedby={id('name-err')}
                  {...register('name')}
                />
                <FieldError id={id('name-err')} msg={errors.name?.message} />
              </div>
              <div>
                <label htmlFor={id('phone')} className="label text-ink/70">
                  Phone or WhatsApp number
                </label>
                <input
                  id={id('phone')}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className={fieldCls}
                  placeholder="082 123 4567"
                  aria-invalid={!!errors.phone}
                  aria-describedby={id('phone-err')}
                  {...register('phone')}
                />
                <FieldError id={id('phone-err')} msg={errors.phone?.message} />
              </div>
            </div>

            <fieldset className="mt-1" aria-describedby={id('day-err')}>
              <legend className="label text-ink/70">Preferred day</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {openDays.map((d) => (
                  <label key={d} className="relative">
                    <input type="radio" value={d} className="peer sr-only" {...register('day')} />
                    <span
                      className="ring-ink/20 peer-checked:text-paper peer-checked:ring-ink peer-focus-visible:outline-iris-a hover:ring-ink/60 relative grid size-12 cursor-pointer place-items-center rounded-full text-[0.8rem] font-medium ring-1 transition peer-checked:[background:radial-gradient(circle,var(--ink)_38%,transparent_40%),conic-gradient(from_200deg,var(--iris-b),var(--iris-c),var(--iris-a),var(--iris-b))] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 md:size-14"
                      data-cursor="hover"
                    >
                      <span aria-hidden="true">{d}</span>
                      <span className="sr-only">{DAY_LONG[d]}</span>
                    </span>
                  </label>
                ))}
              </div>
              <FieldError id={id('day-err')} msg={errors.day?.message} />
            </fieldset>

            <div className="grid gap-x-4 sm:grid-cols-[1.4fr_1fr]">
              <div>
                <label htmlFor={id('service')} className="label text-ink/70">
                  What would you like?
                </label>
                <select
                  id={id('service')}
                  className={`${fieldCls} bg-[url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2305070D' stroke-width='1.6'><path d='m6 9 6 6 6-6'/></svg>")] appearance-none bg-[length:18px] bg-[right_1rem_center] bg-no-repeat pr-10`}
                  aria-invalid={!!errors.service}
                  aria-describedby={id('service-err')}
                  {...register('service')}
                >
                  {practice.services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
                <FieldError id={id('service-err')} msg={errors.service?.message} />
              </div>
              <div>
                <label htmlFor={id('time')} className="label text-ink/70">
                  Time of day
                </label>
                <select
                  id={id('time')}
                  className={`${fieldCls} bg-[url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2305070D' stroke-width='1.6'><path d='m6 9 6 6 6-6'/></svg>")] appearance-none bg-[length:18px] bg-[right_1rem_center] bg-no-repeat pr-10`}
                  {...register('time')}
                >
                  <option value="any">Any time</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                </select>
                <FieldError id={id('time-err')} />
              </div>
            </div>

            {/* honeypot */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
              <label>
                Company <input tabIndex={-1} autoComplete="off" {...register('company')} />
              </label>
            </div>

            <label
              className="text-ink/80 flex cursor-pointer items-start gap-3 text-sm"
              data-cursor="hover"
            >
              <input
                type="checkbox"
                className="mt-0.5 size-5 shrink-0 rounded accent-[var(--ink)]"
                aria-invalid={!!errors.consent}
                aria-describedby={id('consent-err')}
                {...register('consent')}
              />
              <span>{practice.privacy.consent}</span>
            </label>
            <FieldError id={id('consent-err')} msg={errors.consent?.message} />

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Button type="submit" size="lg" iconRight="arrow" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Request my appointment'}
              </Button>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink/75 hover:text-ink inline-flex min-h-12 items-center gap-2 text-sm font-medium"
                data-cursor="hover"
              >
                <Icon name="whatsapp" className="size-5" /> or WhatsApp us
              </a>
            </div>
            {state === 'error' ? (
              <p role="alert" className="mt-4 text-sm text-[#9a3412]">
                Sorry — that didn’t go through. Please try again, or{' '}
                <button type="button" className="underline" onClick={() => setFocus('name')}>
                  check your details
                </button>
                .
              </p>
            ) : null}
            <p
              id={id('privacy')}
              className="border-ink/10 text-ink/65 mt-6 border-t pt-4 text-[0.78rem] leading-relaxed"
            >
              {practice.privacy.formNotice}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
