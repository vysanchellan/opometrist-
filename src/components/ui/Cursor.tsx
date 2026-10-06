'use client';

import { useEffect, useRef } from 'react';

type Mode = 'default' | 'hover' | 'scene' | 'drag' | 'text';

/**
 * Pupil cursor: dilates over interactive elements, constricts over the 3D scene,
 * becomes a "drag" lens over sliders/carousels. Fine pointers only; never on touch.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const pupil = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;
    const html = document.documentElement;
    html.dataset.cursorReady = 'on';

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    let mode: Mode = 'default';
    let visible = false;
    let raf = 0;

    const setMode = (m: Mode) => {
      if (m === mode) return;
      mode = m;
      const r = ring.current;
      const p = pupil.current;
      if (!r || !p || !label.current) return;
      r.dataset.mode = m;
      label.current.textContent = m === 'drag' ? 'Drag' : '';
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        ring.current?.style.setProperty('opacity', '1');
        pupil.current?.style.setProperty('opacity', '1');
      }
      const t = e.target as HTMLElement | null;
      if (!t?.closest) return;
      if (t.closest('[data-cursor="drag"]')) setMode('drag');
      else if (t.closest('input, textarea')) setMode('text');
      else if (t.closest('a, button, select, label, [role="slider"], [data-cursor="hover"]'))
        setMode('hover');
      else if (t.closest('[data-cursor="scene"]')) setMode('scene');
      else setMode('default');
    };
    const onLeave = () => {
      visible = false;
      ring.current?.style.setProperty('opacity', '0');
      pupil.current?.style.setProperty('opacity', '0');
    };
    const onDown = () => ring.current?.style.setProperty('--press', '0.82');
    const onUp = () => ring.current?.style.setProperty('--press', '1');

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.2;
      ringPos.y += (pos.y - ringPos.y) * 0.2;
      if (ring.current)
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      if (pupil.current) pupil.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      delete html.dataset.cursorReady;
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] hidden [@media(pointer:fine)]:block"
    >
      <style>{`
        .cur-ring{position:fixed;left:0;top:0;opacity:0;transition:opacity .3s}
        .cur-ring>i{position:absolute;width:var(--s,30px);height:var(--s,30px);margin:calc(var(--s,30px)/-2) 0 0 calc(var(--s,30px)/-2);border-radius:999px;
          transform:scale(var(--press,1)) rotate(var(--rot,0deg));
          transition:width .5s cubic-bezier(.16,1,.3,1),height .5s cubic-bezier(.16,1,.3,1),margin .5s cubic-bezier(.16,1,.3,1),opacity .3s,transform .5s cubic-bezier(.16,1,.3,1)}
        /* reticle: hairline circle + four ticks */
        .cur-ring>i.ret{border:1px solid var(--paper);mix-blend-mode:difference;
          background:
            linear-gradient(var(--paper),var(--paper)) 50% -1px/1px 7px no-repeat,
            linear-gradient(var(--paper),var(--paper)) 50% calc(100% + 1px)/1px 7px no-repeat,
            linear-gradient(var(--paper),var(--paper)) -1px 50%/7px 1px no-repeat,
            linear-gradient(var(--paper),var(--paper)) calc(100% + 1px) 50%/7px 1px no-repeat}
        /* iris: appears (and dilates) over anything you can press */
        .cur-ring>i.iris{opacity:0;background:conic-gradient(from 200deg,var(--iris-b),var(--iris-c),var(--iris-a),var(--iris-c),var(--iris-b));
          -webkit-mask:radial-gradient(circle,transparent calc(var(--hole,6px) - .5px),#000 var(--hole,6px));mask:radial-gradient(circle,transparent calc(var(--hole,6px) - .5px),#000 var(--hole,6px));
          transition:width .5s cubic-bezier(.16,1,.3,1),height .5s cubic-bezier(.16,1,.3,1),margin .5s cubic-bezier(.16,1,.3,1),opacity .35s,-webkit-mask .5s,mask .5s}
        .cur-ring[data-mode=scene]>i.ret{--s:22px;--rot:45deg}
        .cur-ring[data-mode=hover]>i.ret{--s:70px;opacity:.5}
        .cur-ring[data-mode=hover]>i.iris{--s:54px;--hole:21px;opacity:.85}
        .cur-ring[data-mode=drag]>i.ret{--s:92px}
        .cur-ring[data-mode=drag]>i.iris{--s:82px;--hole:39px;opacity:.55}
        .cur-ring[data-mode=text]>i{--s:8px;opacity:0}
        .cur-label{position:absolute;left:0;top:0;transform:translate(-50%,-50%);font:400 9px/1 var(--font-mono);letter-spacing:.16em;text-transform:uppercase;color:var(--paper);mix-blend-mode:difference}
        .cur-pupil{position:fixed;left:0;top:0;opacity:0;transition:opacity .3s}
        .cur-pupil>div{width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:999px;background:var(--paper);mix-blend-mode:difference}
      `}</style>
      <div ref={ring} className="cur-ring" data-mode="default">
        <i className="iris" />
        <i className="ret" />
        <span ref={label} className="cur-label" />
      </div>
      <div ref={pupil} className="cur-pupil">
        <div />
      </div>
    </div>
  );
}
