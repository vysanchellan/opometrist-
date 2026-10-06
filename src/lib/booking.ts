import { z } from 'zod';
import { DAYS, openDays, practice } from '@/config/practice';

/** Shared by the booking form (client) and /api/book (server). */
export const bookingSchema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name').max(80, 'That name is a little long'),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s()-]/g, ''))
    .pipe(
      z
        .string()
        .regex(/^(\+27|0)[1-8][0-9]{8}$/, 'Please use a South African number, e.g. 082 123 4567'),
    ),
  day: z
    .enum(DAYS, { message: 'Pick a day that suits you' })
    .refine((d) => openDays.includes(d), 'We’re closed that day — please pick another'),
  time: z.enum(['morning', 'afternoon', 'any']),
  service: z.enum(practice.services.map((s) => s.id) as [string, ...string[]], {
    message: 'Choose what you’d like to book',
  }),
  consent: z.literal(true, { message: 'We need your OK to contact you about this booking' }),
  /** Honeypot — real people never fill this in. */
  company: z.string().max(0).optional(),
});

export type BookingInput = z.input<typeof bookingSchema>;
export type Booking = z.output<typeof bookingSchema>;
