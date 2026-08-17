"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { BiomeConfig } from "../types/biome";
import { scatterLand, seeded } from "./terrain";

type WeatherKind = "rain" | "snow" | "dust" | "bubbles";

const weatherKind = (biome: BiomeConfig): WeatherKind => {
  if (biome.waterStyle === "ocean") return "bubbles";
  if (biome.terrainStyle === "tundra" || biome.terrainStyle === "alpine") return "snow";
  if (biome.terrainStyle === "dunes" || biome.terrainStyle === "grassland") return "dust";
  return "rain";
};

function anchorToView(group: THREE.Group, camera: THREE.Camera, distance: number) {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  group.position.set(camera.position.x + forward.x * distance, 0, camera.position.z + forward.z * distance);
}

function RainVolume({ biome, drought, pollution }: { biome: BiomeConfig; drought: number; pollution: number }) {
  const group = useRef<THREE.Group>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const { camera } = useThree();
  const state = useMemo(() => {
    const count = 230;
    const source = new Float32Array(count * 2 * 3);
    const speeds = new Float32Array(count);
    for (let index = 0; index < count; index += 1) {
      const x = (seeded(index, 301) - 0.5) * 14;
      const y = seeded(index, 302) * 11 - 0.8;
      const z = (seeded(index, 303) - 0.5) * 14;
      const offset = index * 6;
      source[offset] = x; source[offset + 1] = y; source[offset + 2] = z;
      source[offset + 3] = x + 0.045; source[offset + 4] = y - 0.34; source[offset + 5] = z;
      speeds[index] = 5.8 + seeded(index, 304) * 3.4;
    }
    return { source, speeds, count };
  }, []);

  useFrame((_, delta) => {
    if (!group.current || !geometryRef.current) return;
    const attribute = geometryRef.current.getAttribute("position") as THREE.BufferAttribute;
    const position = attribute.array as Float32Array;
    anchorToView(group.current, camera, 11.5);
    const density = THREE.MathUtils.clamp((0.78 - drought * 0.0062) + pollution * 0.0016, 0.2, 0.94);
    const visible = Math.round(state.count * density);
    geometryRef.current.setDrawRange(0, visible * 2);
    const slant = 0.48 + pollution * 0.006;
    for (let index = 0; index < visible; index += 1) {
      const offset = index * 6;
      const fall = state.speeds[index] * delta;
      position[offset] += slant * delta;
      position[offset + 1] -= fall;
      position[offset + 3] = position[offset] + 0.045 + slant * 0.035;
      position[offset + 4] = position[offset + 1] - 0.34;
      if (position[offset + 1] < -1.8) {
        position[offset] = (seeded(index, Math.floor(performance.now() * 0.002) + 311) - 0.5) * 14;
        position[offset + 1] = 9.5 + seeded(index, 312) * 1.5;
        position[offset + 2] = (seeded(index, 313) - 0.5) * 14;
      }
    }
    attribute.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={geometryRef}>
          <bufferAttribute attach="attributes-position" args={[state.source, 3]} usage={THREE.DynamicDrawUsage} />
        </bufferGeometry>
        <lineBasicMaterial color={biome.waterStyle === "floodplain" ? "#c3e5dc" : "#d8eff1"} transparent opacity={0.16} depthWrite={false} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

function FloatingWeather({ biome, kind, drought, pollution }: { biome: BiomeConfig; kind: Exclude<WeatherKind, "rain">; drought: number; pollution: number }) {
  const group = useRef<THREE.Group>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const { camera } = useThree();
  const state = useMemo(() => {
    const count = kind === "snow" ? 430 : kind === "bubbles" ? 220 : 260;
    const source = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let index = 0; index < count; index += 1) {
      source[index * 3] = (seeded(index, 401) - 0.5) * (kind === "dust" ? 22 : 20);
      source[index * 3 + 1] = seeded(index, 402) * (kind === "dust" ? 6 : 13) - 1;
      source[index * 3 + 2] = (seeded(index, 403) - 0.5) * 25;
      speeds[index] = 0.35 + seeded(index, 404) * (kind === "snow" ? 0.9 : kind === "bubbles" ? 0.55 : 0.75);
    }
    return { source, speeds, count };
  }, [kind]);

  useFrame(({ clock }, delta) => {
    if (!group.current || !geometryRef.current) return;
    const attribute = geometryRef.current.getAttribute("position") as THREE.BufferAttribute;
    const position = attribute.array as Float32Array;
    anchorToView(group.current, camera, kind === "dust" ? 8.5 : 7.5);
    const density = kind === "dust"
      ? THREE.MathUtils.clamp(0.28 + drought * 0.006 + pollution * 0.002, 0.28, 0.88)
      : kind === "snow"
        ? THREE.MathUtils.clamp(0.68 + pollution * 0.001, 0.5, 0.82)
        : 0.72;
    const visible = Math.round(state.count * density);
    geometryRef.current.setDrawRange(0, visible);
    for (let index = 0; index < visible; index += 1) {
      const offset = index * 3;
      if (kind === "bubbles") {
        position[offset + 1] += state.speeds[index] * delta;
        position[offset] += Math.sin(clock.elapsedTime * 0.7 + index) * delta * 0.08;
        if (position[offset + 1] > 10.5) position[offset + 1] = -0.8;
      } else if (kind === "dust") {
        position[offset] += state.speeds[index] * delta * (1.1 + drought * 0.01);
        position[offset + 2] += Math.sin(clock.elapsedTime * 0.35 + index) * delta * 0.18;
        if (position[offset] > 11) position[offset] = -11;
      } else {
        position[offset + 1] -= state.speeds[index] * delta;
        position[offset] += (Math.sin(clock.elapsedTime * 0.6 + index * 0.7) * 0.35 + 0.22) * delta;
        if (position[offset + 1] < -1.5) position[offset + 1] = 11.5 + seeded(index, 411) * 1.8;
      }
    }
    attribute.needsUpdate = true;
  });

  const color = kind === "snow" ? "#f4fbff" : kind === "bubbles" ? "#bdf8f1" : biome.palette.sunlight;
  return (
    <group ref={group}>
      <points frustumCulled={false}>
        <bufferGeometry ref={geometryRef}>
          <bufferAttribute attach="attributes-position" args={[state.source, 3]} usage={THREE.DynamicDrawUsage} />
        </bufferGeometry>
        <pointsMaterial color={color} size={kind === "snow" ? 0.085 : kind === "bubbles" ? 0.055 : 0.065} transparent opacity={kind === "dust" ? 0.3 : 0.56} depthWrite={false} sizeAttenuation toneMapped={false} />
      </points>
    </group>
  );
}

export function WeatherAtmosphere({ biome, drought, pollution }: { biome: BiomeConfig; drought: number; pollution: number }) {
  const kind = weatherKind(biome);
  return kind === "rain"
    ? <RainVolume biome={biome} drought={drought} pollution={pollution} />
    : <FloatingWeather biome={biome} kind={kind} drought={drought} pollution={pollution} />;
}

export function WeatherGroundDetails({ biome, drought }: { biome: BiomeConfig; drought: number }) {
  const kind = weatherKind(biome);
  const patches = useMemo(() => scatterLand(biome, kind === "rain" ? 9 : kind === "snow" ? 13 : 0, 744, {
    minRadius: 2.4,
    maxRadius: 10.4,
    waterClearance: 0.55,
    minSpacing: 1.4,
    maxSlope: 0.3,
  }), [biome, kind]);
  if (kind !== "rain" && kind !== "snow") return null;
  const opacity = kind === "rain" ? THREE.MathUtils.clamp(0.24 - drought * 0.0018, 0.06, 0.24) : 0.34;
  return (
    <group>
      {patches.map((patch, index) => (
        <mesh key={index} position={[patch.x, patch.y + 0.018, patch.z]} rotation={[-Math.PI / 2, 0, patch.rotation]} scale={[patch.scale * 0.75, patch.scale * (0.36 + (index % 3) * 0.08), 1]}>
          <circleGeometry args={[0.62, 18]} />
          <meshPhysicalMaterial
            color={kind === "rain" ? biome.palette.water : "#eaf3f3"}
            roughness={kind === "rain" ? 0.12 : 0.82}
            metalness={kind === "rain" ? 0.08 : 0}
            clearcoat={kind === "rain" ? 0.8 : 0}
            transparent
            opacity={opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
