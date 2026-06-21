"use client";
// React Compiler off — react-three-fiber drives its own reconciler.
"use no memo";

import {
  ContactShadows,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/male_skeleton.glb";

type RegionId = "head" | "thorax" | "pelvis" | "legs";

const REGIONS: Record<
  RegionId,
  { label: string; part: string; color: string }
> = {
  head: { label: "Koka", part: "Kokë", color: "#a970ff" },
  thorax: { label: "Toraksi", part: "Toraks", color: "#ff5fa8" },
  pelvis: { label: "Pelvisi", part: "Pelvis", color: "#ffb43b" },
  legs: { label: "Këmbët", part: "Këmbë", color: "#43e08f" },
};

// Invisible click volumes over the standing model (height ≈ 4.2, centred at 0).
// Full-width boxes by height band → big, reliable targets you can't miss.
const HOTSPOTS: {
  id: RegionId;
  pos: [number, number, number];
  size: [number, number, number];
}[] = [
  { id: "head", pos: [0, 1.85, 0], size: [2.6, 0.62, 1.7] },
  { id: "thorax", pos: [0, 1.0, 0], size: [3.0, 1.12, 1.7] },
  { id: "pelvis", pos: [0, 0.28, 0], size: [2.6, 0.66, 1.7] },
  { id: "legs", pos: [0, -1.2, 0], size: [2.6, 2.1, 1.7] },
];

const FitModel = () => {
  const { scene } = useGLTF(MODEL_URL);
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = 4.2 / (size.y || 1);
    return {
      scale,
      offset: [-center.x, -center.y, -center.z] as [number, number, number],
    };
  }, [scene]);

  return (
    <group scale={fit.scale}>
      <primitive object={scene} position={fit.offset} />
    </group>
  );
};

const Scene = () => {
  const router = useRouter();
  const [hover, setHover] = useState<{
    id: RegionId;
    point: [number, number, number];
  } | null>(null);

  return (
    <>
      <Suspense fallback={null}>
        <FitModel />
      </Suspense>

      {HOTSPOTS.map((spot) => (
        // biome-ignore lint/a11y/noStaticElementInteractions: <mesh> is a react-three-fiber 3D object, not a DOM element
        <mesh
          key={spot.id}
          position={spot.pos}
          onPointerMove={(event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            setHover({
              id: spot.id,
              point: [event.point.x, event.point.y, event.point.z],
            });
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHover(null);
            document.body.style.cursor = "default";
          }}
          onClick={(event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            router.push(
              `/dashboard/worklist?bodyPart=${encodeURIComponent(REGIONS[spot.id].part)}` as Route,
            );
          }}
        >
          <boxGeometry args={spot.size} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}

      {hover && (
        <Html position={hover.point} center zIndexRange={[20, 0]}>
          <div
            className="pointer-events-none -translate-y-7 whitespace-nowrap rounded-pill border border-white/25 bg-black/80 px-3 py-1 font-medium text-white text-xs backdrop-blur-sm"
            style={{ boxShadow: `0 0 16px ${REGIONS[hover.id].color}` }}
          >
            {REGIONS[hover.id].label} →
          </div>
        </Html>
      )}

      <ContactShadows
        position={[0, -2.18, 0]}
        opacity={0.55}
        scale={10}
        blur={2.6}
        far={4.5}
        color="#000000"
      />

      {/* auto-rotate, but freeze while the cursor is over the body */}
      <OrbitControls
        autoRotate={hover === null}
        autoRotateSpeed={0.9}
        enablePan={false}
        enableZoom
        minDistance={4.5}
        maxDistance={11}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={(Math.PI * 4) / 5}
      />
    </>
  );
};

export default function BodyMapCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 7.2], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 7, 5]} intensity={2.6} />
      <pointLight position={[-5, 2, 4]} intensity={45} color="#ff5fbf" />
      <pointLight position={[5, -1, 3]} intensity={38} color="#5bd6ff" />
      <pointLight position={[0, 4, -5]} intensity={26} color="#8a7bff" />
      <Scene />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
