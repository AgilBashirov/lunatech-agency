"use client";

import { Center, useGLTF } from "@react-three/drei";
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

/**
 * Fires `onReady` on the first WebGL render frame. Replaces the previous
 * `MoonLoadGate` which relied on drei's `useProgress` — that hook tracks
 * `THREE.DefaultLoadingManager` events, and now that we no longer load any
 * external resource (no GLB), the progress event never reaches 100, so the
 * "ready" callback was never firing and the hero placeholder glow stayed
 * stuck on top of the moon.
 *
 * For a procedural mesh the right "ready" moment is simply when the renderer
 * has produced its first frame — that's exactly what `useFrame` gives us.
 */
function MoonReadyOnFirstFrame({ onReady }: { onReady: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    onReady();
  });
  return null;
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

/**
 * Cleans up the loaded GLB so the layered meshes render correctly under our
 * lighting rig (some authoring tools leave transparency / depthWrite settings
 * that cause z-fighting on a sphere with multiple texture passes).
 */
function softenMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
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

/**
 * High-fidelity moon model. Loaded lazily via Suspense — while the GLB is
 * downloading, `FallbackMoon` is shown by the parent `<Suspense>` boundary,
 * so the user sees something on the first frame and the detailed model
 * fades in once it's parsed.
 */
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
}: {
  children: React.ReactNode;
  offsetX: number;
  idleTimeScale?: number;
  scrollMotionScale?: number;
}) {
  const group = useRef<THREE.Group>(null);

  const targetRotY = useRef(0);
  const targetRotX = useRef(0);
  const scrollRotY = useRef(0);
  const idleY = useRef(0);

  const targetPosY = useRef(0);

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
      const p = max > 0 ? window.scrollY / max : 0;

      const tier = scrollMotionScale;
      const reduce = reduceMotionRef.current ? 0.1 : 1;
      const blend = tier * reduce;

      // Scroll-coupled rotation + slight position drift. Scale and camera-Z
      // are intentionally NOT updated from scroll — those visually grow /
      // shrink the moon as the page scrolls, which the design no longer
      // wants. The moon's apparent size now stays constant while only its
      // orientation tracks the scroll progress.
      targetRotY.current = p * Math.PI * 3.85 * blend;
      targetRotX.current = p * 0.58 * blend;

      targetPosY.current = (p - 0.5) * 0.42 * blend;
      // targetPosZ.current intentionally left at 0 — moving along Z would
      // change the perspective size of the sphere, reading as "the moon
      // grew / shrank" while scrolling.
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
  }, [scrollMotionScale]);

  useLayoutEffect(() => {
    if (group.current) {
      group.current.position.x = offsetX;
    }
  }, [offsetX]);

  useFrame((_state, delta) => {
    const idleMul = reduceMotionRef.current ? 0.18 : 1;
    idleY.current +=
      delta * ((2 * Math.PI) / 24) * idleTimeScale * idleMul;

    scrollRotY.current = THREE.MathUtils.lerp(
      scrollRotY.current,
      targetRotY.current,
      0.058,
    );

    if (!group.current) return;

    // Rotation tracks scroll + idle drift.
    group.current.rotation.y = scrollRotY.current + idleY.current * 0.2;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      targetRotX.current,
      0.048,
    );

    // Position-X holds at the configured offsetX; position-Y drifts very
    // slightly with scroll so the moon doesn't feel frozen, but stays inside
    // a fixed visual frame. Position-Z and scale are NOT touched — the
    // moon's apparent size must stay constant during scroll.
    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      offsetX,
      0.085,
    );
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      targetPosY.current,
      0.078,
    );
  });

  return <group ref={group}>{children}</group>;
}

function MoonWorld({
  useFile,
  offsetX,
  sphereSegments,
  idleTimeScale,
  scrollMotionScale,
  onReady,
}: {
  useFile: boolean;
  offsetX: number;
  sphereSegments: number;
  idleTimeScale: number;
  scrollMotionScale: number;
  onReady: () => void;
}) {
  return (
    <>
      <MoonReadyOnFirstFrame onReady={onReady} />
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
      >
        {/*
          Suspense fallback shows the procedural FallbackMoon immediately
          while the high-detail GLB is being fetched/parsed. Once the GLTF
          resolves, the detailed model takes over with no visible jump
          (same scale + position via <Center scale={1.15}>).
        */}
        <Suspense fallback={<FallbackMoon segments={sphereSegments} />}>
          {useFile ? <GLTFMoon /> : <FallbackMoon segments={sphereSegments} />}
        </Suspense>
      </ScrollAndIdleGroup>
    </>
  );
}

export function MoonScene({
  offsetX = 0.9,
  dprMax = 2,
  sphereSegments = 64,
  antialias = true,
  idleTimeScale = 1,
  scrollMotionScale = 1,
}: {
  offsetX?: number;
  dprMax?: number;
  sphereSegments?: number;
  antialias?: boolean;
  idleTimeScale?: number;
  scrollMotionScale?: number;
}) {
  const { markMoonReady } = useMoonReady();
  const backdropBox = useMoonBackdropVisualBox();
  const [useFile, setUseFile] = useState(false);

  /**
   * Probe the GLB before requesting it. If the file is missing or the network
   * fails, we never call `useGLTF` so React doesn't suspend forever — the
   * procedural FallbackMoon stays as the rendered moon.
   *
   * Note: the placeholder glow over the hero is dismissed by
   * `MoonReadyOnFirstFrame` as soon as the canvas paints its first frame,
   * which happens with the procedural moon — so the user never has to wait
   * for the GLB before the page chrome settles.
   */
  useEffect(() => {
    let cancelled = false;
    fetch("/models/moon.glb", { method: "HEAD" })
      .then((res) => {
        if (!cancelled && res.ok) setUseFile(true);
      })
      .catch(() => {
        // Network failure → stick with the procedural moon.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markMoonReady();
    }
  }, [markMoonReady]);

  const invScale = backdropBox.scale > 0 ? 1 / backdropBox.scale : 1;
  const innerW = Math.max(1, backdropBox.innerW);
  const innerH = Math.max(1, backdropBox.innerH);

  return (
    <div
      className="pointer-events-none fixed z-[1] overflow-hidden"
      style={{
        left: backdropBox.offsetLeft,
        top: backdropBox.offsetTop,
        width: Math.max(1, backdropBox.outerW),
        height: Math.max(1, backdropBox.outerH),
        transform: `scale(${invScale})`,
        transformOrigin: "top left",
        willChange: "transform",
      }}
      aria-hidden
    >
      <div className="overflow-hidden" style={{ width: innerW, height: innerH }}>
        <Canvas
          camera={{ position: [0, 0, BASE_CAMERA_Z], fov: 40 }}
          dpr={[1, dprMax]}
          