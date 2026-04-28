"use client";

import { Center, useGLTF, useProgress } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { useMoonReady } from "@/context/moon-ready";
import { useMoonBackdropVisualBox } from "@/hooks/useMoonBackdropVisualBox";

/** Cubic ease-in-out on scroll progress — slow start, accelerate through
 *  the middle of the page, slow at the end. Gives every moon transform a
 *  "weighted" feel instead of mapping linearly to scroll. */
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

/** Eagerly start downloading the GLTF on module load so the FallbackMoon
 *  (smooth purple sphere) never visibly pops in before the textured asset. */
useGLTF.preload("/models/moon.glb");

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
  const { scene } = useGLTF("/models/moon.glb");
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

const BASE_CAMERA_Z = 5.4;

function ScrollAndIdleGroup({
  children,
  offsetX,
  idleTimeScale = 1,
  scrollMotionScale = 1,
  scrollZoomScale = 1,
}: {
  children: React.ReactNode;
  offsetX: number;
  idleTimeScale?: number;
  scrollMotionScale?: number;
  /** Drives only size-affecting transforms (posZ, scale, cameraZ). Decoupled
   *  from scrollMotionScale so mobile/tablet can keep rotation but lock size. */
  scrollZoomScale?: number;
}) {
  const group = useRef<THREE.Group>(null);

  const targetRotY = useRef(0);
  const targetRotX = useRef(0);
  const scrollRotY = useRef(0);
  const idleY = useRef(0);

  const targetPosY = useRef(0);
  const targetPosZ = useRef(0);
  const targetScale = useRef(1);

  const targetCamZ = useRef(BASE_CAMERA_Z);
  const targetCamY = useRef(0);

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

  useEffect(() => {
    let rafId: number | null = null;

    const commitScrollTargets = () => {
      rafId = null;
      const el = document.documentElement;
      const max = el.scrollHeight - window.innerHeight;
      const rawP = max > 0 ? window.scrollY / max : 0;
      // Eased progress — premium curve, not linear scroll mapping.
      const p = easeInOutCubic(rawP);

      const reduce = reduceMotionRef.current ? 0.1 : 1;
      const blend = scrollMotionScale * reduce;
      const zoomBlend = scrollZoomScale * reduce;

      // Rotation reduced from ~600° to ~140° over full scroll — cinematic,
      // not dizzying. Moon feels weighted/massive instead of spinning.
      targetRotY.current = p * Math.PI * 0.78 * blend;
      targetRotX.current = p * 0.22 * blend;

      // Subtler vertical drift and depth motion to match the calmer rotation.
      targetPosY.current = (p - 0.5) * 0.32 * blend;
      targetPosZ.current = p * 0.28 * zoomBlend;

      const scaleTop = 1 + 0.058 * zoomBlend;
      const scaleBottom = 1 - 0.024 * zoomBlend;
      targetScale.current = THREE.MathUtils.lerp(scaleTop, scaleBottom, p);

      targetCamZ.current = BASE_CAMERA_Z - p * 0.42 * zoomBlend;
      targetCamY.current = (p - 0.5) * 0.12 * blend;
    };

    const schedule = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(commitScrollTargets);
    };

    commitScrollTargets();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, [scrollMotionScale, scrollZoomScale]);

  useLayoutEffect(() => {
    if (group.current) {
      group.current.position.x = offsetX;
    }
  }, [offsetX]);

  useFrame((state, delta) => {
    const idleMul = reduceMotionRef.current ? 0.18 : 1;
    idleY.current +=
      delta * ((2 * Math.PI) / 24) * idleTimeScale * idleMul;

    // Tighter damping (was 0.058) — moon catches up to scroll quicker but
    // still smooth. Premium feel: snappy, not laggy.
    scrollRotY.current = THREE.MathUtils.lerp(
      scrollRotY.current,
      targetRotY.current,
      0.10,
    );

    if (!group.current) return;

    group.current.rotation.y = scrollRotY.current + idleY.current * 0.2;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      targetRotX.current,
      0.09,
    );

    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      offsetX,
      0.13,
    );
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      targetPosY.current,
      0.13,
    );
    group.current.position.z = THREE.MathUtils.lerp(
      group.current.position.z,
      targetPosZ.current,
      0.13,
    );

    const s = THREE.MathUtils.lerp(
      group.current.scale.x,
      targetScale.current,
      0.10,
    );
    group.current.scale.setScalar(s);

    const cam = state.camera;
    if (cam instanceof THREE.PerspectiveCamera) {
      cam.position.z = THREE.MathUtils.lerp(
        cam.position.z,
        targetCamZ.current,
        0.08,
      );
      cam.position.y = THREE.MathUtils.lerp(
        cam.position.y,
        targetCamY.current,
        0.08,
      );
    }
  });

  return <group ref={group}>{children}</group>;
}

function MoonWorld({
  useFile,
  offsetX,
  sphereSegments,
  idleTimeScale,
  scrollMotionScale,
  scrollZoomScale,
  onReady,
}: {
  useFile: boolean;
  offsetX: number;
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
        idleTimeScale={idleTimeScale}
        scrollMotionScale={scrollMotionScale}
        scrollZoomScale={scrollZoomScale}
      >
        <Suspense fallback={<FallbackMoon segments={sphereSegments} />}>
          {useFile ? <GLTFMoon /> : <FallbackMoon segments={sphereSegments} />}
        </Suspense>
      </ScrollAndIdleGroup>
    </>
  );
}

/** Fades the wrapper opacity through the page so the moon dims behind
 *  text-heavy sections and brightens for hero / contact. Imperative DOM
 *  write — no React state churn during scroll. */
function useScrollOpacity(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    let rafId: number | null = null;

    const apply = () => {
      rafId = null;
      const node = ref.current;
      if (!node) return;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const rawP = max > 0 ? window.scrollY / max : 0;
      const p = easeInOutCubic(rawP);
      // Hero (full) → services/about/portfolio (dimmed) → contact (recover).
      const opacity = sampleKeyframes(p, [1.0, 0.55, 0.55, 0.85]);
      node.style.opacity = String(opacity);
    };

    const schedule = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, [ref]);
}

export function MoonScene({
  offsetX = 0.9,
  dprMax = 2,
  sphereSegments = 64,
  antialias = true,
  idleTimeScale = 1,
  scrollMotionScale = 1,
  scrollZoomScale = 1,
}: {
  offsetX?: number;
  dprMax?: number;
  sphereSegments?: number;
  antialias?: boolean;
  idleTimeScale?: number;
  scrollMotionScale?: number;
  scrollZoomScale?: number;
}) {
  const { markMoonReady } = useMoonReady();
  const [useFile, setUseFile] = useState(false);
  const [checked, setChecked] = useState(false);
  const backdropBox = useMoonBackdropVisualBox();
  const wrapperRef = useRef<HTMLDivElement>(null);
  useScrollOpacity(wrapperRef);

  useEffect(() => {
    let cancelled = false;
    fetch("/models/moon.glb", { method: "HEAD" })
      .then((res) => {
        if (!cancelled && res.ok) setUseFile(true);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markMoonReady();
    }
  }, [checked, markMoonReady]);

  if (!checked) {
    return null;
  }

  const invScale = backdropBox.scale > 0 ? 1 / backdropBox.scale : 1;
  const innerW = Math.max(1, backdropBox.innerW);
  const innerH = Math.max(1, backdropBox.innerH);

  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none fixed z-[1] overflow-hidden"
      style={{
        left: backdropBox.offsetLeft,
        top: backdropBox.offsetTop,
        width: Math.max(1, backdropBox.outerW),
        height: Math.max(1, backdropBox.outerH),
        transform: `scale(${invScale})`,
        transformOrigin: "top left",
        willChange: "transform, opacity",
      }}
      aria-hidden
    >
      <div className="overflow-hidden" style={{ width: innerW, height: innerH }}>
        <Canvas
          camera={{ position: [0, 0, BASE_CAMERA_Z], fov: 40 }}
          dpr={[1, dprMax]}
          resize={{ scroll: false }}
          gl={{
            alpha: true,
            antialias,
            powerPreference: "high-performance",
          }}
          style={{ background: "transparent", width: "100%", height: "100%" }}
        >
          <MoonWorld
            useFile={useFile}
            offsetX={offsetX}
            sphereSegments={sphereSegments}
            idleTimeScale={idleTimeScale}
            scrollMotionScale={scrollMotionScale}
            scrollZoomScale={scrollZoomScale}
            onReady={markMoonReady}
          />
        </Canvas>
      </div>
    </div>
  );
}
