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
        m.transparent = true;
        m.opacity = Math.min(m.opacity, 0.92);
        m.depthWrite = true;
      }
    }
  });
}

function FallbackMoon({ segments = 64 }: { segments?: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.08;
  });
  return (
    <mesh ref={mesh} scale={1.15}>
      <sphereGeometry args={[1, segments, segments]} />
      <meshStandardMaterial
        color="#c4c4cc"
        roughness={0.82}
        metalness={0.18}
        emissive="#2a1f38"
        emissiveIntensity={0.45}
        transparent
        opacity={0.9}
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

function ScrollAndIdleGroup({
  children,
  offsetX,
  idleTimeScale = 1,
}: {
  children: React.ReactNode;
  offsetX: number;
  idleTimeScale?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const targetY = useRef(0);
  const targetX = useRef(0);
  const scrollY = useRef(0);
  const idleY = useRef(0);

  useEffect(() => {
    let rafId: number | null = null;

    const commitScrollTargets = () => {
      rafId = null;
      const el = document.documentElement;
      const max = el.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      targetY.current = p * Math.PI * 2.2;
      targetX.current = p * 0.38;
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
  }, []);

  useLayoutEffect(() => {
    if (group.current) group.current.position.x = offsetX;
  }, [offsetX]);

  useFrame((_, delta) => {
    idleY.current += delta * ((2 * Math.PI) / 24) * idleTimeScale;
    scrollY.current = THREE.MathUtils.lerp(
      scrollY.current,
      targetY.current,
      0.055,
    );
    if (!group.current) return;
    group.current.rotation.y = scrollY.current + idleY.current * 0.22;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      targetX.current,
      0.045,
    );
    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      offsetX,
      0.08,
    );
  });

  return <group ref={group}>{children}</group>;
}

function MoonWorld({
  useFile,
  offsetX,
  sphereSegments,
  idleTimeScale,
}: {
  useFile: boolean;
  offsetX: number;
  sphereSegments: number;
  idleTimeScale: number;
}) {
  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight
        position={[6, 2, 9]}
        intensity={1.35}
        color="#ffffff"
      />
      <directionalLight
        position={[-5, -1, -5]}
        intensity={0.65}
        color="#7c3aed"
      />
      <directionalLight
        position={[2, 4, 3]}
        intensity={0.4}
        color="#22d3ee"
      />
      <pointLight position={[0, 1.5, 5]} intensity={0.55} color="#22d3ee" />
      <pointLight position={[-3, -2, 2]} intensity={0.35} color="#7c3aed" />
      <ScrollAndIdleGroup offsetX={offsetX} idleTimeScale={idleTimeScale}>
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
}: {
  offsetX?: number;
  dprMax?: number;
  sphereSegments?: number;
  antialias?: boolean;
  idleTimeScale?: number;
}) {
  const [useFile, setUseFile] = useState(false);
  const [checked, setChecked] = useState(false);

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

  if (!checked) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 5.4], fov: 40 }}
        dpr={[1, dprMax]}
        gl={{
          alpha: true,
          antialias,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <MoonWorld
          useFile={useFile}
          offsetX={offsetX}
          sphereSegments={sphereSegments}
          idleTimeScale={idleTimeScale}
        />
      </Canvas>
    </div>
  );
}
