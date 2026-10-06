'use client';

import { useEffect, useRef, useState } from 'react';
import { practice, telHref } from '@/config/practice';
import { getLenis, scrollToTarget } from '@/lib/lenis';
import { Button } from './Button';
import { Icon } from './Icon';

const LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#frames', label: 'Frames' },
  { href: '#health', label: 'Eye health' },
  { href: '#care', label: 'Our care' },
  { href: '#book', label: 'Visit' },
];

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
        <defs>
          <linearGradient id="logo-g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="var(--iris-b)" />
            <stop offset="1" stopColor="var(--iris-a)" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="13" fill="none" stroke="url(#logo-g)" strokeWidth="5" />
        <circle cx="16" cy="16" r="5.5" fill="currentColor" />
        <circle cx="19.2" cy="12.6" r="1.6" fill="var(--paper)" />
      </svg>
      <span className="font-display text-[1.6rem] leading-none tracking-tight italic">
        {practice.shortName}{' '}
        <span className="ml-1.5 align-middle font-sans text-[0.62rem] tracking-[0.24em] uppercase opacity-75">
          {practice.name.replace(practice.shortName, '').trim()}
        </span>
      </span>
    </span>
  );
}

function go(e: React.MouseEvent, href: string) {
  e.preventDefault();
  scrollToTarget(href);
  history.replaceState(null, '', href);
}

/** Sticky nav: hides on scroll down, returns on scroll up, flips colour over paper sections. */
export function Nav() {
  const [hidden, setHidden] = useState(false);
  const [paper, setPaper] = useState(false);
  const [open, setOpen] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const dy = y - last.current;
      if (Math.abs(dy) > 6) {
        setHidden(dy > 0 && y > 160);
        last.current = y;
      }
      const under = document.elementsFromPoint(window.innerWidth / 2, 34);
      const themed = under.map((el) => el.closest<HTMLElement>('[data-theme]')).find(Boolean);
      setPaper(themed?.dataset.theme === 'paper');
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // lock page scroll while the menu is open
  useEffect(() => {
    const html = document.documentElement;
    html.style.overflow = open ? 'hidden' : '';
    if (open) getLenis()?.stop();
    else getLenis()?.start();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const closeAndGo = (e: React.MouseEvent, href: string) => {
    setOpen(false);
    go(e, href);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-out-expo)] ${
          hidden && !open ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <a
          href="#main"
          className="focus:bg-paper focus:text-ink sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <nav
          aria-label="Main"
          className={`mx-auto flex h-[var(--nav-h)] items-center justify-between gap-6 px-[var(--gutter)] transition-colors duration-500 ${
            paper && !open ? 'text-ink' : 'text-paper'
          }`}
        >
          <a
            href="#top"
            onClick={(e) => go(e, '#top')}

            data-cursor="hover"
          >
            <Logo />
          </a>
          <ul className="hidden items-center gap-7 lg:flex">
            {LINKS.map((l, i) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => go(e, l.href)}
                  className="label focus-link relative flex items-baseline gap-1.5 py-2 opacity-80 transition-opacity after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:opacity-100 hover:after:scale-x-100"
                  data-cursor="hover"
                >
                  <span aria-hidden="true" className="text-[0.55rem] opacity-55">
                    0{i + 1}
                  </span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <a
              href={telHref}
              className="readout hidden min-h-11 items-center gap-2 text-[0.78rem] opacity-80 hover:opacity-100 xl:inline-flex"
              data-cursor="hover"
            >
              <Icon name="phone" className="size-4" /> {practice.contact.phoneDisplay}
            </a>
            <span className="hidden md:inline-flex">
              <Button href="#book" onClick={(e) => go(e, '#book')} variant="primary">
                {practice.hero.primaryCta}
              </Button>
            </span>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full ring-1 ring-current/25 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span
                  className={`absolute left-0 h-px w-5 bg-current transition-all duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`}
                />
                <span
                  className={`absolute left-0 h-px w-5 bg-current transition-all duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>
      {/* Mobile menu: outside <header> (its transform would trap position:fixed); inert while closed. */}
      <div
        id="mobile-menu"
        inert={!open}
        aria-hidden={!open}
        className="bg-ink text-paper fixed inset-0 z-[45] flex flex-col justify-end px-[var(--gutter)] pt-24 pb-10 transition-[clip-path] duration-700 ease-[var(--ease-in-out-quart)] lg:hidden"
        style={{ clipPath: open ? 'circle(150% at 92% 4%)' : 'circle(0% at 92% 4%)' }}
      >
        <ul className="space-y-1">
          {LINKS.map((l, i) => (
            <li
              key={l.href}
              className={`transition-[opacity,translate] duration-600 ease-[var(--ease-out-expo)] ${
                open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ transitionDelay: open ? `${150 + i * 50}ms` : '0ms' }}
            >
              <a
                href={l.href}
                onClick={(e) => closeAndGo(e, l.href)}
                className="font-display block py-1 text-[2.8rem] leading-tight"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="#book" onClick={(e) => closeAndGo(e, '#book')} size="lg">
            {practice.hero.primaryCta}
          </Button>
          <Button href={telHref} variant="ghost" icon="phone" size="lg">
            Call us
          </Button>
        </div>
      </div>
    </>
  );
}
