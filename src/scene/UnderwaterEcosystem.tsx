"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type UnderwaterEcosystemProps = {
  /** Local Y position of the water surface/ceiling. */
  waterLevel?: number;
  /** Local Y position of the seabed where the habitat is rooted. */
  seabedY?: number;
  /** Radius of the habitat dressing, in world units. */
  radius?: number;
  /** Stable seed for layout and animation phase offsets. */
  seed?: number;
  /** Optional transform for embedding the habitat in a larger biome scene. */
  position?: [number, number, number];
  scale?: number;
  /** Controls particle and plant density while keeping the layout deterministic. */
  density?: "low" | "high";
  waterColor?: THREE.ColorRepresentation;
  accentColor?: THREE.ColorRepresentation;
  /** Disable the cleaning-station vignette when composing a quieter reef. */
  showCleaningStation?: boolean;
};

type Vec3 = [number, number, number];

type KelpPoint = {
  x: number;
  z: number;
  height: number;
  width: number;
  phase: number;
};

type ParticlePoint = {
  x: number;
  y: number;
  z: number;
  size: number;
  phase: number;
  speed: number;
};

const fract = (value: number) => value - Math.floor(value);

const seeded = (index: number, salt: number) =>
  fract(Math.sin(index * 918.13 + salt * 37.71) * 43758.5453);

const colorWith = (color: THREE.ColorRepresentation, fallback: string) =>
  new THREE.Color(color ?? fallback);

function WaterCeiling({ waterLevel, radius, waterColor }: { waterLevel: number; radius: number; waterColor: THREE.ColorRepresentation }) {
  const uniforms = useMemo(() => ({
    uColor: { value: colorWith(waterColor, "#52c8c5") },
  }), [waterColor]);
  const surface = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (surface.current) surface.current.rotation.z = Math.sin(clock.elapsedTime * 0.12) * 0.035;
  });

  return (
    <mesh ref={surface} position={[0, waterLevel, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
      <circleGeometry args={[radius * 1.14, 96]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        vertexShader="varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }"
        fragmentShader="varying vec2 vUv; uniform vec3 uColor; void main(){ vec2 p=vUv*2.-1.; float edge=1.-smoothstep(.55,1.04,length(p)); float wave=sin(p.x*19.)+sin(p.y*27.)+sin((p.x+p.y)*39.); float shimmer=smoothstep(-.15,.9,wave*.18+.5); vec3 col=mix(uColor*.58,vec3(.78,1.,.96),shimmer); gl_FragColor=vec4(col,(.055+.1*shimmer)*edge); }"
      />
    </mesh>
  );
}

function DepthHaze({ waterLevel, seabedY, radius, waterColor }: { waterLevel: number; seabedY: number; radius: number; waterColor: THREE.ColorRepresentation }) {
  const span = Math.max(1, waterLevel - seabedY);
  const hazeColor = colorWith(waterColor, "#3a9da9");
  return (
    <group>
      <mesh position={[0, seabedY + span * 0.48, 0]} scale={[radius * 0.96, span * 0.62, radius * 0.96]}>
        <sphereGeometry args={[1, 28, 16]} />
        <meshBasicMaterial color={hazeColor} transparent opacity={0.035} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      <mesh position={[-radius * 0.34, seabedY + span * 0.46, radius * 0.18]} scale={[radius * 0.3, span * 0.56, radius * 0.28]}>
        <cylinderGeometry args={[1, 1.18, 2, 20, 1, true]} />
        <meshBasicMaterial color="#72d6cd" transparent opacity={0.025} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[radius * 0.32, seabedY + span * 0.36, -radius * 0.14]} scale={[radius * 0.26, span * 0.48, radius * 0.3]}>
        <cylinderGeometry args={[1, 1.24, 2, 20, 1, true]} />
        <meshBasicMaterial color="#4e8bd3" transparent opacity={0.02} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function createKelpPoints(radius: number, seed: number, density: "low" | "high", seabedY: number) {
  const count = density === "high" ? 16 : 11;
  const points: KelpPoint[] = [];
  for (let index = 0; index < count; index += 1) {
    const angle = seeded(index, seed + 1) * Math.PI * 2;
    const distance = radius * (0.48 + seeded(index, seed + 2) * 0.44);
    points.push({
      x: Math.cos(angle) * distance,
      z: Math.sin(angle) * distance,
      height: Math.min(3.2, Math.max(1.15, (seabedY + 0.9) * 0.08 + 1.22 + seeded(index, seed + 3) * 1.25)),
      width: 0.72 + seeded(index, seed + 4) * 0.5,
      phase: seeded(index, seed + 5) * Math.PI * 2,
    });
  }
  return points;
}

function KelpField({ radius, seed, seabedY, density }: { radius: number; seed: number; seabedY: number; density: "low" | "high" }) {
  const points = useMemo(() => createKelpPoints(radius, seed, density, seabedY), [density, radius, seabedY, seed]);
  const stalks = useRef<THREE.InstancedMesh>(null);
  const blades = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const segmentCount = 4;

  useFrame(({ clock }) => {
    const time = clock.elapsedTime * 0.62;
    points.forEach((point, pointIndex) => {
      const segmentHeight = point.height / segmentCount;
      for (let segment = 0; segment < segmentCount; segment += 1) {
        const progress = segment / segmentCount;
        const sway = Math.sin(time + point.phase + segment * 0.38) * (0.035 + progress * 0.19);
        const twist = Math.cos(time * 0.82 + point.phase) * progress * 0.08;
        const y = seabedY + 0.1 + segmentHeight * (segment + 0.5) * 0.88;
        dummy.position.set(point.x + sway, y, point.z + twist);
        dummy.rotation.set(-twist * 0.42, point.phase * 0.14, sway * 0.6);
        dummy.scale.set(point.width, segmentHeight * 1.35, point.width);
        dummy.updateMatrix();
        stalks.current?.setMatrixAt(pointIndex * segmentCount + segment, dummy.matrix);

        if (segment > 1) {
          dummy.position.set(point.x + sway * 1.16, y + segmentHeight * 0.2, point.z + twist * 1.1);
          dummy.rotation.set(-twist * 0.35, point.phase * 0.14 + 0.5, sway * 0.9 + 0.18);
          dummy.scale.set(point.width * 0.48, segmentHeight * 0.82, point.width * 0.24);
          dummy.updateMatrix();
          blades.current?.setMatrixAt(pointIndex * 2 + (segment - 2), dummy.matrix);
        }
      }
    });
    if (stalks.current) stalks.current.instanceMatrix.needsUpdate = true;
    if (blades.current) blades.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={stalks} args={[undefined, undefined, points.length * segmentCount]} frustumCulled={false}>
        <cylinderGeometry args={[0.055, 0.085, 1, 7]} />
        <meshStandardMaterial color="#2d806f" roughness={0.78} metalness={0.02} />
      </instancedMesh>
      <instancedMesh ref={blades} args={[undefined, undefined, points.length * 2]} frustumCulled={false}>
        <coneGeometry args={[0.55, 1, 5]} />
        <meshStandardMaterial color="#4bb89b" roughness={0.7} transparent opacity={0.8} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
}

function createCoralGeometry(radius: number, seed: number, seabedY: number) {
  const buckets: THREE.BufferGeometry[][] = [[], []];
  const count = 18;
  for (let index = 0; index < count; index += 1) {
    const angle = seeded(index, seed + 11) * Math.PI * 2;
    const distance = radius * (0.28 + seeded(index, seed + 12) * 0.62);
    const height = 0.48 + seeded(index, seed + 13) * 1.35;
    const geometry = new THREE.CapsuleGeometry(0.16, 0.72, 5, 8);
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(Math.cos(angle) * distance, seabedY + height * 0.48, Math.sin(angle) * distance),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(
        Math.sin(index * 2.1) * 0.18,
        angle + Math.PI * 0.5,
        (seeded(index, seed + 14) - 0.5) * 0.62,
      )),
      new THREE.Vector3(0.32 + seeded(index, seed + 15) * 0.28, height, 0.32 + seeded(index, seed + 16) * 0.22),
    ));
    buckets[index % 3 === 0 ? 1 : 0].push(geometry);
  }
  return buckets.map((bucket) => {
    const merged = mergeGeometries(bucket, false);
    bucket.forEach((geometry) => geometry.dispose());
    return merged;
  });
}

function BenthicStructures({ radius, seed, seabedY, accentColor }: { radius: number; seed: number; seabedY: number; accentColor: THREE.ColorRepresentation }) {
  const coral = useMemo(() => createCoralGeometry(radius, seed, seabedY), [radius, seed, seabedY]);
  const rocks = useMemo(() => {
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];
    for (let index = 0; index < 8; index += 1) {
      const angle = seeded(index, seed + 21) * Math.PI * 2;
      const distance = radius * (0.34 + seeded(index, seed + 22) * 0.56);
      dummy.position.set(Math.cos(angle) * distance, seabedY + 0.16, Math.sin(angle) * distance);
      dummy.rotation.set(0, seeded(index, seed + 23) * Math.PI, (seeded(index, seed + 24) - 0.5) * 0.16);
      const size = 0.34 + seeded(index, seed + 25) * 0.34;
      dummy.scale.set(size * 1.35, size * (0.62 + seeded(index, seed + 26) * 0.42), size);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return matrices;
  }, [radius, seabedY, seed]);
  const rockRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    coral.forEach((geometry) => geometry?.computeBoundingSphere());
    return () => coral.forEach((geometry) => geometry?.dispose());
  }, [coral]);

  useEffect(() => {
    if (!rockRef.current) return;
    matricesToMesh(rockRef.current, rocks);
  }, [rocks]);

  return (
    <group>
      {coral.map((geometry, index) => geometry && (
        <mesh key={`coral-${index}`} geometry={geometry}>
          <meshPhysicalMaterial color={index === 0 ? "#d85f86" : accentColor} emissive={index === 0 ? "#6c2145" : accentColor} emissiveIntensity={0.16} roughness={0.5} clearcoat={0.2} />
        </mesh>
      ))}
      <instancedMesh ref={rockRef} args={[undefined, undefined, rocks.length]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#334f58" roughness={0.95} />
      </instancedMesh>
      <mesh position={[radius * 0.08, seabedY + 0.045, -radius * 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.68, 64]} />
        <meshStandardMaterial color="#193d48" roughness={1} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function matricesToMesh(mesh: THREE.InstancedMesh, matrices: THREE.Matrix4[]) {
  matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
  mesh.instanceMatrix.needsUpdate = true;
}

function createParticles(radius: number, waterLevel: number, seabedY: number, seed: number, count: number, salt: number, sizeMin: number, sizeMax: number): ParticlePoint[] {
  const span = Math.max(1, waterLevel - seabedY);
  return Array.from({ length: count }, (_, index) => {
    const angle = seeded(index, seed + salt) * Math.PI * 2;
    const distance = Math.sqrt(seeded(index, seed + salt + 1)) * radius * 0.94;
    return {
      x: Math.cos(angle) * distance,
      y: seabedY + 0.3 + seeded(index, seed + salt + 2) * span * 0.86,
      z: Math.sin(angle) * distance,
      size: sizeMin + seeded(index, seed + salt + 3) * (sizeMax - sizeMin),
      phase: seeded(index, seed + salt + 4) * Math.PI * 2,
      speed: 0.12 + seeded(index, seed + salt + 5) * 0.28,
    };
  });
}

function BubblesAndPlankton({ radius, waterLevel, seabedY, seed, density, waterColor }: { radius: number; waterLevel: number; seabedY: number; seed: number; density: "low" | "high"; waterColor: THREE.ColorRepresentation }) {
  const multiplier = density === "high" ? 1 : 0.68;
  const bubbles = useMemo(() => createParticles(radius, waterLevel, seabedY, seed, Math.round(24 * multiplier), 31, 0.035, 0.11), [multiplier, radius, seabedY, seed, waterLevel]);
  const plankton = useMemo(() => createParticles(radius, waterLevel, seabedY, seed, Math.round(56 * multiplier), 51, 0.012, 0.035), [multiplier, radius, seabedY, seed, waterLevel]);
  const bubblesRef = useRef<THREE.InstancedMesh>(null);
  const planktonRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bubbleColor = colorWith(waterColor, "#8eece2");

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    bubbles.forEach((particle, index) => {
      const span = Math.max(1, waterLevel - seabedY - 0.52);
      const y = seabedY + 0.25 + ((particle.y - seabedY + time * particle.speed) % span);
      dummy.position.set(particle.x + Math.sin(time * 0.45 + particle.phase) * 0.07, y, particle.z + Math.cos(time * 0.36 + particle.phase) * 0.05);
      const pulse = particle.size * (1 + Math.sin(time * 1.4 + particle.phase) * 0.12);
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      bubblesRef.current?.setMatrixAt(index, dummy.matrix);
    });
    plankton.forEach((particle, index) => {
      dummy.position.set(
        particle.x + Math.sin(time * particle.speed * 2 + particle.phase) * 0.12,
        particle.y + Math.sin(time * particle.speed + particle.phase) * 0.12,
        particle.z + Math.cos(time * particle.speed * 1.7 + particle.phase) * 0.12,
      );
      dummy.scale.setScalar(particle.size * (1 + Math.sin(time * 1.8 + particle.phase) * 0.2));
      dummy.updateMatrix();
      planktonRef.current?.setMatrixAt(index, dummy.matrix);
    });
    if (bubblesRef.current) bubblesRef.current.instanceMatrix.needsUpdate = true;
    if (planktonRef.current) planktonRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={bubblesRef} args={[undefined, undefined, bubbles.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 7]} />
        <meshPhysicalMaterial color={bubbleColor} roughness={0.08} transmission={0.55} transparent opacity={0.58} depthWrite={false} clearcoat={0.65} />
      </instancedMesh>
      <instancedMesh ref={planktonRef} args={[undefined, undefined, plankton.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshBasicMaterial color="#d9fff0" transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
    </group>
  );
}

function CausticFloor({ radius, seabedY, accentColor }: { radius: number; seabedY: number; accentColor: THREE.ColorRepresentation }) {
  const uniforms = useMemo(() => ({
    uColor: { value: colorWith(accentColor, "#66e3d3") },
  }), [accentColor]);
  const floor = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (floor.current) floor.current.rotation.z = Math.sin(clock.elapsedTime * 0.16) * 0.04;
  });
  return (
    <mesh ref={floor} position={[0, seabedY + 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[radius * 1.92, radius * 1.92]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader="varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }"
        fragmentShader="varying vec2 vUv; uniform vec3 uColor; void main(){ vec2 p=(vUv-.5)*8.; float a=sin(p.x*2.4+sin(p.y)*1.4); float b=sin(p.y*2.1+sin(p.x)*1.3); float caustic=smoothstep(.54,.9,a*b*.5+.5); float edge=1.-smoothstep(2.5,4.1,length(p)); gl_FragColor=vec4(uColor,caustic*.095*edge); }"
      />
    </mesh>
  );
}

function CausticRings({ radius, seabedY, accentColor, seed }: { radius: number; seabedY: number; accentColor: THREE.ColorRepresentation; seed: number }) {
  const rings = useMemo(() => {
    const dummy = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];
    for (let index = 0; index < 7; index += 1) {
      const angle = seeded(index, seed + 61) * Math.PI * 2;
      const distance = radius * (0.18 + seeded(index, seed + 62) * 0.64);
      dummy.position.set(Math.cos(angle) * distance, seabedY + 0.04, Math.sin(angle) * distance);
      dummy.rotation.set(-Math.PI / 2, 0, seeded(index, seed + 63) * Math.PI);
      const size = 0.34 + seeded(index, seed + 64) * 0.58;
      dummy.scale.set(size * (1.3 + seeded(index, seed + 65) * 0.8), size, 1);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return matrices;
  }, [radius, seabedY, seed]);
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (ref.current) matricesToMesh(ref.current, rings);
  }, [rings]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, rings.length]}>
      <ringGeometry args={[0.72, 0.78, 24]} />
      <meshBasicMaterial color={accentColor} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

function CleanerFish({ position, scale = 1, color, accentColor }: { position: Vec3; scale?: number; color: string; accentColor: THREE.ColorRepresentation }) {
  return (
    <group position={position} scale={scale} rotation={[0, -0.3, 0]}>
      <mesh scale={[0.46, 0.18, 0.2]}>
        <sphereGeometry args={[1, 14, 9]} />
        <meshPhysicalMaterial color={color} roughness={0.38} clearcoat={0.4} />
      </mesh>
      <mesh position={[-0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.14, 0.18, 0.24]}>
        <coneGeometry args={[1, 1, 3]} />
        <meshStandardMaterial color={accentColor} roughness={0.35} />
      </mesh>
      <mesh position={[0.02, 0.06, 0.18]} scale={[0.08, 0.035, 0.035]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial color="#f4fff2" />
      </mesh>
      <mesh position={[0.07, 0.06, 0.21]} scale={0.028}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial color="#143344" />
      </mesh>
    </group>
  );
}

function CleaningStation({ position, accentColor }: { position: Vec3; accentColor: THREE.ColorRepresentation }) {
  const orbit = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (orbit.current) {
      orbit.current.rotation.y = clock.elapsedTime * 0.56;
      orbit.current.rotation.z = Math.sin(clock.elapsedTime * 0.62) * 0.08;
    }
  });
  return (
    <group position={position} userData={{ label: "Cleaner fish station" }}>
      <mesh position={[0, 0.18, 0]} scale={[1.1, 0.42, 0.86]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#274a55" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.58, 0.06, 8, 28]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.42} roughness={0.42} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.52, 0.6, 0]} rotation={[0, 0, side * 0.3]}>
          <mesh scale={[0.16, 0.58, 0.16]}>
            <capsuleGeometry args={[0.2, 0.72, 6, 8]} />
            <meshStandardMaterial color={side > 0 ? "#d76b92" : "#c65c83"} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.48, 0]} scale={0.2}>
            <sphereGeometry args={[1, 10, 7]} />
            <meshStandardMaterial color="#f0ad9c" emissive="#7b3b4d" emissiveIntensity={0.18} roughness={0.5} />
          </mesh>
        </group>
      ))}
      <group ref={orbit}>
        <CleanerFish position={[0.9, 0.84, 0]} scale={0.68} color="#f5df8a" accentColor={accentColor} />
        <CleanerFish position={[-0.7, 0.98, 0.18]} scale={0.54} color="#55c7bc" accentColor="#efffc0" />
      </group>
      <mesh position={[0, 0.88, 0]} scale={[0.76, 0.18, 0.28]}>
        <sphereGeometry args={[1, 16, 9]} />
        <meshStandardMaterial color="#426d79" roughness={0.6} />
      </mesh>
      <mesh position={[0.58, 0.89, 0]} rotation={[0, 0, -0.12]} scale={[0.15, 0.22, 0.28]}>
        <coneGeometry args={[1, 1, 3]} />
        <meshStandardMaterial color="#79d4c0" roughness={0.42} />
      </mesh>
    </group>
  );
}

/**
 * A reusable underwater dressing layer for the reef biome.
 *
 * The component intentionally owns its visual vocabulary: a rippling water
 * ceiling, depth haze, swaying kelp, merged coral, caustics, plankton and a
 * readable cleaner-fish station. Layout is seeded so biome snapshots stay
 * stable while every animated element remains frame-driven and state-free.
 */
export function UnderwaterEcosystem({
  waterLevel = 4.65,
  seabedY = 0.18,
  radius = 10.6,
  seed = 73,
  position = [0, 0, 0],
  scale = 1,
  density = "high",
  waterColor = "#49b9c2",
  accentColor = "#72e6cf",
  showCleaningStation = true,
}: UnderwaterEcosystemProps) {
  const stationPosition: Vec3 = [radius * 0.06, seabedY + 0.05, -radius * 0.1];
  return (
    <group position={position} scale={scale}>
      <WaterCeiling waterLevel={waterLevel} radius={radius} waterColor={waterColor} />
      <DepthHaze waterLevel={waterLevel} seabedY={seabedY} radius={radius} waterColor={waterColor} />
      <CausticFloor radius={radius} seabedY={seabedY} accentColor={accentColor} />
      <CausticRings radius={radius} seabedY={seabedY} accentColor={accentColor} seed={seed} />
      <KelpField radius={radius} seed={seed} seabedY={seabedY} density={density} />
      <BenthicStructures radius={radius} seed={seed} seabedY={seabedY} accentColor={accentColor} />
      <BubblesAndPlankton radius={radius} waterLevel={waterLevel} seabedY={seabedY} seed={seed} density={density} waterColor={waterColor} />
      {showCleaningStation && <CleaningStation position={stationPosition} accentColor={accentColor} />}
    </group>
  );
}
