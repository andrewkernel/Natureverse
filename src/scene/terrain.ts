import * as THREE from "three";
import type { BiomeConfig } from "../types/biome";

export const ISLAND_RADIUS = 12.2;

const fract = (value: number) => value - Math.floor(value);
export const seeded = (index: number, salt = 0) => fract(Math.sin(index * 918.13 + salt * 37.71) * 43758.5453);

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const waveNoise = (x: number, z: number) =>
  Math.sin(x * 0.71 + z * 0.23) * 0.5 +
  Math.sin(z * 0.93 - x * 0.31) * 0.3 +
  Math.sin((x + z) * 1.57) * 0.2;

export function riverCenterX(z: number, biome: BiomeConfig) {
  if (biome.waterStyle === "glacial") return Math.sin(z * 0.38) * 0.68 - 0.25;
  if (biome.waterStyle === "floodplain") return Math.sin(z * 0.42) * 0.95 + Math.sin(z * 0.9) * 0.15;
  if (biome.waterStyle === "ice-stream") return Math.sin(z * 0.32) * 0.45;
  return Math.sin(z * 0.52) * 0.56;
}

export function waterDistance(x: number, z: number, biome: BiomeConfig) {
  if (biome.waterStyle === "ocean") return -10;
  if (biome.waterStyle === "oasis") return Math.hypot(x + 0.25, z - 0.05) - 2.15;
  if (biome.waterStyle === "waterhole") return Math.hypot(x - 0.4, z + 0.1) - 1.82;
  const width = biome.waterStyle === "floodplain" ? 1.28 : biome.waterStyle === "glacial" ? 0.72 : biome.waterStyle === "ice-stream" ? 0.62 : 0.82;
  return Math.abs(x - riverCenterX(z, biome)) - width;
}

function baseTerrainHeight(x: number, z: number, biome: BiomeConfig) {
  const radius = Math.hypot(x, z);
  const n = waveNoise(x, z);
  if (biome.terrainStyle === "dunes") {
    const dune = Math.sin(x * 0.52 + Math.sin(z * 0.32)) * 0.24 + Math.sin(z * 0.34) * 0.18;
    const oasisBowl = Math.max(0, 1 - Math.hypot(x + 0.25, z) / 3.2) * -0.26;
    return 0.34 + dune + oasisBowl + radius * 0.018;
  }
  if (biome.terrainStyle === "grassland") {
    const kopje = Math.exp(-((x + 4.4) ** 2 + (z - 2.3) ** 2) / 2.4) * 0.72;
    return 0.29 + n * 0.12 + kopje + Math.max(0, radius - 6) * 0.025;
  }
  if (biome.terrainStyle === "tundra") {
    const hummocks = Math.sin(x * 1.7) * Math.sin(z * 1.45) * 0.07;
    return 0.26 + n * 0.09 + hummocks + Math.max(0, radius - 6.2) * 0.035;
  }
  if (biome.terrainStyle === "floodplain") {
    const levee = Math.sin(z * 0.48 + x * 0.2) * 0.1;
    return 0.23 + n * 0.08 + levee + Math.max(0, radius - 6.4) * 0.025;
  }
  if (biome.terrainStyle === "alpine") {
    const radialRise = Math.pow(radius / ISLAND_RADIUS, 1.85) * 1.22;
    const ridge = Math.abs(Math.sin(x * 0.48 + z * 0.16)) * 0.34 * smoothstep(2.4, 8.2, radius);
    const valley = Math.exp(-(x * x) / 2.1) * -0.34;
    return 0.2 + radialRise + ridge + n * 0.14 + valley;
  }
  if (biome.terrainStyle === "seabed") {
    const reefA = Math.exp(-((x + 3.3) ** 2 + (z - 1.8) ** 2) / 3.4) * 0.78;
    const reefB = Math.exp(-((x - 3.7) ** 2 + (z + 2.4) ** 2) / 2.8) * 0.62;
    return 0.2 + n * 0.11 + reefA + reefB + Math.max(0, radius - 6.2) * 0.03;
  }
  const valleySides = Math.max(0, Math.abs(x) - 2.1) * 0.055;
  return 0.28 + n * 0.11 + valleySides + Math.max(0, radius - 6.5) * 0.04;
}

export function terrainHeight(x: number, z: number, biome: BiomeConfig) {
  const base = baseTerrainHeight(x, z, biome);
  if (biome.waterStyle === "ocean") return base;
  const distance = waterDistance(x, z, biome);
  const channel = 1 - smoothstep(-0.08, 0.88, distance);
  const depth = biome.waterStyle === "floodplain" ? 0.3 : biome.waterStyle === "oasis" || biome.waterStyle === "waterhole" ? 0.38 : 0.34;
  return base - channel * depth;
}

export function waterSurfaceHeight(x: number, z: number, biome: BiomeConfig, drought: number) {
  if (biome.waterStyle === "ocean") return 4.8;
  const base = biome.terrainStyle === "alpine" ? 0.36 : 0.34;
  const local = biome.waterStyle === "glacial" ? Math.max(0, Math.hypot(x, z) - 4) * 0.01 : 0;
  return base + local - drought * (biome.waterStyle === "oasis" || biome.waterStyle === "waterhole" ? 0.003 : 0.0014);
}

export type TerrainSample = {
  y: number;
  normal: THREE.Vector3;
  slope: number;
  waterDistance: number;
  waterSurfaceY: number;
};

export function sampleTerrain(x: number, z: number, biome: BiomeConfig, drought = 0): TerrainSample {
  const epsilon = 0.035;
  const y = terrainHeight(x, z, biome);
  const dx = terrainHeight(x + epsilon, z, biome) - terrainHeight(x - epsilon, z, biome);
  const dz = terrainHeight(x, z + epsilon, biome) - terrainHeight(x, z - epsilon, biome);
  const normal = new THREE.Vector3(-dx / (epsilon * 2), 1, -dz / (epsilon * 2)).normalize();
  return {
    y,
    normal,
    slope: Math.acos(THREE.MathUtils.clamp(normal.y, -1, 1)),
    waterDistance: waterDistance(x, z, biome),
    waterSurfaceY: waterSurfaceHeight(x, z, biome, drought),
  };
}

export type ScatterPoint = { x: number; y: number; z: number; scale: number; rotation: number };

export function scatterLand(
  biome: BiomeConfig,
  count: number,
  seedSalt: number,
  options: { minRadius?: number; maxRadius?: number; waterClearance?: number; maxSlope?: number; minSpacing?: number } = {},
) {
  const points: ScatterPoint[] = [];
  const minRadius = options.minRadius ?? 1;
  const maxRadius = options.maxRadius ?? 7.8;
  const waterClearance = options.waterClearance ?? 0.55;
  const maxSlope = options.maxSlope ?? 0.48;
  const minSpacing = options.minSpacing ?? 0.7;
  let attempt = 0;
  while (points.length < count && attempt < count * 45) {
    const angle = seeded(attempt, seedSalt) * Math.PI * 2;
    const radius = minRadius + Math.sqrt(seeded(attempt, seedSalt + 3)) * (maxRadius - minRadius);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const sample = sampleTerrain(x, z, biome);
    const clear = points.every((point) => Math.hypot(point.x - x, point.z - z) >= minSpacing);
    if (sample.waterDistance > waterClearance && sample.slope <= maxSlope && clear) {
      points.push({ x, y: sample.y, z, scale: 0.72 + seeded(attempt, seedSalt + 8) * 0.58, rotation: seeded(attempt, seedSalt + 11) * Math.PI * 2 });
    }
    attempt += 1;
  }
  return points;
}

export function createTerrainGeometry(biome: BiomeConfig) {
  const rings = 42;
  const segments = 112;
  const positions: number[] = [0, terrainHeight(0, 0, biome), 0];
  const colors: number[] = [];
  const baseColor = new THREE.Color(biome.palette.ground);
  const highColor = new THREE.Color(biome.palette.groundDry);
  const cliffColor = new THREE.Color(biome.palette.cliff);
  colors.push(baseColor.r, baseColor.g, baseColor.b);

  for (let ring = 1; ring <= rings; ring += 1) {
    const radius = ISLAND_RADIUS * (ring / rings);
    for (let segment = 0; segment < segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = terrainHeight(x, z, biome);
      positions.push(x, y, z);
      const sample = sampleTerrain(x, z, biome);
      const altitude = THREE.MathUtils.clamp((y - 0.15) / 1.7, 0, 1);
      const slopeMix = THREE.MathUtils.clamp((sample.slope - 0.22) * 2.6, 0, 0.82);
      const color = baseColor.clone().lerp(highColor, altitude * 0.65).lerp(cliffColor, slopeMix);
      colors.push(color.r, color.g, color.b);
    }
  }

  const indices: number[] = [];
  for (let segment = 0; segment < segments; segment += 1) {
    indices.push(0, 1 + segment, 1 + ((segment + 1) % segments));
  }
  for (let ring = 1; ring < rings; ring += 1) {
    const inner = 1 + (ring - 1) * segments;
    const outer = 1 + ring * segments;
    for (let segment = 0; segment < segments; segment += 1) {
      const next = (segment + 1) % segments;
      indices.push(inner + segment, outer + segment, outer + next, inner + segment, outer + next, inner + next);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
