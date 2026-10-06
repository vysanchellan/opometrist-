'use client';

import { useEffect, useRef } from 'react';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'ghost' | 'light' | 'dark';

type Props = {
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  variant?: Variant;
  icon?: IconName;
  iconRight?: IconName;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  external?: boolean;
  disabled?: boolean;
  size?: 'md' | 'lg';
  ariaLabel?: string;
  magnetic?: boolean;
  /** Mini iris ornament that dilates on hover (defaults on for primary). */
  iris?: boolean;
};

/** A tiny iris: gradient ring + pupil that dilates when the button is hovered. */
function MiniIris() {
  return (
    <span
      aria-hidden="true"
      className="relative grid size-[1.15em] shrink-0 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgb(5_7_13/0.35)] [background:conic-gradient(from_210deg,var(--iris-b),var(--iris-c),var(--iris-a),var(--iris-c),var(--iris-b))]"
    >
      <span className="bg-ink block size-[42%] rounded-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.55] group-focus-visible:scale-[1.55]" />
      <span className="bg-paper absolute top-[24%] right-[26%] block size-[16%] rounded-full opacity-90" />
    </span>
  );
}

const variants: Record<Variant, string> = {
  primary:
    'bg-hot text-ink hover:bg-[color-mix(in_oklab,var(--hot)_90%,white)] after:border-ink/20',
  ghost:
    'border border-[color-mix(in_oklab,var(--paper)_28%,transparent)] text-paper hover:border-paper hover:bg-[color-mix(in_oklab,var(--paper)_8%,transparent)] after:border-paper/10',
  light: 'bg-paper text-ink hover:bg-white after:border-ink/15',
  dark: 'bg-ink text-paper hover:bg-ink-soft after:border-paper/15',
};

/** Magnetic pill button. Renders <a> when `href` is set, otherwise <button>. 44px+ tap target. */
export function Button({
  href,
  onClick,
  variant = 'primary',
  icon,
  iconRight,
  children,
  className = '',
  type = 'button',
  external,
  disabled,
  size = 'md',
  ariaLabel,
  magnetic = true,
  iris,
}: Props) {
  const showIris = iris ?? (variant === 'primary' && !icon);
  // Magnetic pull: a tiny damped spring on transform, no animation library needed.
  const wrap = useRef<HTMLSpanElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const spring = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  const animate = () => {
    const el = wrap.current;
    if (!el) return;
    const m = spring.current;
    const step = () => {
      m.vx = (m.vx + (target.current.x - m.x) * 0.16) * 0.72;
      m.vy = (m.vy + (target.current.y - m.y) * 0.16) * 0.72;
      m.x += m.vx;
      m.y += m.vy;
      el.style.transform = `translate3d(${m.x.toFixed(2)}px, ${m.y.toFixed(2)}px, 0)`;
      const energy =
        Math.abs(m.vx) +
        Math.abs(m.vy) +
        Math.abs(target.current.x - m.x) +
        Math.abs(target.current.y - m.y);
      if (energy > 0.05) raf.current = requestAnimationFrame(step);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(step);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!magnetic || e.pointerType !== 'mouse' || !wrap.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = wrap.current.getBoundingClientRect();
    target.current = {
      x: (e.clientX - (r.left + r.width / 2)) * 0.28,
      y: (e.clientY - (r.top + r.height / 2)) * 0.36,
    };
    animate();
  };
  const reset = () => {
    target.current = { x: 0, y: 0 };
    animate();
  };

  // the inner hairline (::after) reads like a lens bezel
  const cls = `group relative inline-flex select-none items-center justify-center gap-2.5 rounded-full font-medium tracking-[-0.01em] transition-colors duration-300 after:pointer-events-none after:absolute after:inset-[3px] after:rounded-full after:border disabled:opacity-50 ${
    size === 'lg' ? 'min-h-14 px-7 text-[1.02rem]' : 'min-h-12 px-5 text-[0.95rem]'
  } ${variants[variant]} ${className}`;

  const inner = (
    <>
      {showIris ? <MiniIris /> : null}
      {icon ? <Icon name={icon} className="size-[1.15em]" /> : null}
      <span className="group-hover:[animation:refocus_0.6s_var(--ease-out-expo)]">{children}</span>
      {iconRight ? (
        <Icon
          name={iconRight}
          className="size-[1.05em] transition-transform duration-300 group-hover:translate-x-0.5"
        />
      ) : null}
    </>
  );

  return (
    <span ref={wrap} onPointerMove={onMove} onPointerLeave={reset} className="inline-flex">
      {href ? (
        <a
          href={href}
          onClick={onClick}
          className={cls}
          aria-label={ariaLabel}
          data-cursor="hover"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {inner}
        </a>
      ) : (
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={cls}
          aria-label={ariaLabel}
          data-cursor="hover"
        >
          {inner}
        </button>
      )}
    </span>
  );
}
