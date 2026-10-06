'use client';

import { useEffect, useState } from 'react';
import { practice, telHref, whatsappHref } from '@/config/practice';
import { scrollToTarget } from '@/lib/lenis';
import { Icon } from './Icon';

/** Persistent floating pill on phones: Book · WhatsApp · Call. Steps aside when the booking card is on screen. */
export function MobileDock() {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const el = document.getElementById('book-form');
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHide(!!e?.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-all duration-500 md:hidden ${
        hide ? 'pointer-events-none translate-y-24 opacity-0' : ''
      }`}
    >
      <div className="bg-ink/80 text-paper ring-paper/15 flex items-center gap-1 rounded-full p-1.5 shadow-2xl ring-1 backdrop-blur-xl">
        <a
          href="#book"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget('#book');
          }}
          className="bg-hot text-ink inline-flex min-h-12 items-center rounded-full px-5 font-medium"
        >
          {practice.hero.primaryCta}
        </a>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp us"
          className="hover:bg-paper/10 grid size-12 place-items-center rounded-full"
        >
          <Icon name="whatsapp" className="size-6" />
        </a>
        <a
          href={telHref}
          aria-label={`Call ${practice.contact.phoneDisplay}`}
          className="hover:bg-paper/10 grid size-12 place-items-center rounded-full"
        >
          <Icon name="phone" className="size-5" />
        </a>
      </div>
    </div>
  );
}
