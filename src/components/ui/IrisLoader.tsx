'use client';

import { useExperience } from '@/lib/experience';

/**
 * Pure-CSS iris that "opens" as the 3D assets load: the aperture widens with progress,
 * a hairline arc traces the percentage, then it dissolves into the real eye.
 */
export function IrisLoader() {
  const progress = useExperience((s) => s.progress);
  const ready = useExperience((s) => s.canvasReady);
  const booting = useExperience((s) => s.booting);
  const p = ready ? 1 : Math.max(0.06, progress / 100);
  const C = 2 * Math.PI * 49;
  return (
    <div
      aria-hidden="true"
      data-anim="loader"
      className={`pointer-events-none absolute top-[34%] left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 md:top-1/2 md:left-[70%] ${
        ready || !booting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative size-[min(42vmin,300px)]">
        <div
          className={`absolute inset-[6%] ${booting && !ready ? 'animate-[spin_14s_linear_infinite]' : ''} rounded-full opacity-80 [background:repeating-conic-gradient(from_0deg,color-mix(in_oklab,var(--iris-b)_70%,transparent)_0deg_2deg,color-mix(in_oklab,var(--iris-a)_60%,transparent)_3deg_5deg)] [mask:radial-gradient(circle,transparent_32%,#000_33%,#000_68%,transparent_70%)]`}
        />
        <div
          className="bg-ink absolute top-1/2 left-1/2 rounded-full shadow-[0_0_0_1px_rgb(255_255_255/0.06)] transition-all duration-700 ease-[var(--ease-out-expo)]"
          style={{
            width: `${66 - p * 40}%`,
            height: `${66 - p * 40}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke="rgb(246 243 238 / 0.08)"
            strokeWidth="0.4"
          />
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke="var(--paper)"
            strokeWidth="0.5"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - p)}
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
      </div>
      <p className="label text-paper/65 mt-5 text-center tabular-nums">{Math.round(p * 100)}%</p>
    </div>
  );
}
