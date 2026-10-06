import { Fragment } from 'react';

type Props = {
  lines: readonly string[];
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  id?: string;
  anim?: string;
  /** Focus-pull in when scrolled into view (content sections, not the scrubbed story). */
  focusIn?: boolean;
};

/** `*word*` → <em>word</em>. Keeps copy in config readable while giving headlines their italic voice. */
export function Emph({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('*') && p.endsWith('*') ? (
          <em key={i}>{p.slice(1, -1)}</em>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** Plain text (no emphasis markers) — for aria labels, meta and JSON-LD. */
export const plain = (text: string) => text.replace(/\*/g, '');

/** Headline split into lines; the timeline focus-pulls each line's characters into place. */
export function MaskLines({ lines, as: Tag = 'h2', className = '', id, anim, focusIn }: Props) {
  return (
    <Tag id={id} className={className} data-anim={anim} data-focus-in={focusIn ? '' : undefined}>
      {lines.map((l, i) => (
        <span key={i} className="mask-line">
          <span>
            <Emph text={l} />
          </span>
        </span>
      ))}
    </Tag>
  );
}
