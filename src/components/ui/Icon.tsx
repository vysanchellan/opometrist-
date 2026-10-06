import type { ServiceIcon } from '@/config/practice';

export type IconName =
  | ServiceIcon
  | 'whatsapp'
  | 'phone'
  | 'arrow'
  | 'arrow-down'
  | 'pin'
  | 'clock'
  | 'check'
  | 'chevron-left'
  | 'chevron-right'
  | 'mail'
  | 'access';

const paths: Record<IconName, React.ReactNode> = {
  exam: (
    <>
      <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v1.6M12 20.4V22M4.5 4.5l1 1M18.5 18.5l1 1" />
    </>
  ),
  contacts: (
    <>
      <path d="M4 15.5c0-5 3.6-9 8-9s8 4 8 9" />
      <path d="M4 15.5c2.3 1.6 5 2.4 8 2.4s5.7-.8 8-2.4" />
      <path d="M9 10.5c.8-.9 1.8-1.4 3-1.4" />
    </>
  ),
  kids: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="9" cy="10.5" r="1.4" />
      <circle cx="15" cy="10.5" r="1.4" />
      <path d="M8.8 14.6c.9 1.2 1.9 1.8 3.2 1.8s2.3-.6 3.2-1.8" />
      <path d="M12 3.5c-1 .9-1.2 2-.6 3" />
    </>
  ),
  frames: (
    <>
      <circle cx="6.8" cy="13.2" r="3.8" />
      <circle cx="17.2" cy="13.2" r="3.8" />
      <path d="M10.6 12.6c.9-.7 1.9-.7 2.8 0M3 12.2 2 8.5M21 12.2l1-3.7" />
    </>
  ),
  repairs: (
    <>
      <path d="m14.5 6.5 3-3 3 3-3 3" />
      <path d="M17.5 9.5 8 19a2.1 2.1 0 0 1-3-3l9.5-9.5" />
      <path d="M4 4l4 4" />
    </>
  ),
  health: (
    <>
      <path d="M12 21s-7.5-3.6-7.5-10V5.5L12 3l7.5 2.5V11c0 6.4-7.5 10-7.5 10Z" />
      <path d="M7.5 12h2.2l1.3-2.6 2 5 1.3-2.4h2.2" />
    </>
  ),
  retina: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="9" cy="12" r="1.6" />
      <path d="M10.4 11.2c2-1.6 4.4-2.6 7.6-2.7M10.4 12.8c2 1.6 4.4 2.6 7.6 2.7M9.5 10.5c.6-2.2 1.9-4 3.6-5.3M9.5 13.5c.6 2.2 1.9 4 3.6 5.3" />
      <circle cx="15" cy="12" r=".9" />
    </>
  ),
  pressure: (
    <>
      <path d="M4 16a8 8 0 1 1 16 0" />
      <path d="m12 16 4-5" />
      <circle cx="12" cy="16" r="1.2" />
      <path d="M6.5 11.5l1 .8M12 8v1.3M17.5 11.5l-1 .8" />
    </>
  ),
  drop: (
    <>
      <path d="M12 3.2s6 6.4 6 10.6a6 6 0 0 1-12 0c0-4.2 6-10.6 6-10.6Z" />
      <path d="M9.2 14.2a2.9 2.9 0 0 0 2.8 2.6" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3.5 20.5 4.8 16A8.5 8.5 0 1 1 8 19.3l-4.5 1.2Z" />
      <path d="M9 8.6c0 3.2 3 6.4 6.3 6.4l1.1-1.6-1.9-1-1 .8c-1-.5-1.9-1.3-2.4-2.4l.8-1-.9-2L9.6 8" />
    </>
  ),
  phone: (
    <path d="M5 3.5h3.2l1.6 4.1-2 1.3a10.4 10.4 0 0 0 5.3 5.3l1.3-2 4.1 1.6V17a2.5 2.5 0 0 1-2.7 2.5A15.6 15.6 0 0 1 2.5 6.2 2.5 2.5 0 0 1 5 3.5Z" />
  ),
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  'arrow-down': <path d="M12 4v15M6 13l6 6 6-6" />,
  pin: (
    <>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  check: <path d="m5 12.5 4.2 4.2L19 7" />,
  'chevron-left': <path d="m14.5 6-6 6 6 6" />,
  'chevron-right': <path d="m9.5 6 6 6-6 6" />,
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  access: (
    <>
      <circle cx="12" cy="4.5" r="1.6" />
      <path d="M5 8.5h14M12 8.5v5.5M12 14l-3.5 6.5M12 14l3.5 6.5" />
    </>
  ),
};

export function Icon({
  name,
  className = 'size-5',
  strokeWidth = 1.5,
  title,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
