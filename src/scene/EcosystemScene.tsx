"use client";

import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Html, Line, OrbitControls, Sparkles } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { getBiomeFauna } from "../data/biomeFauna";
import type { BiomeConfig } from "../types/biome";
import type { FaunaSpawn } from "../types/fauna";
import { AnimalModel } from "./AnimalModels";
import { UnderwaterEcosystem } from "./UnderwaterEcosystem";
import { WeatherAtmosphere, WeatherGroundDetails } from "./WeatherSystem";
import { WorldLandmarks } from "./WorldLandmarks";
import {
  ISLAND_RADIUS,
  createTerrainGeometry,
  riverCenterX,
  scatterLand,
  seeded,
  terrainHeight,
  waterSurfaceHeight,
  type ScatterPoint,
} from "./terrain";

export type VisualMetrics = {
  waterQuality: number;
  vegetation: number;
  biodiversity: number;
  pollination: number;
};

type Props = {
  biome: BiomeConfig;
  metrics: VisualMetrics;
  populations: Record<string, number>;
  pollution: number;
  drought: number;
  habitatLoss: number;
  invasive: boolean;
  selectedId: string | null;
  connectionIds: string[];
  focusId?: string | null;
  onSelect: (id: string) => void;
};

const SPECIES_ANCHORS: Record<string, [number, number]> = {
  river: [0, 0.1], fish: [0.25, 2.1], frog: [-1.45, 1.55], dragonfly: [-1.05, -0.75],
  wildflower: [-4.25, 2.25], bee: [-3.55, 1.75], butterfly: [-4.55, 0.65], oak: [5.2, -2.2],
  fruit_tree: [-5.25, -2.75], bird: [2.7, -2.55], deer: [5.1, 2.25], rabbit: [3.25, 3.85],
  grass: [3.8, 0.2], invasive_plant: [6.5, -0.4],
};

function Selectable({ id, selected, hinted = false, children, onSelect, label, labelHeight = 1.5 }: {
  id: string;
  selected: boolean;
  hinted?: boolean;
  children: React.ReactNode;
  onSelect: (id: string) => void;
  label: string;
  labelHeight?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const click = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onSelect(id); };
  return (
    <group
      onClick={click}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      scale={selected ? 1.07 : hovered || hinted ? 1.035 : 1}
    >
      {children}
      {hinted && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}><torusGeometry args={[0.72, 0.035, 6, 28]} /><meshBasicMaterial color="#e3f7a8" transparent opacity={0.82} /></mesh>}
      {(selected || hovered || hinted) && (
        <Billboard position={[0, labelHeight, 0]}>
          <Html center distanceFactor={8} style={{ pointerEvents: "none" }}><div className={`world-label ${hinted ? "world-label-hinted" : ""}`}>{hinted ? `Investigate · ${label}` : label}</div></Html>
        </Billboard>
      )}
    </group>
  );
}

function TerrainIsland({ biome, vegetation, habitatLoss }: { biome: BiomeConfig; vegetation: number; habitatLoss: number }) {
  const geometry = useMemo(() => createTerrainGeometry(biome), [biome]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const damage = Math.max(0, (70 - vegetation) / 70, habitatLoss / 125);
  const edge = new THREE.Color(biome.palette.cliff).lerp(new THREE.Color("#59483b"), damage * 0.45);
  return (
    <group>
      <mesh receiveShadow position={[0, -0.55, 0]}>
        <cylinderGeometry args={[ISLAND_RADIUS + 0.48, ISLAND_RADIUS - 0.55, 1.25, 64]} />
        <meshStandardMaterial color={edge} roughness={1} />
      </mesh>
      <mesh receiveShadow geometry={geometry}>
        <meshStandardMaterial vertexColors roughness={0.93} metalness={0.01} />
      </mesh>
      <mesh position={[0, -1.13, 0]}>
        <cylinderGeometry args={[ISLAND_RADIUS - 0.55, ISLAND_RADIUS - 1.35, 0.18, 64]} />
        <meshStandardMaterial color="#26372f" roughness={1} />
      </mesh>
    </group>
  );
}

function createWaterStrip(biome: BiomeConfig, drought: number) {
  const segments = 104;
  const positions: number[] = [];
  const indices: number[] = [];
  const widthBase = biome.waterStyle === "floodplain" ? 1.18 : biome.waterStyle === "glacial" ? 0.67 : biome.waterStyle === "ice-stream" ? 0.58 : 0.78;
  const width = Math.max(0.22, widthBase * (1 - drought * 0.006));
  for (let i = 0; i <= segments; i += 1) {
    const z = -11.9 + (i / segments) * 23.8;
    const x = riverCenterX(z, biome);
    const y = waterSurfaceHeight(x, z, biome, drought) + Math.sin(i * 0.57) * 0.008;
    positions.push(x - width, y, z, x + width, y, z);
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 2, a + 3, a, a + 3, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function WaterFeature({ biome, waterQuality, drought, pollution }: {
  biome: BiomeConfig; waterQuality: number; drought: number; pollution: number;
}) {
  const strip = useMemo(() => createWaterStrip(biome, drought), [biome, drought]);
  useEffect(() => () => strip.dispose(), [strip]);
  const color = new THREE.Color(biome.palette.water).lerp(new THREE.Color(biome.palette.waterPolluted), pollution / 110);
  const surface = waterSurfaceHeight(0, 0, biome, drought);
  const poolRadius = Math.max(0.65, (biome.waterStyle === "oasis" ? 2.15 : 1.82) * (1 - drought * 0.006));
  if (biome.waterStyle === "ocean") {
    return (
      <mesh receiveShadow raycast={() => undefined} position={[0, waterSurfaceHeight(0, 0, biome, drought), 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
        <circleGeometry args={[11.7, 96]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.04} roughness={0.06} clearcoat={0.95} clearcoatRoughness={0.08} transparent opacity={0.08 + waterQuality * 0.00042} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    );
  }
  return (
    <>
      {biome.waterStyle === "oasis" || biome.waterStyle === "waterhole" ? (
        <mesh receiveShadow raycast={() => undefined} position={[biome.waterStyle === "oasis" ? -0.25 : 0.4, surface, biome.waterStyle === "oasis" ? 0.05 : -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[poolRadius, 64]} />
          <meshPhysicalMaterial color={color} roughness={0.12} clearcoat={0.72} clearcoatRoughness={0.16} transparent opacity={0.86 + waterQuality * 0.001} depthWrite={false} />
        </mesh>
      ) : (
        <mesh receiveShadow raycast={() => undefined} geometry={strip}>
          <meshPhysicalMaterial color={color} roughness={0.14} clearcoat={0.76} clearcoatRoughness={0.12} transparent opacity={0.85 + waterQuality * 0.0012} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </>
  );
}

function Sky({ biome, pollution }: { biome: BiomeConfig; pollution: number }) {
  const uniforms = useMemo(() => ({
    uTop: { value: new THREE.Color(biome.palette.skyTop).lerp(new THREE.Color("#6f7471"), pollution / 145) },
    uHorizon: { value: new THREE.Color(biome.palette.skyHorizon).lerp(new THREE.Color("#989a86"), pollution / 145) },
    uSun: { value: new THREE.Color(biome.palette.sunlight) },
    uSunDir: { value: new THREE.Vector3(-0.45, 0.48, 0.5).normalize() },
    uOcean: { value: biome.waterStyle === "ocean" ? 1 : 0 },
  }), [biome, pollution]);
  return (
    <mesh scale={70} frustumCulled={false}>
      <sphereGeometry args={[1, 36, 20]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader="varying vec3 vDir; void main(){ vDir=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }"
        fragmentShader="varying vec3 vDir; uniform vec3 uTop,uHorizon,uSun,uSunDir; uniform float uOcean; void main(){ float h=clamp(vDir.y*.5+.5,0.,1.); vec3 col=mix(uHorizon,uTop,pow(h,.68)); float d=clamp(dot(normalize(vDir),uSunDir),0.,1.); col+=uSun*(pow(d,520.)*.58+pow(d,8.)*.09); if(uOcean>.5){ col+=vec3(.02,.12,.12)*(1.-h); col*=.88+.12*sin(vDir.y*28.); } gl_FragColor=vec4(col,1.); }"
      />
    </mesh>
  );
}

function BackgroundWorld({ biome, pollution }: { biome: BiomeConfig; pollution: number }) {
  const cloudA = useRef<THREE.Group>(null);
  const cloudB = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const drift = clock.elapsedTime * 0.035;
    if (cloudA.current) cloudA.current.position.x = -6 + Math.sin(drift) * 1.2;
    if (cloudB.current) cloudB.current.position.x = 6 + Math.cos(drift * 0.8) * 1.1;
  });
  const anchors = useMemo(() => Array.from({ length: 12 }, (_, index) => ({
    angle: (index / 12) * Math.PI * 2,
    radius: 34 + seeded(index, 31) * 7,
    height: 3.2 + seeded(index, 32) * (biome.terrainStyle === "alpine" ? 6.2 : 3.6),
    width: 2.2 + seeded(index, 33) * 2.4,
  })), [biome.terrainStyle]);
  const oceanHorizon = useMemo(() => {
    if (biome.waterStyle !== "ocean") return [null, null];
    const buckets: THREE.BufferGeometry[][] = [[], []];
    anchors.slice(0, 8).forEach((item, index) => {
      for (let branch = 0; branch < 5; branch += 1) {
        const geometry = new THREE.CapsuleGeometry(0.28, 0.85, 6, 10);
        geometry.applyMatrix4(new THREE.Matrix4().compose(
          new THREE.Vector3(Math.cos(item.angle) * 19 + (branch % 2) * 0.35, -0.2 + branch * 0.42, Math.sin(item.angle) * 19),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, (branch % 2 ? -1 : 1) * 0.34)),
          new THREE.Vector3(0.22, 0.72, 0.22),
        ));
        buckets[index % 2].push(geometry);
      }
    });
    return buckets.map((bucket) => {
      const merged = mergeGeometries(bucket, false);
      bucket.forEach((geometry) => geometry.dispose());
      return merged;
    });
  }, [anchors, biome.waterStyle]);
  useEffect(() => () => oceanHorizon.forEach((geometry) => geometry?.dispose()), [oceanHorizon]);
  const silhouette = new THREE.Color(biome.palette.cliff).lerp(new THREE.Color("#77766d"), pollution / 155);
  if (biome.waterStyle === "ocean") {
    return (
      <group>
        {oceanHorizon.map((geometry, index) => geometry && <mesh key={index} geometry={geometry}><meshStandardMaterial color={index ? biome.palette.flora : biome.palette.floraSecondary} roughness={0.8} /></mesh>)}
        <Sparkles count={90} scale={[38, 11, 32]} size={1.1} speed={0.12} opacity={0.36} color="#c9ffff" />
      </group>
    );
  }
  return (
    <group>
      {anchors.map((item, index) => (
        <group key={index} position={[Math.cos(item.angle) * item.radius, item.height * 0.32 - 0.2, Math.sin(item.angle) * item.radius]} rotation={[0, -item.angle, 0]}>
          <mesh scale={[item.width, item.height, item.width * 0.72]}>
            {biome.terrainStyle === "dunes" || biome.terrainStyle === "grassland" ? <dodecahedronGeometry args={[1, 0]} /> : <coneGeometry args={[1, 1, biome.terrainStyle === "alpine" ? 7 : 6]} />}
            <meshStandardMaterial color={silhouette.clone().offsetHSL(0, -0.03, (index % 3) * 0.02)} roughness={1} />
          </mesh>
        </group>
      ))}
      {[{ ref: cloudA, position: [-6, 7.2, -8] as [number, number, number] }, { ref: cloudB, position: [6, 8.2, 3] as [number, number, number] }].map((cloud, cloudIndex) => (
        <group key={cloudIndex} ref={cloud.ref} position={cloud.position} scale={cloudIndex ? 0.72 : 1}>
          {[[-1, 0, 0], [0, 0.2, 0], [1, 0, 0], [0.45, -0.18, 0.1]].map((position, index) => (
            <mesh key={index} position={position as [number, number, number]} scale={[1.25, 0.62, 0.68]}><dodecahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#f3f5eb" transparent opacity={Math.max(0.18, 0.64 - pollution * 0.0025)} roughness={1} /></mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function FloraProp({ biome, position, scale = 1, dry = 0 }: { biome: BiomeConfig; position: [number, number, number]; scale?: number; dry?: number }) {
  const green = new THREE.Color(biome.palette.flora).lerp(new THREE.Color(biome.palette.groundDry), dry * 0.72);
  const green2 = new THREE.Color(biome.palette.floraSecondary).lerp(new THREE.Color(biome.palette.groundDry), dry * 0.65);
  if (biome.floraStyle === "cactus") {
    return <group position={position} scale={scale}>
      <mesh castShadow position={[0, 1.05, 0]}><capsuleGeometry args={[0.28, 1.65, 10, 16]} /><meshStandardMaterial color={green} roughness={0.8} /></mesh>
      {[1, -1].map((side) => <group key={side} position={[side * 0.34, 1.15, 0]} rotation={[0, 0, side * -0.7]}><mesh castShadow position={[0, 0.32, 0]}><capsuleGeometry args={[0.15, 0.55, 8, 12]} /><meshStandardMaterial color={green2} roughness={0.82} /></mesh><mesh castShadow position={[side * 0.18, 0.6, 0]} rotation={[0, 0, side * 0.7]}><capsuleGeometry args={[0.14, 0.48, 8, 12]} /><meshStandardMaterial color={green2} roughness={0.82} /></mesh></group>)}
      <mesh position={[0, 2.08, 0]}><sphereGeometry args={[0.16, 12, 8]} /><meshStandardMaterial color="#ef6f88" emissive="#9e344c" emissiveIntensity={0.15} /></mesh>
    </group>;
  }
  if (biome.floraStyle === "acacia") {
    return <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.95, 0]} rotation={[0, 0, -0.1]}><cylinderGeometry args={[0.14, 0.28, 1.9, 9]} /><meshStandardMaterial color="#77512f" roughness={1} /></mesh>
      <mesh castShadow position={[0, 1.94, 0]} scale={[1.08, 0.34, 0.82]}><sphereGeometry args={[1, 20, 12]} /><meshStandardMaterial color={green} roughness={0.96} /></mesh>
      <mesh castShadow position={[0.62, 1.82, 0.06]} scale={[0.66, 0.24, 0.58]}><sphereGeometry args={[1, 18, 10]} /><meshStandardMaterial color={green2} roughness={0.96} /></mesh>
    </group>;
  }
  if (biome.floraStyle === "tundra") {
    return <group position={position} scale={scale}>
      {Array.from({ length: 8 }, (_, index) => <mesh key={index} castShadow position={[(seeded(index, 2) - 0.5) * 0.8, 0.18 + seeded(index, 3) * 0.13, (seeded(index, 4) - 0.5) * 0.72]} scale={[0.22, 0.24, 0.3]}><dodecahedronGeometry args={[1, 1]} /><meshStandardMaterial color={index % 3 ? green : green2} roughness={1} /></mesh>)}
    </group>;
  }
  if (biome.floraStyle === "coral") {
    return <group position={position} scale={scale}>
      {Array.from({ length: 7 }, (_, index) => <mesh key={index} castShadow position={[(index % 3 - 1) * 0.26, 0.28 + index * 0.16, (Math.floor(index / 3) - 0.7) * 0.24]} rotation={[0, 0, (index % 2 ? -1 : 1) * 0.26]} scale={[0.13 + (index % 2) * 0.04, 0.44 + index * 0.035, 0.13]}><capsuleGeometry args={[0.25, 0.72, 8, 12]} /><meshPhysicalMaterial color={index % 2 ? biome.palette.flora : biome.palette.floraSecondary} roughness={0.52} clearcoat={0.22} /></mesh>)}
      <mesh position={[0, 0.12, 0]} scale={[0.72, 0.16, 0.68]}><sphereGeometry args={[1, 18, 10]} /><meshStandardMaterial color={biome.palette.cliff} roughness={0.94} /></mesh>
    </group>;
  }
  if (biome.floraStyle === "rainforest") {
    return <group position={position} scale={scale}>
      <mesh castShadow position={[0, 1.35, 0]}><cylinderGeometry args={[0.2, 0.42, 2.7, 10]} /><meshStandardMaterial color="#66472f" roughness={1} /></mesh>
      {[[-0.45, 2.6, 0.12], [0.32, 2.82, -0.16], [0.18, 2.42, 0.46], [-0.18, 2.47, -0.48]].map((p, index) => <mesh key={index} castShadow position={p as [number, number, number]} scale={[0.72, 0.62, 0.7]}><icosahedronGeometry args={[0.76, 2]} /><meshStandardMaterial color={index % 2 ? green : green2} roughness={0.92} /></mesh>)}
      {[1, -1].map((side) => <mesh key={side} position={[side * 0.28, 0.2, 0]} rotation={[0, 0, side * -0.55]} scale={[0.16, 0.55, 0.28]}><coneGeometry args={[0.7, 1, 4]} /><meshStandardMaterial color="#59422e" roughness={1} /></mesh>)}
    </group>;
  }
  const conifer = biome.floraStyle === "conifer" || biome.floraStyle === "alpine";
  return <group position={position} scale={scale}>
    <mesh castShadow position={[0, 0.8, 0]}><cylinderGeometry args={[0.14, 0.24, 1.6, 9]} /><meshStandardMaterial color="#68472f" roughness={1} /></mesh>
    {conifer ? [0.85, 1.35, 1.8].map((y, index) => <mesh key={y} castShadow position={[0, y, 0]} scale={[1 - index * 0.18, 0.9 - index * 0.08, 1 - index * 0.18]}><coneGeometry args={[0.92, 1.15, 12]} /><meshStandardMaterial color={index % 2 ? green2 : green} roughness={0.94} /></mesh>) : <mesh castShadow position={[0, 1.75, 0]}><icosahedronGeometry args={[0.95, 2]} /><meshStandardMaterial color={green} roughness={0.94} /></mesh>}
  </group>;
}

type GeometryPart = {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
};

function placeGeometry(part: GeometryPart, point: ScatterPoint, scaleMultiplier: number) {
  const root = new THREE.Matrix4().compose(
    new THREE.Vector3(point.x, point.y, point.z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, point.rotation, 0)),
    new THREE.Vector3(point.scale * scaleMultiplier, point.scale * scaleMultiplier, point.scale * scaleMultiplier),
  );
  const local = new THREE.Matrix4().compose(
    new THREE.Vector3(...part.position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...(part.rotation ?? [0, 0, 0]))),
    new THREE.Vector3(...part.scale),
  );
  part.geometry.applyMatrix4(root.multiply(local));
  return part.geometry;
}

function mergedOrEmpty(geometries: THREE.BufferGeometry[]) {
  if (!geometries.length) return null;
  const merged = mergeGeometries(geometries, false);
  geometries.forEach((geometry) => geometry.dispose());
  return merged;
}

function AmbientFlora({ biome, points, scaleMultiplier, dry, livingColorOverride }: { biome: BiomeConfig; points: ScatterPoint[]; scaleMultiplier: number; dry: number; livingColorOverride?: string }) {
  const geometries = useMemo(() => {
    const structural: THREE.BufferGeometry[] = [];
    const living: THREE.BufferGeometry[] = [];
    points.forEach((point, pointIndex) => {
      const add = (target: THREE.BufferGeometry[], part: GeometryPart) => target.push(placeGeometry(part, point, scaleMultiplier));
      if (biome.floraStyle === "cactus") {
        add(living, { geometry: new THREE.CapsuleGeometry(0.28, 1.65, 6, 10), position: [0, 1.05, 0], scale: [1, 1, 1] });
        [-1, 1].forEach((side) => add(living, { geometry: new THREE.CapsuleGeometry(0.15, 0.55, 5, 8), position: [side * 0.34, 1.25, 0], scale: [1, 1, 1], rotation: [0, 0, side * -0.68] }));
      } else if (biome.floraStyle === "acacia") {
        add(structural, { geometry: new THREE.CylinderGeometry(0.14, 0.28, 1.9, 7), position: [0, 0.95, 0], scale: [1, 1, 1] });
        add(living, { geometry: new THREE.SphereGeometry(1, 12, 7), position: [0, 1.94, 0], scale: [1.08, 0.34, 0.82] });
        add(living, { geometry: new THREE.SphereGeometry(1, 10, 6), position: [0.62, 1.82, 0.06], scale: [0.66, 0.24, 0.58] });
      } else if (biome.floraStyle === "tundra") {
        for (let part = 0; part < 6; part += 1) add(living, {
          geometry: new THREE.DodecahedronGeometry(1, 0),
          position: [(seeded(pointIndex * 9 + part, 2) - 0.5) * 0.8, 0.18 + seeded(pointIndex * 9 + part, 3) * 0.13, (seeded(pointIndex * 9 + part, 4) - 0.5) * 0.72],
          scale: [0.22, 0.24, 0.3],
        });
      } else if (biome.floraStyle === "coral") {
        for (let branch = 0; branch < 5; branch += 1) add(living, {
          geometry: new THREE.CapsuleGeometry(0.25, 0.72, 5, 8),
          position: [(branch % 3 - 1) * 0.26, 0.28 + branch * 0.16, (Math.floor(branch / 3) - 0.45) * 0.24],
          scale: [0.13 + (branch % 2) * 0.04, 0.44 + branch * 0.035, 0.13],
          rotation: [0, 0, (branch % 2 ? -1 : 1) * 0.26],
        });
        add(structural, { geometry: new THREE.SphereGeometry(1, 10, 6), position: [0, 0.12, 0], scale: [0.72, 0.16, 0.68] });
      } else if (biome.floraStyle === "rainforest") {
        add(structural, { geometry: new THREE.CylinderGeometry(0.2, 0.42, 2.7, 8), position: [0, 1.35, 0], scale: [1, 1, 1] });
        [[-0.45, 2.6, 0.12], [0.32, 2.82, -0.16], [0.18, 2.42, 0.46]].forEach((position) => add(living, { geometry: new THREE.IcosahedronGeometry(0.76, 1), position: position as [number, number, number], scale: [0.72, 0.62, 0.7] }));
      } else {
        add(structural, { geometry: new THREE.CylinderGeometry(0.14, 0.24, 1.6, 7), position: [0, 0.8, 0], scale: [1, 1, 1] });
        [0.85, 1.35, 1.8].forEach((y, index) => add(living, { geometry: new THREE.ConeGeometry(0.92, 1.15, 9), position: [0, y, 0], scale: [1 - index * 0.18, 0.9 - index * 0.08, 1 - index * 0.18] }));
      }
    });
    return { structural: mergedOrEmpty(structural), living: mergedOrEmpty(living) };
  }, [biome.floraStyle, points, scaleMultiplier]);
  useEffect(() => () => { geometries.structural?.dispose(); geometries.living?.dispose(); }, [geometries]);
  const livingColor = new THREE.Color(livingColorOverride ?? biome.palette.flora).lerp(new THREE.Color(biome.palette.groundDry), dry * 0.7);
  return <group>
    {geometries.structural && <mesh castShadow receiveShadow geometry={geometries.structural}><meshStandardMaterial color={biome.floraStyle === "coral" ? biome.palette.cliff : "#68472f"} roughness={0.96} /></mesh>}
    {geometries.living && <mesh castShadow receiveShadow geometry={geometries.living}><meshStandardMaterial color={livingColor} roughness={biome.floraStyle === "coral" ? 0.58 : 0.92} /></mesh>}
  </group>;
}

function AmbientMeadow({ biome, points, dry }: { biome: BiomeConfig; points: ScatterPoint[]; dry: number }) {
  if (biome.floraStyle === "coral") return <AmbientFlora biome={biome} points={points} scaleMultiplier={0.36} dry={dry} livingColorOverride={biome.palette.floraSecondary} />;
  return <FlowerGeometry biome={biome} points={points} dry={dry} />;
}

function FlowerGeometry({ biome, points, dry }: { biome: BiomeConfig; points: ScatterPoint[]; dry: number }) {
  const geometries = useMemo(() => {
    const stems: THREE.BufferGeometry[] = [];
    const heads: THREE.BufferGeometry[][] = [[], [], [], []];
    points.forEach((point, index) => {
      stems.push(placeGeometry({ geometry: new THREE.CylinderGeometry(0.014, 0.022, 0.34, 5), position: [0, 0.17, 0], scale: [0.75, 0.75, 0.75] }, point, 0.8));
      heads[index % 4].push(placeGeometry({ geometry: new THREE.OctahedronGeometry(0.1, 0), position: [0, 0.39, 0], scale: [0.72, 0.72, 0.72], rotation: [0, index * 0.7, 0] }, point, 0.8));
    });
    return { stems: mergedOrEmpty(stems), heads: heads.map(mergedOrEmpty) };
  }, [points]);
  useEffect(() => () => { geometries.stems?.dispose(); geometries.heads.forEach((geometry) => geometry?.dispose()); }, [geometries]);
  const colors = [biome.palette.accent, "#f39bbc", "#b9a8ff", "#fff0b0"];
  return <group>
    {geometries.stems && <mesh geometry={geometries.stems}><meshStandardMaterial color={dry > 0.4 ? "#8c7d4e" : biome.palette.floraSecondary} roughness={0.92} /></mesh>}
    {geometries.heads.map((geometry, index) => geometry && <mesh key={index} geometry={geometry}><meshStandardMaterial color={colors[index]} roughness={0.72} /></mesh>)}
  </group>;
}

function FloraField({ biome, metrics, population, selectedId, onSelect }: { biome: BiomeConfig; metrics: VisualMetrics; population: number; selectedId: string | null; onSelect: (id: string) => void }) {
  const dry = Math.max(0, (68 - metrics.vegetation) / 68);
  const points = useMemo(() => scatterLand(biome, 34, biome.id.length * 5, { minRadius: 3.1, maxRadius: 11.1, waterClearance: biome.waterStyle === "ocean" ? -20 : 0.78, minSpacing: 1.12, maxSlope: 0.5 }), [biome]);
  const visible = Math.max(5, Math.round(points.length * Math.max(0.3, population / 100)));
  const oakAnchor = SPECIES_ANCHORS.oak;
  const fruitAnchor = SPECIES_ANCHORS.fruit_tree;
  const oakY = terrainHeight(oakAnchor[0], oakAnchor[1], biome);
  const fruitY = terrainHeight(fruitAnchor[0], fruitAnchor[1], biome);
  return <group>
    <AmbientFlora biome={biome} points={points.slice(0, visible)} scaleMultiplier={biome.floraStyle === "rainforest" ? 0.85 : 0.72} dry={dry} />
    <Selectable id="oak" label={biome.signatureFlora[0]} selected={selectedId === "oak"} onSelect={onSelect} labelHeight={3}>
      <FloraProp biome={biome} position={[oakAnchor[0], oakY, oakAnchor[1]]} scale={biome.floraStyle === "tundra" ? 1.2 : 1.15} dry={dry} />
    </Selectable>
    <Selectable id="fruit_tree" label={biome.signatureFlora[1]} selected={selectedId === "fruit_tree"} onSelect={onSelect} labelHeight={2.6}>
      <FloraProp biome={biome} position={[fruitAnchor[0], fruitY, fruitAnchor[1]]} scale={biome.floraStyle === "tundra" ? 0.9 : 0.92} dry={dry} />
    </Selectable>
  </group>;
}

function MeadowField({ biome, metrics, population, selectedId, onSelect }: { biome: BiomeConfig; metrics: VisualMetrics; population: number; selectedId: string | null; onSelect: (id: string) => void }) {
  const points = useMemo(() => scatterLand(biome, 72, biome.name.length * 3, { minRadius: 1.8, maxRadius: 10.8, waterClearance: biome.waterStyle === "ocean" ? -20 : 0.45, minSpacing: 0.28, maxSlope: 0.42 }), [biome]);
  const visible = Math.max(4, Math.round(points.length * Math.max(0.12, population / 100)));
  const dry = Math.max(0, (62 - metrics.vegetation) / 62);
  return <Selectable id="wildflower" label={biome.signatureFlora[2]} selected={selectedId === "wildflower"} onSelect={onSelect} labelHeight={1.1}>
    <AmbientMeadow biome={biome} points={points.slice(0, visible)} dry={dry} />
  </Selectable>;
}

function GroundDetails({ biome }: { biome: BiomeConfig }) {
  const rocks = useMemo(() => scatterLand(biome, 26, 93 + biome.id.length, { minRadius: 2.1, maxRadius: 11.25, waterClearance: biome.waterStyle === "ocean" ? -20 : 0.28, minSpacing: 0.78, maxSlope: 0.82 }), [biome]);
  const geometry = useMemo(() => mergedOrEmpty(rocks.map((rock) => {
    const shape = new THREE.DodecahedronGeometry(1, 1);
    shape.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(rock.x, rock.y - rock.scale * 0.12, rock.z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, rock.rotation, 0.08)),
      new THREE.Vector3(rock.scale * 0.42, rock.scale * 0.28, rock.scale * 0.36),
    ));
    return shape;
  })), [rocks]);
  useEffect(() => () => geometry?.dispose(), [geometry]);
  return geometry ? <mesh castShadow receiveShadow geometry={geometry}><meshStandardMaterial color={biome.palette.cliff} roughness={1} /></mesh> : null;
}

function DamageVisualization({ biome, habitatLoss, drought, pollution }: { biome: BiomeConfig; habitatLoss: number; drought: number; pollution: number }) {
  const stumpPoints = useMemo(() => scatterLand(biome, 15, 881, { minRadius: 3.2, maxRadius: 10.7, waterClearance: biome.waterStyle === "ocean" ? -20 : 0.9, minSpacing: 1.15, maxSlope: 0.42 }), [biome]);
  const stumpCount = Math.round(THREE.MathUtils.clamp((habitatLoss - 16) / 70, 0, 1) * stumpPoints.length);
  const specialDamageCount = Math.round(THREE.MathUtils.clamp((Math.max(habitatLoss, drought) - 16) / 70, 0, 1) * stumpPoints.length);
  const treeDamage = ["valley", "grassland", "floodplain", "alpine"].includes(biome.terrainStyle);
  const crackOpacity = THREE.MathUtils.clamp((drought - 25) / 70, 0, 0.72);
  const debrisCount = Math.round(THREE.MathUtils.clamp((pollution - 18) / 72, 0, 1) * 12);
  const cracks = useMemo(() => Array.from({ length: 7 }, (_, crack) => Array.from({ length: 5 }, (_, point) => {
    const radius = 3.2 + point * 1.45;
    const angle = crack * 0.84 + Math.sin(point * 2.2 + crack) * 0.12;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    return new THREE.Vector3(x, terrainHeight(x, z, biome) + 0.035, z);
  })), [biome]);
  return <group>
    {treeDamage && stumpPoints.slice(0, stumpCount).map((point, index) => <group key={`stump-${index}`} position={[point.x, point.y, point.z]} rotation={[0, point.rotation, 0]} scale={0.72 + point.scale * 0.28}>
      <mesh castShadow position={[0, 0.22, 0]}><cylinderGeometry args={[0.22, 0.3, 0.44, 11]} /><meshStandardMaterial color="#5b3a27" roughness={1} /></mesh>
      <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.22, 14]} /><meshStandardMaterial color="#b28a5d" roughness={0.92} /></mesh>
    </group>)}
    {biome.terrainStyle === "dunes" && stumpPoints.slice(0, specialDamageCount).map((point, index) => <group key={`cactus-damage-${index}`} position={[point.x, point.y, point.z]} rotation={[0, point.rotation, index % 2 ? 0.7 : -0.62]}>
      <mesh castShadow position={[0, 0.32, 0]} scale={[0.14, 0.52, 0.14]}><capsuleGeometry args={[0.24, 0.72, 6, 9]} /><meshStandardMaterial color="#766044" roughness={1} /></mesh>
      <mesh position={[0.08, 0.68, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.13, 9]} /><meshStandardMaterial color="#bea879" roughness={0.96} /></mesh>
    </group>)}
    {biome.terrainStyle === "tundra" && stumpPoints.slice(0, specialDamageCount).map((point, index) => <mesh key={`thaw-${index}`} position={[point.x, point.y + 0.025, point.z]} rotation={[-Math.PI / 2, 0, point.rotation]} scale={[0.45 + point.scale * 0.22, 0.26 + point.scale * 0.12, 1]}>
      <circleGeometry args={[1, 18]} /><meshPhysicalMaterial color="#526f68" roughness={0.3} transparent opacity={0.72} clearcoat={0.25} />
    </mesh>)}
    {biome.terrainStyle === "seabed" && stumpPoints.slice(0, specialDamageCount).map((point, index) => <group key={`bleached-coral-${index}`} position={[point.x, point.y, point.z]} rotation={[0, point.rotation, 0]} scale={0.62 + point.scale * 0.22}>
      {[[-0.18, 0.22, -0.04, -0.45], [0.08, 0.3, 0.1, 0.18], [0.25, 0.18, -0.08, 0.56]].map(([x, y, z, tilt], branch) => <mesh key={branch} position={[x, y, z]} rotation={[0, 0, tilt]} scale={[0.1, 0.46 - branch * 0.06, 0.1]}><capsuleGeometry args={[0.24, 0.7, 5, 8]} /><meshStandardMaterial color={branch % 2 ? "#ded8c5" : "#eee9db"} roughness={0.86} /></mesh>)}
    </group>)}
    {crackOpacity > 0 && biome.terrainStyle !== "seabed" && cracks.map((points, index) => <Line key={`crack-${index}`} points={points} color="#6a422d" lineWidth={1.25} transparent opacity={crackOpacity} />)}
    {Array.from({ length: debrisCount }, (_, index) => {
      const z = -5.5 + index * 0.95;
      const x = biome.waterStyle === "ocean" ? Math.sin(index * 1.7) * 1.8 : riverCenterX(z, biome) + (index % 2 ? -0.22 : 0.24);
      const y = biome.waterStyle === "ocean" ? 0.44 : waterSurfaceHeight(x, z, biome, drought) + 0.06;
      return <mesh key={`debris-${index}`} position={[x, y, biome.waterStyle === "ocean" ? Math.cos(index * 1.3) * 1.7 : z]} rotation={[index * 0.3, index * 0.7, index * 0.5]} scale={[0.11 + (index % 3) * 0.035, 0.025, 0.07]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={["#d9ad55", "#b65f72", "#d7d2b7"][index % 3]} roughness={0.62} />
      </mesh>;
    })}
  </group>;
}

function speciesPosition(biome: BiomeConfig, id: string, drought: number): [number, number, number] {
  const faunaSpawn = getBiomeFauna(biome.id).spawns.find((spawn) => spawn.role === id);
  if (faunaSpawn) {
    const [x, z] = faunaSpawn.anchor;
    if (faunaSpawn.motion === "river") return [x, waterSurfaceHeight(x, z, biome, drought) + faunaSpawn.height, z];
    if (faunaSpawn.motion === "midwater" || faunaSpawn.motion === "benthic") return [x, terrainHeight(x, z, biome) + faunaSpawn.height, z];
    if (faunaSpawn.motion === "flight" || faunaSpawn.motion === "hover") return [x, terrainHeight(x, z, biome) + faunaSpawn.height, z];
    return [x, terrainHeight(x, z, biome), z];
  }
  const anchor = SPECIES_ANCHORS[id] ?? [0, 0];
  const [x, z] = anchor;
  if (id === "river") return [x, waterSurfaceHeight(x, z, biome, drought), z];
  return [x, terrainHeight(x, z, biome), z];
}

function AnimalActor({ biome, spawn, instanceIndex, population, selectedId, focusId, onSelect, drought, habitatLoss, generationSeed }: {
  biome: BiomeConfig; spawn: FaunaSpawn; instanceIndex: number; population: number; selectedId: string | null; focusId?: string | null; onSelect: (id: string) => void; drought: number; habitatLoss: number; generationSeed: number;
}) {
  const root = useRef<THREE.Group>(null);
  const travel = useRef(0);
  const healthK = THREE.MathUtils.clamp(population / 100, 0.12, 1);
  const behaviorSeed = useMemo(() => Array.from(`${biome.id}:${spawn.id}:${instanceIndex}`).reduce((sum, letter) => sum + letter.charCodeAt(0), 0) * 0.071, [biome.id, instanceIndex, spawn.id]);
  const generatedOffset = useMemo((): [number, number] => {
    if (spawn.count === 1) return [0, 0];
    const salt = generationSeed + spawn.id.length * 19;
    const angle = seeded(salt, salt + 3) * Math.PI * 2 + instanceIndex * ((Math.PI * 2) / spawn.count);
    const distance = spawn.spread * (0.72 + seeded(instanceIndex + salt, salt + 7) * 0.28);
    return [Math.cos(angle) * distance, Math.sin(angle) * distance];
  }, [generationSeed, instanceIndex, spawn.count, spawn.id, spawn.spread]);
  const base = useMemo((): [number, number, number] => {
    const x = spawn.anchor[0] + generatedOffset[0];
    const z = spawn.anchor[1] + generatedOffset[1];
    if (spawn.motion === "river") return [x, waterSurfaceHeight(x, z, biome, drought) + spawn.height, z];
    if (spawn.motion === "flight" || spawn.motion === "hover" || spawn.motion === "midwater" || spawn.motion === "benthic") return [x, terrainHeight(x, z, biome) + spawn.height, z];
    return [x, terrainHeight(x, z, biome), z];
  }, [biome, drought, generatedOffset, spawn]);
  const displayScale = spawn.scale * (0.9 + population / 1000);
  const visibleCount = Math.max(1, Math.round(spawn.count * (0.5 + healthK * 0.5)));
  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    const phase = behaviorSeed;
    const elapsed = clock.elapsedTime;

    if (spawn.motion === "river" || spawn.motion === "midwater" || spawn.motion === "benthic") {
      const speed = spawn.speed * 0.48 * (0.34 + healthK * 0.72);
      const cruisePulse = 0.78 + Math.sin(elapsed * 0.37 + phase * 1.7) * 0.16 + Math.max(0, Math.sin(elapsed * 0.13 + phase)) * 0.2;
      travel.current += delta * speed * cruisePulse;
      const t = travel.current + phase;
      let x: number;
      let z: number;
      let dx: number;
      let dz: number;
      if (spawn.motion === "river" && ["river", "glacial", "ice-stream", "floodplain"].includes(biome.waterStyle)) {
        const swimSpan = spawn.radius[1] * (0.52 + healthK * 0.48);
        z = base[2] + Math.sin(t) * swimSpan;
        const nextZ = base[2] + Math.sin(t + 0.02) * swimSpan;
        x = riverCenterX(z, biome) + Math.sin(t * 1.7 + instanceIndex) * Math.min(0.34, spawn.radius[0]);
        const nextX = riverCenterX(nextZ, biome) + Math.sin((t + 0.02) * 1.7 + instanceIndex) * Math.min(0.34, spawn.radius[0]);
        dx = nextX - x;
        dz = nextZ - z;
        root.current.position.y = waterSurfaceHeight(x, z, biome, drought) + spawn.height + Math.sin(t * 2.2) * 0.045;
      } else {
        const radiusX = spawn.radius[0] * (0.46 + healthK * 0.54);
        const radiusZ = spawn.radius[1] * (0.46 + healthK * 0.54);
        x = base[0] + Math.sin(t) * radiusX;
        z = base[2] + Math.cos(t * 0.82) * radiusZ;
        dx = Math.cos(t) * radiusX;
        dz = -Math.sin(t * 0.82) * radiusZ * 0.82;
        root.current.position.y = spawn.motion === "river"
          ? waterSurfaceHeight(x, z, biome, drought) + spawn.height + Math.sin(t * 1.8) * 0.05
          : terrainHeight(x, z, biome) + spawn.height + Math.sin(t * (spawn.motion === "benthic" ? 1.15 : 1.6)) * (spawn.motion === "benthic" ? 0.025 : 0.12);
      }
      root.current.position.x = x;
      root.current.position.z = z;
      root.current.rotation.y = -Math.atan2(dz, dx);
      root.current.rotation.x = spawn.kind === "jellyfish" || spawn.kind === "seahorse" ? 0 : Math.sin(t * 0.84 + phase) * 0.035;
      root.current.rotation.z = spawn.kind === "jellyfish" || spawn.kind === "seahorse" || spawn.kind === "octopus" ? 0 : THREE.MathUtils.clamp(Math.sin(t * 0.92) * 0.1 + Math.atan2(dz, dx) * 0.018, -0.16, 0.16);
      return;
    }

    if (spawn.motion === "flight" || spawn.motion === "hover") {
      const speed = spawn.speed * 0.52 * (0.42 + healthK * 0.66);
      const glide = spawn.motion === "flight" ? THREE.MathUtils.smoothstep(Math.sin(elapsed * 0.31 + phase), 0.2, 0.82) : 0;
      const dart = spawn.kind === "dragonfly" ? 0.72 + Math.max(0, Math.sin(elapsed * 1.1 + phase)) * 0.6 : 1;
      travel.current += delta * speed * (1 - glide * 0.32) * dart;
      const t = travel.current + phase;
      const radiusX = spawn.radius[0];
      const radiusZ = spawn.radius[1];
      const retreat = (1 - healthK) * (spawn.motion === "flight" ? 2.2 : 0.7);
      const x = base[0] + Math.sin(t) * radiusX + retreat;
      const z = base[2] + Math.sin(t * 0.71 + 1.1) * radiusZ;
      const dx = Math.cos(t) * radiusX;
      const dz = Math.cos(t * 0.71 + 1.1) * radiusZ * 0.71;
      const altitude = spawn.height + Math.sin(t * 1.8) * (spawn.motion === "flight" ? 0.24 : 0.14) + Math.sin(elapsed * 0.21 + phase) * (spawn.motion === "flight" ? 0.28 : 0.07);
      root.current.position.set(x, terrainHeight(x, z, biome) + altitude, z);
      root.current.rotation.y = -Math.atan2(dz, dx);
      root.current.rotation.z = spawn.motion === "flight" ? Math.sin(t * 0.9) * (0.12 + glide * 0.08) : spawn.kind === "dragonfly" ? Math.sin(elapsed * 1.4 + phase) * 0.08 : 0;
      return;
    }

    const speed = spawn.speed * 0.3 * (0.36 + healthK * 0.72);
    const behaviorCycle = Math.sin(elapsed * (spawn.motion === "hop" ? 0.58 : 0.24) + phase * 1.31);
    const pause = THREE.MathUtils.smoothstep(behaviorCycle, spawn.motion === "hop" ? 0.3 : 0.42, 0.86);
    const moveFactor = 1 - pause * 0.94;
    travel.current += delta * speed * moveFactor;
    const t = travel.current + phase;
    const range = 0.42 + healthK * 0.58;
    const coverRetreat = THREE.MathUtils.clamp((habitatLoss - 18) / 82, 0, 1) * Math.min(1.6, spawn.radius[0]);
    const radiusX = spawn.radius[0] * range;
    const radiusZ = spawn.radius[1] * range;
    const x = base[0] + Math.sin(t) * radiusX + Math.sign(base[0] || 1) * coverRetreat;
    const z = base[2] + Math.sin(t * 0.73 + 0.8) * radiusZ + coverRetreat * 0.28;
    const dx = Math.cos(t) * radiusX;
    const dz = Math.cos(t * 0.73 + 0.8) * radiusZ * 0.73;
    const hop = spawn.motion === "hop" ? Math.pow(Math.max(0, Math.sin(elapsed * (1 + healthK) + phase)), 7) * 0.2 * healthK * moveFactor : 0;
    root.current.position.set(x, terrainHeight(x, z, biome) + hop, z);
    const scan = moveFactor < 0.2 ? Math.sin(elapsed * 0.72 + phase) * (spawn.motion === "hop" ? 0.36 : 0.18) : 0;
    root.current.rotation.y = -Math.atan2(dz, dx) + scan;
    root.current.rotation.x = 0;
    root.current.rotation.z = 0;
  });
  if (population < 12 || instanceIndex >= visibleCount) return null;
  const species = biome.species[spawn.role];
  const labelHeight = ["elephant", "bear", "yak"].includes(spawn.kind) ? 2.9 : ["deer", "pronghorn", "gazelle", "caribou", "brocket", "musk-deer"].includes(spawn.kind) ? 2.55 : ["turtle", "ray", "shark", "dolphin"].includes(spawn.kind) ? 1.55 : 1.7;
  return (
    <group ref={root} position={base} scale={displayScale}>
      <Selectable id={spawn.role} label={spawn.label} selected={selectedId === spawn.role} hinted={focusId === spawn.role && instanceIndex === 0} onSelect={onSelect} labelHeight={labelHeight}>
        <AnimalModel kind={spawn.kind} primary={spawn.primary ?? species.primary} secondary={spawn.secondary ?? species.secondary} seed={behaviorSeed + instanceIndex} simplified={instanceIndex > 0} />
      </Selectable>
    </group>
  );
}

function InvasiveCluster({ biome, selectedId, onSelect }: { biome: BiomeConfig; selectedId: string | null; onSelect: (id: string) => void }) {
  const anchor = SPECIES_ANCHORS.invasive_plant;
  const y = terrainHeight(anchor[0], anchor[1], biome);
  return <Selectable id="invasive_plant" label={biome.pressures.invasiveSpecies} selected={selectedId === "invasive_plant"} onSelect={onSelect} labelHeight={1.2}>
    <group position={[anchor[0], y, anchor[1]]}>{Array.from({ length: 10 }, (_, index) => <group key={index} position={[(index % 4) * 0.18 - 0.25, 0, Math.floor(index / 4) * 0.18 - 0.18]}><mesh position={[0, 0.28 + (index % 2) * 0.1, 0]} scale={[0.12, 0.42, 0.12]}><capsuleGeometry args={[0.22, 0.62, 6, 10]} /><meshStandardMaterial color="#713f88" roughness={0.82} /></mesh><mesh position={[0, 0.72, 0]}><octahedronGeometry args={[0.13, 1]} /><meshStandardMaterial color="#bc72cf" emissive="#552963" emissiveIntensity={0.16} /></mesh></group>)}</group>
  </Selectable>;
}

function World({ biome, metrics, populations, pollution, drought, habitatLoss, invasive, selectedId, connectionIds, focusId, onSelect }: Props) {
  const haze = pollution / 100;
  const connectionStart = selectedId ? speciesPosition(biome, selectedId, drought) : null;
  const faunaProfile = getBiomeFauna(biome.id);
  const fogColor = new THREE.Color(biome.palette.fog).lerp(new THREE.Color("#85857a"), haze * 0.58);
  return (
    <>
      <color attach="background" args={[biome.palette.skyHorizon]} />
      <fog attach="fog" args={[fogColor, biome.waterStyle === "ocean" ? 22 : 25 - haze * 5, biome.waterStyle === "ocean" ? 68 : 66 - haze * 12]} />
      <ambientLight intensity={biome.waterStyle === "ocean" ? 0.62 : 0.72 - haze * 0.18} color={biome.waterStyle === "ocean" ? "#8de0dd" : "#e0fff2"} />
      <directionalLight castShadow={biome.waterStyle !== "ocean"} position={[-7, 13, 6]} intensity={biome.waterStyle === "ocean" ? 1.65 : 2.55 - haze} color={biome.palette.sunlight} shadow-mapSize={[1024, 1024]} />
      <hemisphereLight args={[biome.palette.skyHorizon, biome.palette.cliff, biome.waterStyle === "ocean" ? 1.75 : 1.25]} />
      <Sky biome={biome} pollution={pollution} />
      <BackgroundWorld biome={biome} pollution={pollution} />
      <WeatherAtmosphere biome={biome} drought={drought} pollution={pollution} />

      <group rotation={[0, -0.24, 0]}>
        <TerrainIsland biome={biome} vegetation={metrics.vegetation} habitatLoss={habitatLoss} />
        <WaterFeature biome={biome} waterQuality={metrics.waterQuality} drought={drought} pollution={pollution} />
        {biome.waterStyle === "ocean" && <UnderwaterEcosystem waterLevel={4.72} seabedY={0.18} radius={10.7} seed={faunaProfile.generationSeed} waterColor={biome.palette.water} accentColor={biome.palette.accent} density="high" />}
        <WorldLandmarks biome={biome} drought={drought} fishPopulation={populations.fish ?? 90} />
        <WeatherGroundDetails biome={biome} drought={drought} />
        <FloraField biome={biome} metrics={metrics} population={populations.oak ?? 90} selectedId={selectedId} onSelect={onSelect} />
        <MeadowField biome={biome} metrics={metrics} population={populations.wildflower ?? 90} selectedId={selectedId} onSelect={onSelect} />
        <GroundDetails biome={biome} />
        <DamageVisualization biome={biome} habitatLoss={habitatLoss} drought={drought} pollution={pollution} />
        {faunaProfile.spawns.flatMap((spawn) => Array.from({ length: spawn.count }, (_, instanceIndex) => (
          <AnimalActor key={`${spawn.id}-${instanceIndex}`} biome={biome} spawn={spawn} instanceIndex={instanceIndex} generationSeed={faunaProfile.generationSeed} population={populations[spawn.role] ?? 86} selectedId={selectedId} focusId={focusId} onSelect={onSelect} drought={drought} habitatLoss={habitatLoss} />
        )))}
        {invasive && <InvasiveCluster biome={biome} selectedId={selectedId} onSelect={onSelect} />}
        {connectionStart && connectionIds.map((id) => {
          const end = speciesPosition(biome, id, drought);
          return <Line key={id} points={[connectionStart, [connectionStart[0], connectionStart[1] + 0.75, connectionStart[2]], [end[0], end[1] + 0.5, end[2]], end]} color={biome.palette.accent} lineWidth={2} transparent opacity={0.78} dashed dashSize={0.2} gapSize={0.12} />;
        })}
        <Sparkles count={Math.round(18 + metrics.biodiversity * 0.34)} scale={[14, biome.waterStyle === "ocean" ? 7 : 4.5, 10]} size={1.3} speed={biome.waterStyle === "ocean" ? 0.12 : 0.24} opacity={0.22 + metrics.biodiversity / 260} color={biome.waterStyle === "ocean" ? "#bff7ed" : biome.palette.accent} />
      </group>
      <OrbitControls makeDefault enablePan={false} minDistance={10} maxDistance={44} minPolarAngle={0.48} maxPolarAngle={1.3} target={[0, biome.terrainStyle === "alpine" ? 0.9 : 0.55, 0]} autoRotate={!selectedId} autoRotateSpeed={0.1} />
    </>
  );
}

function DiagnosticsProbe({ biome }: { biome: BiomeConfig }) {
  const { gl, scene } = useThree();
  const frame = useRef(0);
  const sampleStart = useRef(0);
  useFrame(({ clock }) => {
    if (sampleStart.current === 0) sampleStart.current = clock.elapsedTime;
    frame.current += 1;
    if (frame.current % 90 !== 0) return;
    const elapsed = Math.max(0.001, clock.elapsedTime - sampleStart.current);
    const fps = 90 / elapsed;
    sampleStart.current = clock.elapsedTime;
    const materials = new Set<THREE.Material>();
    let meshes = 0;
    let instancedMeshes = 0;
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        meshes += 1;
        if (object instanceof THREE.InstancedMesh) instancedMeshes += 1;
        const value = object.material;
        if (Array.isArray(value)) value.forEach((item) => materials.add(item)); else materials.add(value);
      }
    });
    document.documentElement.dataset.threeDiagnostics = JSON.stringify({
      biome: biome.id, calls: gl.info.render.calls, triangles: gl.info.render.triangles, points: gl.info.render.points, lines: gl.info.render.lines,
      geometries: gl.info.memory.geometries, textures: gl.info.memory.textures, materials: materials.size, meshes, instancedMeshes,
      fps: Number(fps.toFixed(1)), frameMs: Number((1000 / fps).toFixed(2)), dprCap: biome.waterStyle === "ocean" ? 1.12 : 1.42, shadowMap: biome.waterStyle === "ocean" ? 0 : 1024, postPasses: 0,
    });
  });
  return null;
}

export function EcosystemScene(props: Props) {
  return (
    <Canvas
      key={props.biome.id}
      shadows={props.biome.waterStyle !== "ocean"}
      dpr={[1, props.biome.waterStyle === "ocean" ? 1.12 : 1.42]}
      camera={{ position: [21.5, 15.2, 23.8], fov: 41, near: 0.1, far: 140 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = props.biome.waterStyle === "ocean" ? 1.04 : 0.94; gl.outputColorSpace = THREE.SRGBColorSpace; }}
      onPointerMissed={() => undefined}
    >
      <Suspense fallback={null}>
        <World {...props} />
        <DiagnosticsProbe biome={props.biome} />
      </Suspense>
    </Canvas>
  );
}
