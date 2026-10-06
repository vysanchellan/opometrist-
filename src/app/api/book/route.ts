import { NextResponse } from 'next/server';
import { bookingSchema } from '@/lib/booking';
import { practice } from '@/config/practice';

export const runtime = 'nodejs';

/** Booking requests: validated with the same Zod schema as the form. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Please check the highlighted fields',
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  // Honeypot filled → pretend success, drop silently.
  if (parsed.data.company) return NextResponse.json({ ok: true });

  const service = practice.services.find((s) => s.id === parsed.data.service)?.title;

  // TODO(client launch): deliver the booking — e.g. send an email via Resend/Postmark to
  // practice.contact.email and/or a WhatsApp Business API template message to the practice.
  // Keep POPIA in mind: only store what is needed, and do not log personal data in production.
  console.info('[booking] new request', {
    ...parsed.data,
    service,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
