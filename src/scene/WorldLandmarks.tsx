"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { BiomeConfig } from "../types/biome";
import { riverCenterX, terrainHeight, waterSurfaceHeight } from "./terrain";

const at = (biome: BiomeConfig, x: number, z: number, offset = 0): [number, number, number] => [x, terrainHeight(x, z, biome) + offset, z];

function HabitatCorridor({ biome }: { biome: BiomeConfig }) {
  const points = useMemo(() => Array.from({ length: 28 }, (_, index) => {
    const z = -9.2 + index * 0.69;
    const x = Math.sin(index * 0.38) * 5.5 + (biome.waterStyle === "ocean" ? 0 : riverCenterX(z, biome) * 0.32);
    return new THREE.Vector3(x, terrainHeight(x, z, biome) + 0.045, z);
  }), [biome]);
  return <Line points={points} color={biome.palette.accent} lineWidth={1.2} transparent opacity={0.22} dashed dashSize={0.35} gapSize={0.28} />;
}

function RainforestLandmark({ biome }: { biome: BiomeConfig }) {
  const p = at(biome, -5.9, -4.75);
  return <group position={p}>
    <group position={[0, 0.48, 0]} rotation={[0.08, -0.42, Math.PI / 2]}>
      <mesh castShadow><cylinderGeometry args={[0.58, 0.72, 4.4, 14]} /><meshStandardMaterial color="#5d402d" roughness={0.98} /></mesh>
      <mesh position={[0, 0.04, 0.62]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.34, 0.08, 8, 18]} /><meshStandardMaterial color="#9ac26e" roughness={0.9} /></mesh>
      {[-1.4, -0.55, 0.7, 1.4].map((y, index) => <group key={y} position={[0.1, y, 0.58]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh position={[0, 0.14, 0]}><cylinderGeometry args={[0.035, 0.05, 0.28, 6]} /><meshStandardMaterial color="#e9d8bd" /></mesh>
        <mesh position={[0, 0.31, 0]} scale={[0.22 + index * 0.025, 0.1, 0.22 + index * 0.025]}><sphereGeometry args={[1, 12, 7]} /><meshStandardMaterial color={index % 2 ? "#e59658" : "#d8c779"} roughness={0.8} /></mesh>
      </group>)}
    </group>
    {[[-1.4, 0.2, -1.0, 1.15], [1.55, 0.1, -0.65, 1.0], [0.55, 0.15, 1.35, 0.86]].map(([x, y, z, scale], treeIndex) => <group key={treeIndex} position={[x, y, z]} scale={scale}>
      <mesh castShadow position={[0, 1.8, 0]}><cylinderGeometry args={[0.24, 0.42, 3.6, 11]} /><meshStandardMaterial color="#573b29" roughness={1} /></mesh>
      {[2.1, 2.85, 3.55].map((height, layer) => <mesh key={height} castShadow position={[0, height, 0]} scale={[1.25 - layer * 0.22, 1, 1.25 - layer * 0.22]}><coneGeometry args={[1.2, 1.55, 14]} /><meshStandardMaterial color={layer % 2 ? "#2f6b45" : "#255b3c"} roughness={0.96} /></mesh>)}
      {[[-0.48, 0.22, 0.18], [0.35, 0.18, -0.28], [0.08, 0.14, 0.48]].map((fern, index) => <mesh key={index} position={fern as [number, number, number]} rotation={[0, index * 1.7, index % 2 ? 0.18 : -0.15]} scale={[0.22, 0.68, 0.38]}><coneGeometry args={[0.75, 1, 5]} /><meshStandardMaterial color="#5d9554" roughness={0.94} /></mesh>)}
    </group>)}
  </group>;
}

function DesertLandmark({ biome }: { biome: BiomeConfig }) {
  const p = at(biome, -7.2, -4.9);
  return <group position={p} rotation={[0, 0.28, 0]}>
    {[-1.25, 1.25].map((x) => <mesh key={x} castShadow position={[x, 1.45, 0]} scale={[0.78, 1.9, 0.86]}><dodecahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#985737" roughness={0.96} /></mesh>)}
    <mesh castShadow position={[0, 2.7, 0]} rotation={[0, 0, 0]}><torusGeometry args={[1.45, 0.42, 10, 32, Math.PI]} /><meshStandardMaterial color="#a9613d" roughness={0.94} /></mesh>
    <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.8, 1.3, 1]}><circleGeometry args={[1, 28]} /><meshStandardMaterial color="#b66b43" transparent opacity={0.5} /></mesh>
  </group>;
}

function SavannaLandmark({ biome }: { biome: BiomeConfig }) {
  const p = at(biome, -7.6, -4.8);
  return <group position={p}>
    <mesh castShadow position={[0, 1.85, 0]} scale={[0.7, 1.7, 0.7]}><cylinderGeometry args={[0.45, 0.88, 2.3, 11]} /><meshStandardMaterial color="#7a4e2e" roughness={1} /></mesh>
    {[[-0.75, 3.4, 0.2], [0.6, 3.55, 0], [0, 3.9, -0.25]].map((position, index) => <mesh key={index} castShadow position={position as [number, number, number]} scale={[1.05, 0.55, 0.85]}><sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color={index % 2 ? biome.palette.flora : biome.palette.floraSecondary} roughness={0.96} /></mesh>)}
    {[[-2.2, 0.65, 1.2], [2.1, 0.45, -1.35], [2.7, 0.32, 0.4]].map((position, index) => <mesh key={index} castShadow position={position as [number, number, number]} scale={[0.48 + index * 0.08, 1.1 + index * 0.2, 0.48 + index * 0.08]}><coneGeometry args={[0.65, 1.5, 12]} /><meshStandardMaterial color="#9b623a" roughness={1} /></mesh>)}
  </group>;
}

function TundraLandmark({ biome }: { biome: BiomeConfig }) {
  const p = at(biome, -7.35, -5.15);
  return <group position={p}>
    {[[0, 1.6, 0, 1], [-1.15, 1.0, 0.4, 0.68], [1.25, 0.82, -0.3, 0.55]].map(([x, y, z, scale], index) => <mesh key={index} castShadow position={[x, y, z]} rotation={[0.08, index * 0.42, index % 2 ? -0.16 : 0.12]} scale={[scale, scale * 2.2, scale]}><octahedronGeometry args={[1, 1]} /><meshPhysicalMaterial color="#d5eff2" roughness={0.2} transmission={0.08} clearcoat={0.7} transparent opacity={0.88} /></mesh>)}
    <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.7, 1.5, 1]}><circleGeometry args={[1, 28]} /><meshStandardMaterial color="#eef5f2" transparent opacity={0.48} /></mesh>
  </group>;
}

function FloodplainLandmark({ biome }: { biome: BiomeConfig }) {
  const p = at(biome, -7.5, -4.75);
  return <group position={p}>
    <mesh castShadow position={[0, 2.0, 0]} scale={[0.75, 1.8, 0.75]}><cylinderGeometry args={[0.48, 0.82, 2.5, 12]} /><meshStandardMaterial color="#684530" roughness={1} /></mesh>
    {[-1, 1].map((side) => <mesh key={side} castShadow position={[side * 0.65, 0.62, 0]} rotation={[0, 0, side * 0.68]} scale={[0.28, 1.1, 0.42]}><coneGeometry args={[0.78, 1.8, 4]} /><meshStandardMaterial color="#765039" roughness={1} /></mesh>)}
    {[[-0.55, 4.0, 0], [0.52, 4.2, -0.25], [0, 4.5, 0.45]].map((position, index) => <mesh key={index} castShadow position={position as [number, number, number]} scale={[1.15, 0.9, 1.05]}><icosahedronGeometry args={[1, 2]} /><meshStandardMaterial color={index % 2 ? biome.palette.flora : biome.palette.floraSecondary} roughness={0.92} /></mesh>)}
  </group>;
}

function AlpineLandmark({ biome }: { biome: BiomeConfig }) {
  const p = at(biome, -8.2, -5.3);
  return <group position={p}>
    {[[0, 1.8, 0, 1.45], [-1.7, 1.1, 0.4, 0.9], [1.5, 0.95, -0.4, 0.78]].map(([x, y, z, scale], index) => <group key={index} position={[x, y, z]} scale={scale}>
      <mesh castShadow><coneGeometry args={[1, 2.6, 6]} /><meshStandardMaterial color="#657276" roughness={0.98} /></mesh>
      <mesh position={[0, 0.88, 0]}><coneGeometry args={[0.58, 1.05, 6]} /><meshStandardMaterial color="#eef3ef" roughness={0.88} /></mesh>
    </group>)}
    {[0, 1, 2, 3].map((index) => <mesh key={index} castShadow position={[2.7, 0.18 + index * 0.27, 1.2]} scale={[0.42 - index * 0.06, 0.2, 0.38 - index * 0.05]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#7a7c75" roughness={1} /></mesh>)}
  </group>;
}

function ReefLandmark({ biome, x, z, scale = 1 }: { biome: BiomeConfig; x: number; z: number; scale?: number }) {
  const p: [number, number, number] = [x, terrainHeight(x, z, biome) + 0.05, z];
  const coralGeometries = useMemo(() => {
    const buckets: THREE.BufferGeometry[][] = [[], []];
    Array.from({ length: 12 }, (_, index) => {
      const angle = -1.2 + index * 0.22;
      const height = 1.2 + (index % 5) * 0.28;
      const geometry = new THREE.CapsuleGeometry(0.22, 0.7, 6, 10);
      geometry.applyMatrix4(new THREE.Matrix4().compose(
        new THREE.Vector3(Math.sin(angle) * 0.95, height * 0.45, Math.cos(angle) * 0.38),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, angle * 0.34)),
        new THREE.Vector3(0.12, height, 0.12),
      ));
      buckets[index % 3 ? 0 : 1].push(geometry);
    });
    return buckets.map((bucket) => {
      const merged = mergeGeometries(bucket, false);
      bucket.forEach((geometry) => geometry.dispose());
      return merged;
    });
  }, []);
  useEffect(() => () => coralGeometries.forEach((geometry) => geometry?.dispose()), [coralGeometries]);
  return <group position={p} scale={scale}>
    {coralGeometries.map((geometry, index) => geometry && <mesh key={index} geometry={geometry}><meshStandardMaterial color={index ? biome.palette.floraSecondary : biome.palette.flora} emissive={index ? biome.palette.floraSecondary : biome.palette.flora} emissiveIntensity={0.12} roughness={0.48} /></mesh>)}
    <mesh position={[0, 0.12, 0]} scale={[1.65, 0.22, 1.2]}><sphereGeometry args={[1, 18, 10]} /><meshStandardMaterial color={biome.palette.cliff} roughness={0.9} /></mesh>
    {[-1, 1].map((side) => <mesh key={side} position={[side * 1.65, 0.28, 0.35]} rotation={[-Math.PI / 2, 0, side * 0.25]} scale={[0.7, 0.35, 0.22]}><sphereGeometry args={[1, 18, 10]} /><meshPhysicalMaterial color="#d7b46f" roughness={0.45} clearcoat={0.35} /></mesh>)}
  </group>;
}

function SalmonRun({ biome, drought, population }: { biome: BiomeConfig; drought: number; population: number }) {
  const bodies = useRef<THREE.InstancedMesh>(null);
  const tails = useRef<THREE.InstancedMesh>(null);
  const bodyDummy = useRef(new THREE.Object3D());
  const tailDummy = useRef(new THREE.Object3D());
  const count = 9;
  useFrame(({ clock }) => {
    if (!bodies.current || !tails.current) return;
    const visible = Math.max(0, Math.round(count * THREE.MathUtils.clamp(population / 100, 0, 1)));
    bodies.current.count = visible;
    tails.current.count = visible;
    const time = clock.elapsedTime * 0.52;
    for (let index = 0; index < visible; index += 1) {
      const lane = index % 3;
      const z = -7.4 + ((time + index * 1.47) % 14.8);
      const x = riverCenterX(z, biome) + (lane - 1) * 0.16;
      const nextZ = z + 0.08;
      const nextX = riverCenterX(nextZ, biome) + (lane - 1) * 0.16;
      const angle = -Math.atan2(nextZ - z, nextX - x);
      const y = waterSurfaceHeight(x, z, biome, drought) - 0.05 + Math.sin(time * 3 + index) * 0.035;
      bodyDummy.current.position.set(x, y, z);
      bodyDummy.current.rotation.set(0, angle, 0);
      bodyDummy.current.scale.set(0.42, 0.16, 0.13);
      bodyDummy.current.updateMatrix();
      bodies.current.setMatrixAt(index, bodyDummy.current.matrix);

      tailDummy.current.position.set(x, y, z);
      tailDummy.current.rotation.set(0, angle, Math.PI / 2);
      tailDummy.current.translateX(-0.4);
      tailDummy.current.scale.set(0.17, 0.22, 0.07);
      tailDummy.current.updateMatrix();
      tails.current.setMatrixAt(index, tailDummy.current.matrix);
    }
    bodies.current.instanceMatrix.needsUpdate = true;
    tails.current.instanceMatrix.needsUpdate = true;
  });
  return <group>
    <instancedMesh ref={bodies} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 14, 9]} />
      <meshPhysicalMaterial color="#d27845" roughness={0.42} clearcoat={0.25} />
    </instancedMesh>
    <instancedMesh ref={tails} args={[undefined, undefined, count]} frustumCulled={false}>
      <coneGeometry args={[1, 1, 4]} />
      <meshStandardMaterial color="#e3b268" roughness={0.56} />
    </instancedMesh>
  </group>;
}

function WaterLife({ biome, drought }: { biome: BiomeConfig; drought: number }) {
  if (biome.waterStyle === "ocean") return null;
  const pads = Array.from({ length: biome.waterStyle === "floodplain" ? 11 : 5 }, (_, index) => {
    const z = -6 + index * 1.05;
    const x = riverCenterX(z, biome) + (index % 2 ? -0.34 : 0.32);
    return { x, z, y: waterSurfaceHeight(x, z, biome, drought) + 0.022 };
  });
  return <group>{pads.map((pad, index) => <group key={index} position={[pad.x, pad.y, pad.z]} rotation={[-Math.PI / 2, 0, index * 0.8]}>
    <mesh scale={[0.28 + (index % 3) * 0.06, 0.22 + (index % 2) * 0.04, 1]}><circleGeometry args={[1, 16, 0.24, Math.PI * 1.76]} /><meshStandardMaterial color={biome.waterStyle === "ice-stream" ? "#dbe8e5" : "#5f944e"} roughness={0.82} side={THREE.DoubleSide} /></mesh>
    {index % 3 === 0 && <mesh position={[0.08, 0.04, 0.04]} rotation={[Math.PI / 2, 0, 0]}><sphereGeometry args={[0.07, 10, 7]} /><meshStandardMaterial color="#f0a8c6" emissive="#8e466a" emissiveIntensity={0.12} /></mesh>}
  </group>)}</group>;
}

export function WorldLandmarks({ biome, drought, fishPopulation }: { biome: BiomeConfig; drought: number; fishPopulation: number }) {
  return <group>
    <HabitatCorridor biome={biome} />
    {biome.terrainStyle === "valley" && <RainforestLandmark biome={biome} />}
    {biome.terrainStyle === "dunes" && <DesertLandmark biome={biome} />}
    {biome.terrainStyle === "grassland" && <SavannaLandmark biome={biome} />}
    {biome.terrainStyle === "tundra" && <TundraLandmark biome={biome} />}
    {biome.terrainStyle === "floodplain" && <FloodplainLandmark biome={biome} />}
    {biome.terrainStyle === "alpine" && <AlpineLandmark biome={biome} />}
    {biome.terrainStyle === "seabed" && <>
      <ReefLandmark biome={biome} x={-4.8} z={-3.1} scale={1.15} />
      <ReefLandmark biome={biome} x={4.9} z={2.8} scale={0.92} />
      <ReefLandmark biome={biome} x={-1.2} z={5.8} scale={0.72} />
      {[[-4.8, 5.4, -1.4], [0.4, 6.1, 2.2], [5.1, 5.7, -2.5]].map(([x, height, z], index) => <mesh key={`shaft-${index}`} position={[x, height * 0.44, z]} rotation={[0, 0, index % 2 ? -0.08 : 0.07]}>
        <coneGeometry args={[1.25, height, 24, 1, true]} />
        <meshBasicMaterial color="#a9fff2" transparent opacity={0.028} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>)}
    </>}
    {biome.terrainStyle === "valley" && <SalmonRun biome={biome} drought={drought} population={fishPopulation} />}
    <WaterLife biome={biome} drought={drought} />
  </group>;
}
