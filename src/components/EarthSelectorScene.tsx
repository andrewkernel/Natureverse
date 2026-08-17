"use client";
/* eslint-disable react/no-unknown-property */

import { Html, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type CSSProperties, type MutableRefObject, type PointerEvent as ReactPointerEvent } from "react";
import * as THREE from "three";
import type { BiomeConfig, BiomeId } from "../types/biome";

const EARTH_MODEL_URL = "/models/low-poly-planet-earth.glb";
const EARTH_CENTER: [number, number, number] = [0.0512, -1.0961, -0.003];
const MARKER_RADIUS = 1.09;

const coordinates: Record<BiomeId, [number, number]> = {
  "temperate-rainforest": [45.52, -122.68],
  "desert-oasis": [31.8, -112.3],
  savanna: [-1.29, 36.82],
  "arctic-tundra": [69.65, -148.72],
  "amazon-floodplain": [-3.12, -60.02],
  "alpine-meadow": [27.5, 90.5],
  "coral-reef": [0.5, 125.2],
};

type Props = {
  biomes: BiomeConfig[];
  selectedBiomeId: BiomeId | null;
  onSelectBiome: (id: BiomeId) => void;
};

const pointForLocation = ([latitude, longitude]: [number, number], radius = MARKER_RADIUS) => {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
};

function PlanetMesh() {
  const { scene } = useGLTF(EARTH_MODEL_URL);
  const planet = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    planet.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = false;
      object.receiveShadow = false;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        material.needsUpdate = true;
      });
    });
  }, [planet]);

  return <group position={EARTH_CENTER}><primitive object={planet} /></group>;
}

function RegionBeacon({ biome, index, selected, onSelect }: { biome: BiomeConfig; index: number; selected: boolean; onSelect: () => void }) {
  const point = useMemo(() => pointForLocation(coordinates[biome.id]), [biome.id]);
  const outward = useMemo(() => point.clone().normalize(), [point]);
  const orientation = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), outward), [outward]);

  return (
    <group position={point} quaternion={orientation}>
      <mesh position={[0, 0.047, 0]} onClick={(event) => { event.stopPropagation(); onSelect(); }}>
        <cylinderGeometry args={[selected ? 0.032 : 0.022, selected ? 0.032 : 0.022, selected ? 0.13 : 0.09, 8]} />
        <meshBasicMaterial color={biome.palette.accent} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[selected ? 0.09 : 0.06, selected ? 0.106 : 0.071, 28]} />
        <meshBasicMaterial color={biome.palette.accent} transparent opacity={selected ? 0.82 : 0.52} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <Html transform occlude distanceFactor={6.8} position={[0, selected ? 0.22 : 0.17, 0]} center>
        <button className={"earth-marker-label" + (selected ? " is-selected" : "")} type="button" onClick={onSelect} style={{ "--site-accent": biome.palette.accent } as CSSProperties}>
          <span>{String(index + 1).padStart(2, "0")}</span>{biome.shortLabel}
        </button>
      </Html>
    </group>
  );
}

function InteractiveEarth({ biomes, selectedBiomeId, onSelectBiome, dragXRef, isDraggingRef }: Props & { dragXRef: MutableRefObject<number>; isDraggingRef: MutableRefObject<boolean> }) {
  const globe = useRef<THREE.Group>(null);
  const yaw = useRef(0);
  const targetYaw = useRef(0);
  const holdUntil = useRef(0);

  useEffect(() => {
    if (!selectedBiomeId) return;
    const point = pointForLocation(coordinates[selectedBiomeId]);
    targetYaw.current = Math.atan2(-point.x, point.z);
    holdUntil.current = performance.now() + 4200;
  }, [selectedBiomeId]);

  useFrame((state, delta) => {
    if (isDraggingRef.current) {
      targetYaw.current += dragXRef.current * 0.008;
      dragXRef.current = 0;
      holdUntil.current = state.clock.elapsedTime * 1000 + 2600;
    } else if (state.clock.elapsedTime * 1000 > holdUntil.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targetYaw.current += delta * 0.045;
    }
    yaw.current += (targetYaw.current - yaw.current) * Math.min(1, delta * 4.8);
    if (globe.current) globe.current.rotation.set(-0.1, yaw.current, 0.06);
  });

  return (
    <group ref={globe}>
      <PlanetMesh />
      {biomes.map((biome, index) => <RegionBeacon biome={biome} index={index} key={biome.id} selected={biome.id === selectedBiomeId} onSelect={() => onSelectBiome(biome.id)} />)}
    </group>
  );
}

export function EarthSelectorScene({ biomes, selectedBiomeId, onSelectBiome }: Props) {
  const dragPointer = useRef<number | null>(null);
  const lastX = useRef(0);
  const dragXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest?.(".earth-marker-label")) return;
    dragPointer.current = event.pointerId;
    lastX.current = event.clientX;
    isDraggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragPointer.current !== event.pointerId) return;
    dragXRef.current += event.clientX - lastX.current;
    lastX.current = event.clientX;
  };
  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragPointer.current !== event.pointerId) return;
    dragPointer.current = null;
    isDraggingRef.current = false;
  };

  return (
    <div className="earth-selector-canvas" aria-label="Interactive Earth with seven marked Natureverse field sites" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={stopDragging} onPointerCancel={stopDragging}>
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.16, 4.15], fov: 33, near: 0.1, far: 20 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.08; }}>
        <ambientLight intensity={1.7} />
        <directionalLight position={[4, 3, 5]} intensity={2.2} color="#fff7d0" />
        <directionalLight position={[-4, -1, -3]} intensity={0.35} color="#79cce1" />
        <Suspense fallback={null}>
          <InteractiveEarth biomes={biomes} selectedBiomeId={selectedBiomeId} onSelectBiome={onSelectBiome} dragXRef={dragXRef} isDraggingRef={isDraggingRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(EARTH_MODEL_URL);

export default EarthSelectorScene;
