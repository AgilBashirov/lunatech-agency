"use client";

import { Center, useGLTF, useProgress } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ErrorInfo,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { useMoonReady } from "@/context/moon-ready";

/** Cubic ease-in-out. Used only for the wrapper-opacity keyframe sweep
 *  (hero → mid → contact); moon transforms map LINEARLY to scroll so the
 *  velocity feel is preserved (fast scroll → big rotation gap → fast spin). */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Linear interpolation between evenly-spaced keyframes over [0, 1].
 *  Used to drive wrapper opacity through the page (hero bright → mid sections
 *  dim → contact bright). */
function sampleKeyframes(t: number, kf: ReadonlyArray<number>): number {
  const tt = Math.min(1, Math.max(0, t));
  const n = kf.length - 1;
  if (n <= 0) return kf[0];
  const segIdx = Math.min(n - 1, Math.floor(tt * n));
  const segT = tt * n - segIdx;
  return kf[segIdx] + (kf[segIdx + 1] - kf[segIdx]) * segT;
}

/** Cached scrollable range (scrollHeight - innerHeight). Updated on resize and
 *  on `load` (covers late-mounting images / WebGL canvases that grow the page).
 *  Reading this each frame previously forced a layout flush — caching it lets
 *  `useFrame` read only `scrollY`, which the browser tracks for free. */
let cachedScrollMax = 0;
let scrollMaxBound = false;

function recomputeScrollMax() {
  const el = document.documentElement;
  cachedScrollMax = Math.max(0, el.scrollHeight - window.innerHeight);
}

function ensureScrollMaxBound() {
  if (scrollMaxBound || typeof window === "undefined") return;
  scrollMaxBound = true;
  recomputeScrollMax();
  window.addEventListener("resize", recomputeScrollMax, { passive: true });
  window.addEventListener("load", recomputeScrollMax);
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(recomputeScrollMax);
    ro.observe(document.documentElement);
  }
}

/** Read normalized scroll progress [0, 1] directly from the document.
 *  Sampling on every animation frame (not on scroll events) makes the moon
 *  deterministic — there is no scroll listener that can be torn down,
 *  re-bound, or miss events while Lenis is mid-interpolation. */
function readScrollProgress(): number {
  if (cachedScrollMax <= 0) return 0;
  const y = window.scrollY || document.documentElement.scrollTop || 0;
  return Math.min(1, Math.max(0, y / cachedScrollMax));
}

const MOON_GLB = "/models/moon.glb";

function MoonLoadGate({ onReady }: { onReady: () => void }) {
  const { active, progress } = useProgress();
  const fired = useRef(false);
  const frames = useRef(0);
  const activeRef = useRef(active);
  const progressRef = useRef(progress);

  useLayoutEffect(() => {
    activeRef.current = active;
    progressRef.current = progress;
  }, [active, progress]);

  useEffect(() => {
    if (fired.current) return;
    if (!active && progress >= 100) {
      fired.current = true;
      onReady();
    }
  }, [active, progress, onReady]);

  useEffect(() => {
    if (fired.current) return;
    const t = window.setTimeout(() => {
      if (fired.current) return;
      fired.current = true;
      onReady();
    }, 8000);
    return () => window.clearTimeout(t);
  }, [onReady]);

  useFrame(() => {
    if (fired.current) return;
    frames.current += 1;
    if (
      frames.current >= 48 &&
      !activeRef.current &&
      progressRef.current < 100
    ) {
      fired.current = true;
      onReady();
    }
  });

  return null;
}

/** Opaque PBR — avoids transparency sorting artifacts on layered GLTF meshes. */
function softenMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const m of mats) {
      if (
        m instanceof THREE.MeshStandardMaterial ||
        m instanceof THREE.MeshPhysicalMaterial
      ) {
        m.transparent = false;
        m.opacity = 1;
        m.depthWrite = true;
        m.roughness = Math.min(1, m.roughness + 0.08);
        m.metalness = Math.max(0, m.metalness - 0.06);
      }
    }
  });
}

function FallbackMoon({ segments = 64 }: { segments?: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.05;
  });
  return (
    <mesh ref={mesh} scale={1.15}>
      <sphereGeometry args={[1, segments, segments]} />
      <meshStandardMaterial
        color="#c4c4cc"
        roughness={0.9}
        metalness={0.12}
        emissive="#2a1f38"
        emissiveIntensity={0.38}
      />
    </mesh>
  );
}

function GLTFMoon() {
  const { scene } = useGLTF(MOON_GLB);
  const clone = useMemo(() => {
    const c = scene.clone();
    softenMaterials(c);
    return c;
  }, [scene]);

  return (
    <Center>
      <primitive object={clone} scale={1.15} />
    </Center>
  );
}

/**
 * R3F-compatible error boundary for the GLTF subtree.
 *
 * Why: drei's `useGLTF` throws synchronously when the asset fetch fails (404,
 * malformed GLB, network error). `<Suspense>` only catches the loading
 * promise, not the throw — without this boundary the whole `<Canvas>` would
 * unmount and the moon would silently disappear.
 *
 * The boundary keeps the canvas mounted by swapping in `<FallbackMoon>` (the
 * same primitive shape used during initial load), and signals readiness to
 * the page so the loader screen never gets stuck.
 */
class GLTFMoonErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: true } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (typeof console !== "undefined") {
      console.warn("[MoonScene] GLTF load failed, falling back:", error, info);
    }
    this.props.onError?.();
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const BASE_CAMERA_Z = 5.4;

/**
 * Drives moon rotation, position, scale, and camera every animation frame.
 *
 * Why no scroll listener: scroll progress is sampled inside `useFrame`
 * straight from the document each tick. That removes every failure mode tied
 * to event-driven updates (Lenis smooth scroll fires its own cadence; React
 * effect re-binds during prop changes briefly leave windows with no
 * listener; tab-visibility transitions skip ticks). The moon now updates as
 * long as R3F's render loop runs — which is exactly when the moon is
 * visible.
 *
 * Why props are mirrored to refs: tier changes (mobile→tablet→desktop) flow
 * in as new prop values, but we never want them to invalidate `useFrame`.
 * Mirror them once per render via `useLayoutEffect` and read from refs in
 * the frame loop.
 */
function ScrollAndIdleGroup({
  children,
  offsetX,
  baseScale = 1,
  idleTimeScale = 1,
  scrollMotionScale = 1,
  scrollZoomScale = 1,
}: {
  children: React.ReactNode;
  offsetX: number;
  /** Per-tier moon scale baked in at mount; not affected by scroll. Locks the
   *  visual size on mobile/tablet so the moon never grows or shrinks. */
  baseScale?: number;
  idleTimeScale?: number;
  scrollMotionScale?: number;
  /** Drives only size-affecting transforms (posZ, scale, cameraZ). Decoupled
   *  from scrollMotionScale so mobile/tablet can keep rotation but lock size. */
  scrollZoomScale?: number;
}) {
  const group = useRef<THREE.Group>(null);

  // Param refs — written by useLayoutEffect, read in useFrame. This decouples
  // tier prop changes from the per-frame loop so no listener is ever rebound.
  const offsetXRef = useRef(offsetX);
  const baseScaleRef = useRef(baseScale);
  const idleTimeScaleRef = useRef(idleTimeScale);
  const scrollMotionScaleRef = useRef(scrollMotionScale);
  const scrollZoomScaleRef = useRef(scrollZoomScale);

  useLayoutEffect(() => {
    offsetXRef.current = offsetX;
    baseScaleRef.current = baseScale;
    idleTimeScaleRef.current = idleTimeScale;
    scrollMotionScaleRef.current = scrollMotionScale;
    scrollZoomScaleRef.current = scrollZoomScale;
  }, [offsetX, baseScale, idleTimeScale, scrollMotionScale, scrollZoomScale]);

  // Animated state — updated every frame via lerp toward fresh targets.
  const scrollRotY = useRef(0);
  const idleY = useRef(0);

  const reduceMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reduceMotionRef.current = mq.matches;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Place the group at its baseline position/scale on mount (and when tier
  // changes) so first paint is correct without waiting on the lerp ramp-up.
  useLayoutEffect(() => {
    const g = group.current;
    if (!g) return;
    g.position.x = offsetX;
    g.scale.setScalar(baseScale);
  }, [offsetX, baseScale]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const reduce = reduceMotionRef.current;
    const reduceMul = reduce ? 0.1 : 1;
    const idleMul = reduce ? 0.18 : 1;

    // Idle rotation — moon spins on its own continuously. No modulo: the
    // value is multiplied by 0.2 below, so wrapping would cause a visible
    // 72° snap once per revolution. Three.js handles big floats fine.
    idleY.current +=
      delta * ((2 * Math.PI) / 24) * idleTimeScaleRef.current * idleMul;

    // Linear scroll progress — no easing. The velocity feel comes from the
    // soft damping below: target moves linearly with scroll, current chases
    // it; fast scroll creates a big gap → moon spins fast. Reverse scroll
    // → target reverses → moon spins the other way.
    const p = readScrollProgress();

    const blend = scrollMotionScaleRef.current * reduceMul;
    const zoomBlend = scrollZoomScaleRef.current * reduceMul;
    const base = baseScaleRef.current;

    // Rotation coefficient (~1.5π ≈ 270° over full scroll). The "moon spins
    // as you scroll" feel is preserved by the soft damping below, just at a
    // calmer rotation rate. Tune this single number to dial spin speed
    // up/down without touching damping.
    const targetRotY = p * Math.PI * 1.5 * blend;
    const targetRotX = p * 0.42 * blend;

    const targetPosY = (p - 0.5) * 0.42 * blend;
    const targetPosZ = p * 0.34 * zoomBlend;

    // Scale stays tied to baseScale; zoomBlend is 0 on mobile/tablet so the
    // moon never grows or shrinks at those breakpoints.
    const scaleTop = base * (1 + 0.058 * zoomBlend);
    const scaleBottom = base * (1 - 0.024 * zoomBlend);
    const targetScale = THREE.MathUtils.lerp(scaleTop, scaleBottom, p);

    const targetCamZ = BASE_CAMERA_Z - p * 0.52 * zoomBlend;
    const targetCamY = (p - 0.5) * 0.16 * blend;

    // Soft damping. Smaller fraction = bigger trailing gap during fast
    // scroll = more dramatic catch-up spin. This is the original "premium
    // motion" feel from the very first moon implementation.
    scrollRotY.current = THREE.MathUtils.lerp(
      scrollRotY.current,
      targetRotY,
      0.058,
    );

    g.rotation.y = scrollRotY.current + idleY.current * 0.2;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetRotX, 0.048);

    g.position.x = THREE.MathUtils.lerp(g.position.x, offsetXRef.current, 0.085);
    g.position.y = THREE.MathUtils.lerp(g.position.y, targetPosY, 0.078);
    g.position.z = THREE.MathUtils.lerp(g.position.z, targetPosZ, 0.072);

    const s = THREE.MathUtils.lerp(g.scale.x, targetScale, 0.06);
    g.scale.setScalar(s);

    const cam = state.camera;
    if (cam instanceof THREE.PerspectiveCamera) {
      cam.position.z = THREE.MathUtils.lerp(cam.position.z, targetCamZ, 0.055);
      cam.position.y = THREE.MathUtils.lerp(cam.position.y, targetCamY, 0.05);
    }
  });

  return <group ref={group}>{children}</group>;
}

function MoonWorld({
  offsetX,
  baseScale,
  sphereSegments,
  idleTimeScale,
  scrollMotionScale,
  scrollZoomScale,
  onReady,
}: {
  offsetX: number;
  baseScale: number;
  sphereSegments: number;
  idleTimeScale: number;
  scrollMotionScale: number;
  scrollZoomScale: number;
  onReady: () => void;
}) {
  return (
    <>
      <MoonLoadGate onReady={onReady} />
      <ambientLight intensity={0.14} />
      <hemisphereLight args={["#c4d2ea", "#1a1028", 0.52]} />
      <directionalLight
        position={[6, 2, 9]}
        intensity={0.92}
        color="#f4f4f5"
      />
      <directionalLight
        position={[-4, 2, 5]}
        intensity={0.2}
        color="#6a9bd4"
      />
      <ScrollAndIdleGroup
        offsetX={offsetX}
        baseScale={baseScale}
        idleTimeScale={idleTimeScale}
        scrollMotionScale={scrollMotionScale}
        scrollZoomScale={scrollZoomScale}
      >
        {/* FallbackMoon renders immediately while Suspense waits for useGLTF.
         *  Once GLTFMoon resolves, Suspense settles and the textured asset
         *  takes over. If GLTF fetch errors, the GLTFMoonErrorBoundary keeps
         *  the fallback visible (FallbackMoon is the safe shape either way)
         *  AND signals onReady so the page loader doesn't sit indefinitely
         *  waiting for an asset that will never resolve. */}
        <GLTFMoonErrorBoundary
          fallback={<FallbackMoon segments={sphereSegments} />}
          onError={onReady}
        >
          <Suspense fallback={<FallbackMoon segments={sphereSegments} />}>
            <GLTFMoon />
          </Suspense>
        </GLTFMoonErrorBoundary>
      </ScrollAndIdleGroup>
    </>
  );
}

/** rAF loop that reads scroll directly and writes wrapper opacity.
 *  Suspended via IntersectionObserver when the wrapper is off-screen so the
 *  loop costs nothing while the moon isn't visible. No scroll listener — same
 *  rationale as the moon transforms: deterministic, immune to event-driven
 *  gaps, no double-bound listeners. */
function useScrollOpacity(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let rafId = 0;
    let lastWritten = -1;
    let intersecting = true;

    const tick = () => {
      const p = easeInOutCubic(readScrollProgress());
      // Hero (full) → services/about/portfolio (dimmed) → contact (recover).
      const opacity = sampleKeyframes(p, [1.0, 0.55, 0.55, 0.85]);
      if (Math.abs(opacity - lastWritten) > 0.0015) {
        node.style.opacity = String(opacity);
        lastWritten = opacity;
      }
      if (intersecting) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    const start = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            intersecting = entry.isIntersecting;
            if (intersecting) start();
            else stop();
          }
        },
        { threshold: 0 },
      );
      io.observe(node);
    } else {
      start();
    }

    return () => {
      stop();
      io?.disconnect();
    };
  }, [ref]);
}

export function MoonScene({
  offsetX = 0.9,
  baseScale = 1,
  dprMax = 2,
  sphereSegments = 64,
  antialias = true,
  idleTimeScale = 1,
  scrollMotionScale = 1,
  scrollZoomScale = 1,
}: {
  offsetX?: number;
  /** Per-tier moon size — locked at this value on mobile/tablet (zoomBlend=0). */
  baseScale?: number;
  dprMax?: number;
  sphereSegments?: number;
  antialias?: boolean;
  idleTimeScale?: number;
  scrollMotionScale?: number;
  scrollZoomScale?: number;
}) {
  const { markMoonReady } = useMoonReady();
  const wrapperRef = useRef<HTMLDivElement>(null);
  useScrollOpacity(wrapperRef);

  // Client-side bootstrap: bind cached scroll-max listeners and start the GLTF
  // download. Both are window-bound; running them at module-load would break
  // SSR and would also fire before the page has any scrollable content.
  useEffect(() => {
    ensureScrollMaxBound();
    useGLTF.preload(MOON_GLB);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markMoonReady();
    }
  }, [markMoonReady]);

  return (
    <div
      ref={wrapperRef}
      // moon-backdrop applies `height: 100lvh` (with `100vh` fallback) so the
      // wrapper has a stable size that does NOT change when mobile browser UI
      // shows/hides. Without this, iOS address-bar collapse would resize the
      // canvas mid-scroll and the moon would visibly grow/shrink.
      className="moon-backdrop pointer-events-none fixed inset-x-0 top-0 z-[1] overflow-hidden"
      style={{ willChange: "opacity" }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, BASE_CAMERA_Z], fov: 40 }}
        dpr={[1, dprMax]}
        resize={{ scroll: false }}
        gl={{
          alpha: true,
          antialias,
          powerPreference: "high-performance",
        }}
        onCreated={({ camera, size }) => {
          // At wide aspect ratios (>1920px or ultrawide monitors) the default
          // fov=40 frustum is too narrow horizontally — the moon, positioned
          // at offsetX world units, projects past the right edge of the
          // viewport. Widening fov re-frames it inside the hero's right column.
          if (camera instanceof THREE.PerspectiveCamera) {
            const aspect = size.width / size.height;
            camera.fov = aspect > 2 ? 52 : aspect > 1.78 ? 46 : 40;
            camera.updateProjectionMatrix();
          }
        }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <MoonWorld
          offsetX={offsetX}
          baseScale={baseScale}
          sphereSegments={sphereSegments}
          idleTimeScale={idleTimeScale}
          scrollMotionScale={scrollMotionScale}
          scrollZoomScale={scrollZoomScale}
          onReady={markMoonReady}
        />
      </Canvas>
    </div>
  );
}
