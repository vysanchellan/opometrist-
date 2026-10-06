'use client';

import { Environment, Lightformer, PerformanceMonitor, useProgress } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { theme } from '@/config/theme';
import { disableWebgl, experience, isSoftwareRenderer } from '@/lib/experience';
import { getGsap } from '@/lib/gsap';
import { story } from '@/lib/story';
import { useQualityTier } from '@/lib/useQualityTier';
import { Eye } from './Eye';
import { PostFX } from './PostFX';
import { Rig } from './Rig';

/** Studio HDRI (Poly Haven, CC0) + a window-shaped light the cornea reflects. */
function Env({ hdri }: { hdri: boolean }) {
  return (
    <Environment
      files={hdri ? '/hdri/studio.hdr' : undefined}
      resolution={256}
      frames={1}
      environmentIntensity={0.85}
    >
      {/* the "window": four panes, slightly warm */}
      {[
        [-0.55, 0.42],
        [0.55, 0.42],
        [-0.55, -0.42],
        [0.55, -0.42],
      ].map(([x, y], i) => (
        <Lightformer
          key={i}
          form="rect"
          intensity={5}
          color="#fff3e2"
          position={[2.6 + x!, 2.1 + y!, 4.5]}
          scale={[1, 0.75, 1]}
          target={[0, 0, 0]}
        />
      ))}
      {/* ring light: the circular catchlight every exam room (and portrait studio) leaves in an eye */}
      <Lightformer
        form="ring"
        intensity={4}
        color="#ffffff"
        position={[-1.6, 1.5, 4.6]}
        scale={1.15}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="ring"
        intensity={0.5}
        color={theme.irisB}
        position={[-4, -1.5, 2]}
        scale={2}
        target={[0, 0, 0]}
      />
      <Lightformer
        form="rect"
        intensity={0.8}
        color={theme.irisA}
        position={[0, -4, 1]}
        scale={[6, 1, 1]}
        target={[0, 0, 0]}
      />
    </Environment>
  );
}

/** A point light that follows the pointer — the user is the light source. */
function PointerLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const p = story.pointer;
    if (!light.current) return;
    light.current.position.set(p.x * 3.2 + story.cam.x, p.y * 2.2 + story.cam.y, story.cam.z - 1.2);
    light.current.intensity = p.active ? 5 : 2;
  });
  return <pointLight ref={light} color="#fff1dc" distance={9} decay={1.6} />;
}

function Ready() {
  const frames = useRef(0);
  const { progress, active } = useProgress();
  useEffect(() => {
    experience.set({ progress });
  }, [progress]);
  useFrame(() => {
    frames.current++;
    if (frames.current >= 3 && !active && !experience.get().canvasReady) {
      performance.mark('iris:ready');
      experience.set({ canvasReady: true, progress: 100 });
    }
  });
  return null;
}

/**
 * Compile every shader program asynchronously (KHR_parallel_shader_compile) before the
 * first frame, so the main thread never freezes on a giant synchronous link.
 */
function Precompile({ onDone }: { onDone: () => void }) {
  const gl = useThree((st) => st.gl);
  const scene = useThree((st) => st.scene);
  const camera = useThree((st) => st.camera);
  useEffect(() => {
    let alive = true;
    const t = window.setTimeout(() => {
      performance.mark('iris:compile-start');
      gl.compileAsync(scene, camera)
        .then(() => performance.mark('iris:compile-end'))
        .catch(() => undefined)
        .finally(() => alive && onDone());
    }, 0);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [gl, scene, camera, onDone]);
  return null;
}

/** Pause rendering while an opaque section fully covers the canvas. */
function useCoveredFrameloop() {
  const [loop, setLoop] = useState<'always' | 'never'>('always');
  useEffect(() => {
    const { gsap } = getGsap();
    let cur: 'always' | 'never' = 'always';
    const tick = () => {
      const want = story.covered ? 'never' : 'always';
      if (want !== cur) {
        cur = want;
        setLoop(want);
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return loop;
}

/** If WebGL context creation (or anything in the 3D tree) throws, quietly fall back to static. */
class CanvasBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    disableWebgl(String(error));
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function EyeCanvas({ mode }: { mode: 'fixed' | 'hero' }) {
  const q = useQualityTier();
  const covered = useCoveredFrameloop();
  const [compiled, setCompiled] = useState(false);
  const onCompiled = useCallback(() => setCompiled(true), []);
  // PerformanceMonitor only scales resolution (and drops post as a last resort) —
  // it never rebuilds geometry or shaders, so there are no hitches mid-scroll.
  const [dpr, setDpr] = useState(q.dpr[1]);
  const [postOff, setPostOff] = useState(false);
  useEffect(() => setDpr(q.dpr[1]), [q.dpr]);
  const frameloop = compiled ? covered : 'never';

  return (
    <div
      id="eye-canvas"
      aria-hidden="true"
      className={
        mode === 'fixed'
          ? 'pointer-events-none fixed inset-0 z-0 h-lvh w-full'
          : 'pointer-events-none absolute inset-x-0 top-0 z-0 h-svh w-full'
      }
      style={{ opacity: 0 }}
    >
      <CanvasBoundary>
        <Canvas
          dpr={dpr}
          frameloop={frameloop}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false,
            stencil: false,
          }}
          camera={{ fov: 35, position: [0, 0, 5.2], near: 0.02, far: 40 }}
          onCreated={(state) => {
            const { gl } = state;
            const dbg = (window as unknown as { __iris?: Record<string, unknown> }).__iris;
            if (dbg) dbg.three = state;
            // Reading shader info logs forces a synchronous compile and defeats parallel
            // compilation (measured: ~3s of main-thread time on boot). Dev keeps the checks.
            if (isSoftwareRenderer(gl.getContext())) {
              disableWebgl('software renderer');
              return;
            }
            gl.debug.checkShaderErrors = process.env.NODE_ENV !== 'production';
            gl.toneMapping = THREE.NeutralToneMapping;
            gl.setClearColor(theme.ink);
          }}
          style={{ pointerEvents: 'none' }}
        >
          <PerformanceMonitor
            flipflops={3}
            bounds={(refresh) => (refresh > 90 ? [50, 80] : [42, 56])}
            onChange={({ factor }) =>
              setDpr(Math.round((q.dpr[0] + (q.dpr[1] - q.dpr[0]) * factor) * 4) / 4)
            }
            onFallback={() => setPostOff(true)}
          />
          <ambientLight intensity={0.12} />
          <directionalLight position={[3, 4, 5]} intensity={2.2} color="#fff0de" />
          <directionalLight position={[-4, 1, -3]} intensity={1.6} color={theme.irisB} />
          <PointerLight />
          <Suspense fallback={null}>
            <Env hdri={q.hdri} />
            <Eye q={q} />
            <Precompile onDone={onCompiled} />
            <Ready />
          </Suspense>
          <Rig />
          {q.post && !postOff ? (
            <PostFX post={q.post} multisampling={q.tier === 'high' ? 4 : 0} />
          ) : null}
        </Canvas>
      </CanvasBoundary>
    </div>
  );
}
