'use client';

import { effectiveTier, setTierSetting, useExperience, type TierSetting } from '@/lib/experience';

const OPTIONS: { id: TierSetting; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

/** Manual 3D quality override (saved on this device only). */
export function QualityToggle() {
  const setting = useExperience((s) => s.tierSetting);
  const tier = useExperience(effectiveTier);
  const webgl = useExperience((s) => s.webgl);
  if (!webgl)
    return <p className="text-paper/65 text-xs">3D off: your browser doesn’t support WebGL.</p>;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="label text-paper/65" id="q-label">
        Visual quality
      </span>
      <div
        role="radiogroup"
        aria-labelledby="q-label"
        className="ring-paper/15 flex rounded-full p-1 ring-1"
      >
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={setting === o.id}
            onClick={() => setTierSetting(o.id)}
            className={`min-h-9 rounded-full px-3 text-xs transition ${
              setting === o.id ? 'bg-paper text-ink' : 'text-paper/65 hover:text-paper'
            }`}
            data-cursor="hover"
          >
            {o.label}
            {o.id === 'auto' && setting === 'auto' ? (
              <span className="opacity-60"> · {tier}</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
