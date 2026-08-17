"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { AnimalVisualKind } from "../types/fauna";

export type { AnimalVisualKind } from "../types/fauna";

type ModelProps = {
  primary: string;
  secondary: string;
  seed?: number;
};

const material = (color: string, roughness = 0.78) => (
  <meshStandardMaterial color={color} roughness={roughness} metalness={0.02} />
);

function transformed(geometry: THREE.BufferGeometry, position: [number, number, number], scale: [number, number, number], rotation: [number, number, number] = [0, 0, 0]) {
  geometry.applyMatrix4(new THREE.Matrix4().compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
    new THREE.Vector3(...scale),
  ));
  return geometry;
}

function SimplifiedAnimalModel({ kind, primary }: { kind: AnimalVisualKind; primary: string }) {
  const geometry = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    const add = (part: THREE.BufferGeometry, position: [number, number, number], scale: [number, number, number], rotation?: [number, number, number]) => parts.push(transformed(part, position, scale, rotation));
    const hoofed = ["deer", "pronghorn", "gazelle", "caribou", "brocket", "musk-deer"].includes(kind);
    const mammal = hoofed || ["canid", "bear", "feline", "paca", "capybara", "yak"].includes(kind);
    const hopping = ["rabbit", "jackrabbit", "hare", "frog", "bullfrog"].includes(kind);
    const winged = ["bird", "wren", "roller", "owl", "macaw", "monal", "bee", "butterfly", "dragonfly"].includes(kind);
    const fishlike = ["fish", "catfish", "shark", "dolphin", "crocodile", "seahorse"].includes(kind);

    if (kind === "elephant") {
      add(new THREE.SphereGeometry(1, 12, 8), [-0.18, 1.14, 0], [0.88, 0.68, 0.66]);
      add(new THREE.SphereGeometry(1, 12, 8), [0.67, 1.2, 0], [0.5, 0.52, 0.5]);
      add(new THREE.CapsuleGeometry(0.12, 0.86, 5, 8), [0.96, 0.64, 0], [1, 1, 1], [0, 0, -0.16]);
      [[0.3, 0.38], [0.3, -0.38], [-0.62, 0.38], [-0.62, -0.38]].forEach(([x, z]) => add(new THREE.CylinderGeometry(0.12, 0.1, 0.82, 7), [x, 0.42, z], [1, 1, 1]));
    } else if (mammal) {
      const heavy = kind === "bear" || kind === "yak";
      add(new THREE.CapsuleGeometry(0.46, heavy ? 0.94 : 0.78, 6, 10), [-0.12, 0.94, 0], [1, 1, heavy ? 0.82 : 0.68], [0, 0, Math.PI / 2]);
      add(new THREE.SphereGeometry(1, 11, 8), [0.72, 1.08, 0], [heavy ? 0.4 : 0.34, heavy ? 0.4 : 0.34, heavy ? 0.4 : 0.34]);
      [[0.36, 0.27], [0.36, -0.27], [-0.52, 0.27], [-0.52, -0.27]].forEach(([x, z]) => add(new THREE.CylinderGeometry(0.075, 0.055, 0.78, 7), [x, 0.39, z], [1, 1, 1]));
      if (hoofed) [-1, 1].forEach((side) => add(new THREE.ConeGeometry(0.05, 0.48, 6), [0.65, 1.52, side * 0.16], [1, 1, 1]));
    } else if (hopping) {
      add(new THREE.SphereGeometry(1, 12, 8), [-0.1, 0.42, 0], [0.58, 0.38, 0.5]);
      add(new THREE.SphereGeometry(1, 11, 8), [0.46, 0.58, 0], [0.32, 0.3, 0.32]);
      [[-0.36, 0.3], [-0.36, -0.3], [0.34, 0.23], [0.34, -0.23]].forEach(([x, z]) => add(new THREE.CapsuleGeometry(0.06, 0.32, 5, 7), [x, 0.17, z], [1, 1, 1], [0, 0, x < 0 ? 0.7 : -0.4]));
      if (kind !== "frog" && kind !== "bullfrog") [-1, 1].forEach((side) => add(new THREE.CapsuleGeometry(0.06, 0.48, 5, 7), [0.36, 1.02, side * 0.16], [1, 1, 1]));
    } else if (winged) {
      add(new THREE.CapsuleGeometry(0.18, 0.55, 6, 9), [0, 0, 0], [1, 1, 1], [0, 0, Math.PI / 2]);
      add(new THREE.SphereGeometry(1, 10, 7), [0.45, 0.12, 0], [0.25, 0.25, 0.25]);
      [-1, 1].forEach((side) => add(new THREE.SphereGeometry(1, 10, 6), [0, 0.07, side * 0.42], [0.52, 0.09, 0.28], [side * 0.28, 0, 0]));
    } else if (fishlike) {
      add(new THREE.SphereGeometry(1, 13, 8), [0, 0, 0], [0.82, kind === "crocodile" ? 0.2 : 0.34, kind === "crocodile" ? 0.38 : 0.3]);
      add(new THREE.ConeGeometry(0.42, 0.72, kind === "crocodile" ? 8 : 4), [-0.86, 0, 0], [0.78, 0.65, 0.28], [0, 0, Math.PI / 2]);
      if (kind === "shark" || kind === "dolphin") add(new THREE.ConeGeometry(0.38, 0.62, 3), [-0.05, 0.43, 0], [1, 1, 0.28]);
    } else if (kind === "turtle" || kind === "tortoise") {
      add(new THREE.SphereGeometry(1, 13, 8), [0, 0.34, 0], [0.7, 0.27, 0.58]);
      add(new THREE.SphereGeometry(1, 10, 7), [0.72, 0.3, 0], [0.24, 0.2, 0.2]);
      [-1, 1].forEach((side) => { add(new THREE.CapsuleGeometry(0.08, 0.48, 5, 7), [0.15, 0.18, side * 0.58], [1, 1, 1], [side * 0.2, 0, side * -0.22]); add(new THREE.CapsuleGeometry(0.07, 0.32, 5, 7), [-0.45, 0.16, side * 0.46], [1, 1, 1]); });
    } else if (kind === "ray") {
      add(new THREE.SphereGeometry(1, 13, 8), [0, 0, 0], [0.95, 0.12, 0.72]);
      add(new THREE.ConeGeometry(0.12, 1.8, 6), [-1.15, 0, 0], [1, 1, 1], [0, 0, Math.PI / 2]);
    } else if (kind === "jellyfish") {
      add(new THREE.SphereGeometry(1, 13, 8), [0, 0.3, 0], [0.62, 0.34, 0.62]);
      [-0.3, -0.1, 0.1, 0.3].forEach((z, index) => add(new THREE.CapsuleGeometry(0.03, 0.72 + index * 0.08, 5, 7), [(index % 2 ? -1 : 1) * 0.14, -0.34, z], [1, 1, 1]));
    } else if (kind === "octopus") {
      add(new THREE.SphereGeometry(1, 13, 8), [0, 0.5, 0], [0.42, 0.56, 0.42]);
      Array.from({ length: 8 }, (_, index) => { const angle = (index / 8) * Math.PI * 2; add(new THREE.CapsuleGeometry(0.045, 0.64, 5, 7), [Math.cos(angle) * 0.34, 0.09, Math.sin(angle) * 0.34], [1, 1, 1], [0, 0, angle - Math.PI / 2]); });
    }
    const merged = mergeGeometries(parts, false);
    parts.forEach((part) => part.dispose());
    return merged;
  }, [kind]);
  useEffect(() => () => geometry?.dispose(), [geometry]);
  if (!geometry) return null;
  return <mesh castShadow geometry={geometry}><meshStandardMaterial color={primary} roughness={0.82} metalness={0.01} /></mesh>;
}

function Eye({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.055, 14, 10]} />
        <meshPhysicalMaterial color="#151713" roughness={0.08} clearcoat={1} />
      </mesh>
      <mesh position={[0.025, 0.025, 0.038]}>
        <sphereGeometry args={[0.014, 8, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function HoofedLeg({ position, bend = 0, color, dark, legRef }: { position: [number, number, number]; bend?: number; color: string; dark: string; legRef?: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={legRef} position={position} rotation={[0, 0, bend]}>
      <mesh castShadow position={[0, 0.48, 0]}>
        <capsuleGeometry args={[0.095, 0.52, 8, 12]} />
        {material(color, 0.88)}
      </mesh>
      <group position={[0.08, 0.02, 0]} rotation={[0, 0, -bend * 0.75]}>
        <mesh castShadow position={[0.02, 0.04, 0]}>
          <sphereGeometry args={[0.13, 12, 9]} />
          {material(color, 0.9)}
        </mesh>
        <mesh castShadow position={[0, -0.28, 0]}>
          <capsuleGeometry args={[0.064, 0.42, 8, 10]} />
          {material(dark, 0.9)}
        </mesh>
        <mesh castShadow position={[0.08, -0.54, 0]} scale={[0.17, 0.1, 0.12]}>
          <sphereGeometry args={[1, 14, 10]} />
          {material("#27241f", 0.96)}
        </mesh>
      </group>
    </group>
  );
}

type HoofedKind = "deer" | "pronghorn" | "gazelle" | "caribou" | "brocket" | "musk-deer";

function Antler({ side }: { side: -1 | 1 }) {
  const main = useMemo(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.06, 0.25, side * 0.04),
      new THREE.Vector3(0.17, 0.48, side * 0.1),
      new THREE.Vector3(0.13, 0.72, side * 0.18),
    ]),
    [side],
  );
  const tine = useMemo(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.11, 0.36, side * 0.07),
      new THREE.Vector3(0.32, 0.49, side * 0.16),
      new THREE.Vector3(0.39, 0.67, side * 0.2),
    ]),
    [side],
  );
  return (
    <group>
      <mesh castShadow><tubeGeometry args={[main, 12, 0.026, 6, false]} />{material("#7d684c", 0.94)}</mesh>
      <mesh castShadow><tubeGeometry args={[tine, 9, 0.021, 6, false]} />{material("#8b7557", 0.94)}</mesh>
    </group>
  );
}

function DeerModel({ primary, secondary, seed = 0, variant = "deer" }: ModelProps & { variant?: HoofedKind }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const earLeft = useRef<THREE.Group>(null);
  const earRight = useRef<THREE.Group>(null);
  const frontLeft = useRef<THREE.Group>(null);
  const frontRight = useRef<THREE.Group>(null);
  const backLeft = useRef<THREE.Group>(null);
  const backRight = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed;
    const gait = Math.sin(t * 2.2) * 0.15;
    if (root.current) root.current.rotation.z = Math.sin(t * 0.65) * 0.018;
    if (head.current) head.current.rotation.z = -0.2 + Math.sin(t * 0.8) * 0.055;
    if (earLeft.current) earLeft.current.rotation.x = Math.sin(t * 2.1) * 0.12;
    if (earRight.current) earRight.current.rotation.x = Math.cos(t * 1.9) * 0.12;
    if (frontLeft.current) frontLeft.current.rotation.z = 0.04 + gait;
    if (frontRight.current) frontRight.current.rotation.z = -0.03 - gait;
    if (backLeft.current) backLeft.current.rotation.z = -0.06 - gait;
    if (backRight.current) backRight.current.rotation.z = 0.05 + gait;
  });

  return (
    <group ref={root}>
      <mesh castShadow position={[-0.15, 1.15, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.62, 0.95, 0.68]}>
        <capsuleGeometry args={[0.48, 0.78, 12, 20]} />{material(primary, 0.88)}
      </mesh>
      <mesh castShadow position={[-0.62, 1.14, 0]} scale={[0.55, 0.55, 0.58]}>
        <sphereGeometry args={[0.56, 24, 16]} />{material(primary, 0.9)}
      </mesh>
      <mesh castShadow position={[0.46, 1.32, 0]} scale={[0.48, 0.56, 0.54]}>
        <sphereGeometry args={[0.53, 22, 14]} />{material(primary, 0.85)}
      </mesh>
      <mesh castShadow position={[0.62, 1.62, 0]} rotation={[0, 0, -0.22]}>
        <capsuleGeometry args={[0.22, 0.72, 10, 16]} />{material(primary, 0.86)}
      </mesh>
      <group ref={head} position={[0.88, 2.02, 0]} rotation={[0, 0, -0.2]}>
        <mesh castShadow scale={[0.58, 0.46, 0.42]}>
          <sphereGeometry args={[0.48, 24, 16]} />{material(primary, 0.82)}
        </mesh>
        <mesh castShadow position={[0.38, -0.08, 0]} scale={[0.52, 0.3, 0.3]}>
          <capsuleGeometry args={[0.26, 0.38, 10, 16]} />{material(secondary, 0.86)}
        </mesh>
        <mesh position={[0.67, -0.1, 0]} scale={[0.12, 0.1, 0.16]}>
          <sphereGeometry args={[1, 14, 10]} />{material("#27231f", 0.72)}
        </mesh>
        <Eye position={[0.14, 0.13, 0.37]} />
        <Eye position={[0.14, 0.13, -0.37]} />
        <group ref={earLeft} position={[-0.08, 0.37, 0.31]} rotation={[0.2, 0.12, -0.2]}>
          <mesh castShadow scale={[0.12, 0.34, 0.16]}><capsuleGeometry args={[0.35, 0.72, 8, 12]} />{material(primary, 0.92)}</mesh>
          <mesh position={[0.025, 0, 0.065]} scale={[0.045, 0.22, 0.075]}><capsuleGeometry args={[0.35, 0.72, 8, 12]} />{material("#c89987", 0.95)}</mesh>
        </group>
        <group ref={earRight} position={[-0.08, 0.37, -0.31]} rotation={[-0.2, -0.12, -0.2]}>
          <mesh castShadow scale={[0.12, 0.34, 0.16]}><capsuleGeometry args={[0.35, 0.72, 8, 12]} />{material(primary, 0.92)}</mesh>
          <mesh position={[0.025, 0, -0.065]} scale={[0.045, 0.22, 0.075]}><capsuleGeometry args={[0.35, 0.72, 8, 12]} />{material("#c89987", 0.95)}</mesh>
        </group>
        {(variant === "deer" || variant === "caribou") && <>
          <group position={[-0.1, 0.36, 0.17]} scale={variant === "caribou" ? 1.18 : 1}><Antler side={1} /></group>
          <group position={[-0.1, 0.36, -0.17]} scale={variant === "caribou" ? 1.18 : 1}><Antler side={-1} /></group>
        </>}
        {(variant === "pronghorn" || variant === "gazelle") && [-1, 1].map((side) => <group key={side} position={[-0.06, 0.42, side * 0.2]} rotation={[0.12, 0, side * -0.08]}>
          <mesh castShadow position={[0, 0.32, 0]} rotation={[0, 0, -0.08]}><coneGeometry args={[0.075, variant === "pronghorn" ? 0.76 : 0.62, 8]} />{material("#40352a", 0.92)}</mesh>
          {variant === "pronghorn" && <mesh castShadow position={[0.11, 0.38, 0]} rotation={[0, 0, -0.65]}><coneGeometry args={[0.045, 0.32, 7]} />{material("#40352a", 0.92)}</mesh>}
        </group>)}
        {variant === "musk-deer" && [-1, 1].map((side) => <mesh key={side} position={[0.46, -0.25, side * 0.13]} rotation={[0, 0, 0.08]}><coneGeometry args={[0.03, 0.36, 7]} />{material("#efe3cf", 0.82)}</mesh>)}
      </group>
      <HoofedLeg legRef={frontLeft} position={[0.43, 0.62, 0.29]} bend={0.04} color={primary} dark={secondary} />
      <HoofedLeg legRef={frontRight} position={[0.43, 0.62, -0.29]} bend={-0.03} color={primary} dark={secondary} />
      <HoofedLeg legRef={backLeft} position={[-0.58, 0.62, 0.29]} bend={-0.06} color={primary} dark={secondary} />
      <HoofedLeg legRef={backRight} position={[-0.58, 0.62, -0.29]} bend={0.05} color={primary} dark={secondary} />
      {variant === "pronghorn" && <mesh position={[-0.1, 1.28, 0.48]} rotation={[0, 0, Math.PI / 2]} scale={[0.08, 0.65, 0.06]}><capsuleGeometry args={[0.2, 0.8, 6, 10]} />{material("#f3ead9", 0.9)}</mesh>}
      <group position={[-0.98, 1.34, 0]} rotation={[0, 0, 0.62]}>
        <mesh castShadow scale={[0.18, 0.38, 0.2]}><capsuleGeometry args={[0.3, 0.62, 8, 12]} />{material(primary, 0.88)}</mesh>
        <mesh position={[-0.02, 0.12, 0]} scale={[0.13, 0.23, 0.15]}><capsuleGeometry args={[0.3, 0.62, 8, 12]} />{material("#f2e8d8", 0.94)}</mesh>
      </group>
    </group>
  );
}

function RabbitModel({ primary, secondary, seed = 0, variant = "rabbit" }: ModelProps & { variant?: "rabbit" | "jackrabbit" | "hare" }) {
  const root = useRef<THREE.Group>(null);
  const earA = useRef<THREE.Group>(null);
  const earB = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed;
    if (root.current) root.current.position.y = Math.pow(Math.max(0, Math.sin(t * 1.45)), 4) * 0.08;
    if (earA.current) earA.current.rotation.z = -0.1 + Math.sin(t * 1.7) * 0.08;
    if (earB.current) earB.current.rotation.z = 0.08 + Math.cos(t * 1.4) * 0.07;
  });
  const earScale = variant === "jackrabbit" ? 1.32 : variant === "hare" ? 1.16 : 1;
  return (
    <group position={[0, 0.16, 0]} scale={variant === "jackrabbit" ? [1.08, 1.04, 0.94] : 1}>
    <group ref={root}>
      <mesh castShadow position={[-0.18, 0.56, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.68, 0.92, 0.74]}>
        <capsuleGeometry args={[0.42, 0.54, 12, 18]} />{material(primary, 0.96)}
      </mesh>
      <mesh castShadow position={[-0.48, 0.57, 0]} scale={[0.58, 0.65, 0.64]}>
        <sphereGeometry args={[0.48, 22, 16]} />{material(primary, 0.96)}
      </mesh>
      <mesh castShadow position={[0.43, 0.82, 0]} scale={[0.56, 0.6, 0.54]}>
        <sphereGeometry args={[0.42, 22, 16]} />{material(primary, 0.94)}
      </mesh>
      <mesh castShadow position={[0.74, 0.72, 0]} scale={[0.32, 0.25, 0.3]}>
        <sphereGeometry args={[0.42, 20, 14]} />{material(secondary, 0.94)}
      </mesh>
      <mesh position={[0.92, 0.71, 0]} scale={[0.08, 0.07, 0.1]}><sphereGeometry args={[1, 12, 8]} />{material("#41302b", 0.75)}</mesh>
      <Eye position={[0.5, 0.93, 0.31]} scale={0.8} />
      <Eye position={[0.5, 0.93, -0.31]} scale={0.8} />
      {[[-0.28, 0.25], [0.24, -0.16]].map(([z, rotation], index) => (
        <group key={index} ref={index ? earB : earA} position={[0.28, 1.1, z]} rotation={[0, 0, rotation]} scale={[1, earScale, 1]}>
          <mesh castShadow scale={[0.16, 0.55, 0.19]}><capsuleGeometry args={[0.34, 0.82, 10, 14]} />{material(primary, 0.95)}</mesh>
          <mesh position={[0.025, 0.02, z > 0 ? 0.08 : -0.08]} scale={[0.075, 0.4, 0.09]}><capsuleGeometry args={[0.34, 0.82, 10, 14]} />{material("#d39a9a", 0.98)}</mesh>
        </group>
      ))}
      <mesh castShadow position={[-0.88, 0.68, 0]}><sphereGeometry args={[0.24, 18, 12]} />{material("#eee8db", 0.98)}</mesh>
      <mesh castShadow position={[-0.48, 0.22, 0.27]} rotation={[0, 0, 0.25]}><capsuleGeometry args={[0.14, 0.5, 8, 12]} />{material(primary, 0.96)}</mesh>
      <mesh castShadow position={[-0.48, 0.22, -0.27]} rotation={[0, 0, 0.25]}><capsuleGeometry args={[0.14, 0.5, 8, 12]} />{material(primary, 0.96)}</mesh>
      <mesh castShadow position={[0.38, 0.17, 0.23]} rotation={[0, 0, -0.18]}><capsuleGeometry args={[0.09, 0.35, 8, 10]} />{material(secondary, 0.96)}</mesh>
      <mesh castShadow position={[0.38, 0.17, -0.23]} rotation={[0, 0, -0.18]}><capsuleGeometry args={[0.09, 0.35, 8, 10]} />{material(secondary, 0.96)}</mesh>
    </group>
    </group>
  );
}

function BirdWing({ side, color, wingRef }: { side: -1 | 1; color: string; wingRef: React.RefObject<THREE.Group | null> }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.25, 0.08, 0.85, 0.4, 1.2, 0.88);
    s.bezierCurveTo(0.72, 0.82, 0.22, 0.62, -0.08, 0.18);
    s.closePath();
    return s;
  }, []);
  return (
    <group ref={wingRef} position={[0.02, 0.05, side * 0.22]} scale={[1, 1, side]} rotation={[side * 0.08, 0, side * 0.1]}>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[shape, { depth: 0.055, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.018, bevelSegments: 2 }]} />
        {material(color, 0.8)}
      </mesh>
      {[0.25, 0.48, 0.7].map((x, index) => (
        <mesh key={x} position={[x, 0.16 + index * 0.12, side * 0.055]} rotation={[Math.PI / 2, 0, -0.42]} scale={[0.42 - index * 0.06, 0.055, 0.1]}>
          <capsuleGeometry args={[0.2, 0.7, 6, 10]} />{material(color, 0.9)}
        </mesh>
      ))}
    </group>
  );
}

function BirdModel({ primary, secondary, seed = 0, variant = "bird" }: ModelProps & { variant?: "bird" | "wren" | "roller" | "owl" | "macaw" | "monal" }) {
  const root = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Group>(null);
  const rightWing = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 4.2 + seed;
    const flap = Math.sin(t) * 0.46;
    if (leftWing.current) leftWing.current.rotation.x = flap;
    if (rightWing.current) rightWing.current.rotation.x = -flap;
    if (root.current) root.current.rotation.z = Math.sin(t * 0.2) * 0.06;
  });
  const isOwl = variant === "owl";
  const longTail = variant === "macaw" || variant === "monal";
  const bodyScale: [number, number, number] = variant === "wren" ? [0.8, 0.8, 0.8] : isOwl ? [1.05, 1.12, 1.12] : [1, 1, 1];
  return (
    <group ref={root} rotation={[0, 0.05, -0.05]} scale={bodyScale}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]} scale={[0.6, 0.84, 0.62]}>
        <capsuleGeometry args={[0.36, 0.55, 12, 20]} />{material(primary, 0.76)}
      </mesh>
      <mesh castShadow position={[0.58, 0.23, 0]} scale={[0.48, 0.48, 0.46]}><sphereGeometry args={[0.42, 22, 16]} />{material(primary, 0.78)}</mesh>
      <mesh castShadow position={[0.88, 0.18, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[0.18, 0.3, 0.2]}><coneGeometry args={[0.32, 0.74, 4]} />{material("#e7b64e", 0.78)}</mesh>
      <Eye position={[0.66, 0.3, 0.31]} scale={0.72} />
      <Eye position={[0.66, 0.3, -0.31]} scale={0.72} />
      {isOwl && [-1, 1].map((side) => <mesh key={side} position={[0.7, 0.28, side * 0.23]} rotation={[0, Math.PI / 2, 0]} scale={[0.24, 0.28, 0.05]}><circleGeometry args={[1, 22]} />{material("#f4efe0", 0.88)}</mesh>)}
      <BirdWing side={1} color={secondary} wingRef={leftWing} />
      <BirdWing side={-1} color={secondary} wingRef={rightWing} />
      {[-0.18, 0, 0.18].map((z, index) => (
        <mesh key={z} castShadow position={[-0.74 - index * 0.03, -0.04, z]} rotation={[0, 0, Math.PI / 2]} scale={[0.12, (0.42 + index * 0.04) * (longTail ? 1.8 : 1), 0.08]}>
          <capsuleGeometry args={[0.22, 0.8, 8, 12]} />{material(index === 1 ? secondary : primary, 0.86)}
        </mesh>
      ))}
      {variant === "roller" && <mesh position={[0.02, -0.18, 0]} scale={[0.55, 0.12, 0.48]}><sphereGeometry args={[1, 16, 10]} />{material("#67bdd1", 0.72)}</mesh>}
      {variant === "macaw" && <mesh position={[0.58, 0.46, 0]} scale={[0.34, 0.18, 0.38]}><sphereGeometry args={[1, 16, 10]} />{material("#f4cf3f", 0.76)}</mesh>}
      {variant === "monal" && <mesh position={[-0.2, 0.24, 0]} scale={[0.52, 0.2, 0.46]}><sphereGeometry args={[1, 16, 10]} /><meshPhysicalMaterial color={secondary} roughness={0.32} metalness={0.18} clearcoat={0.42} /></mesh>}
    </group>
  );
}

function FishModel({ primary, secondary, seed = 0, variant = "fish" }: ModelProps & { variant?: "fish" | "catfish" | "shark" }) {
  const root = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 3 + seed;
    if (tail.current) tail.current.rotation.y = Math.sin(t) * 0.42;
    if (root.current) root.current.rotation.z = Math.sin(t * 0.35) * 0.04;
  });
  const shark = variant === "shark";
  return (
    <group ref={root} scale={shark ? [1.35, 0.86, 0.9] : 1}>
      <mesh castShadow scale={[1.05, 0.45, 0.38]}><sphereGeometry args={[0.72, 28, 18]} />{material(primary, 0.42)}</mesh>
      <mesh castShadow position={[0.62, 0.03, 0]} scale={[0.55, 0.4, 0.36]}><sphereGeometry args={[0.55, 24, 16]} />{material(primary, 0.38)}</mesh>
      <Eye position={[0.78, 0.18, 0.26]} scale={0.66} />
      <Eye position={[0.78, 0.18, -0.26]} scale={0.66} />
      <mesh position={[0.94, -0.04, 0]} scale={[0.15, 0.035, 0.22]}><sphereGeometry args={[1, 14, 8]} />{material("#4a2f27", 0.65)}</mesh>
      <group ref={tail} position={[-0.78, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} scale={[0.62, 0.56, 0.12]}><coneGeometry args={[0.64, 1.05, 4]} />{material(secondary, 0.55)}</mesh>
      </group>
      <mesh position={[-0.12, 0.49, 0]} rotation={[0, 0, -0.12]} scale={[0.38, 0.5, 0.08]}><coneGeometry args={[0.5, 0.75, 3]} />{material(secondary, 0.55)}</mesh>
      <mesh position={[0.06, -0.18, 0.32]} rotation={[0.8, 0, 0.35]} scale={[0.34, 0.42, 0.08]}><coneGeometry args={[0.5, 0.75, 3]} />{material(secondary, 0.55)}</mesh>
      <mesh position={[0.06, -0.18, -0.32]} rotation={[-0.8, 0, 0.35]} scale={[0.34, 0.42, 0.08]}><coneGeometry args={[0.5, 0.75, 3]} />{material(secondary, 0.55)}</mesh>
      {[-0.28, 0.02, 0.31].map((x) => <mesh key={x} position={[x, 0, 0]} scale={[0.055, 0.42, 0.39]}><torusGeometry args={[0.72, 0.09, 8, 24]} />{material(secondary, 0.55)}</mesh>)}
      {variant === "catfish" && [-1, 1].map((side) => <mesh key={side} position={[0.82, -0.08, side * 0.18]} rotation={[0, side * 0.22, side * -0.12]}><cylinderGeometry args={[0.012, 0.006, 0.75, 6]} />{material("#d7c28f", 0.82)}</mesh>)}
      {shark && <>
        <mesh position={[-0.08, 0.62, 0]} rotation={[0, 0, -0.12]} scale={[0.48, 0.7, 0.1]}><coneGeometry args={[0.5, 0.9, 3]} />{material(primary, 0.48)}</mesh>
        <mesh position={[0.15, -0.42, 0]} scale={[0.65, 0.12, 0.34]}><sphereGeometry args={[1, 16, 10]} />{material("#e4e2d8", 0.62)}</mesh>
      </>}
    </group>
  );
}

function FrogModel({ primary, secondary, seed = 0, variant = "frog" }: ModelProps & { variant?: "frog" | "bullfrog" }) {
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed;
    if (root.current) root.current.scale.y = 1 + Math.sin(t * 1.1) * 0.025;
  });
  return (
    <group position={[0, 0.04, 0]} scale={variant === "bullfrog" ? [1.18, 1.06, 1.18] : 1}>
    <group ref={root}>
      <mesh castShadow position={[-0.12, 0.34, 0]} scale={[0.72, 0.48, 0.62]}><sphereGeometry args={[0.56, 24, 16]} />{material(primary, 0.62)}</mesh>
      <mesh castShadow position={[0.38, 0.48, 0]} scale={[0.58, 0.42, 0.58]}><sphereGeometry args={[0.52, 24, 16]} />{material(primary, 0.6)}</mesh>
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh castShadow position={[0.38, 0.77, side * 0.28]}><sphereGeometry args={[0.16, 18, 12]} />{material(primary, 0.55)}</mesh>
          <Eye position={[0.47, 0.8, side * 0.39]} scale={0.82} />
          <mesh castShadow position={[-0.48, 0.24, side * 0.42]} rotation={[0.2 * side, 0, -0.72]} scale={[0.32, 0.58, 0.24]}><capsuleGeometry args={[0.22, 0.62, 8, 12]} />{material(primary, 0.68)}</mesh>
          <mesh castShadow position={[-0.6, 0.16, side * 0.47]} scale={[0.17, 0.13, 0.16]}><sphereGeometry args={[1, 12, 8]} />{material(primary, 0.7)}</mesh>
          <mesh castShadow position={[-0.72, 0.1, side * 0.52]} rotation={[0.1 * side, 0, 0.82]} scale={[0.16, 0.62, 0.15]}><capsuleGeometry args={[0.18, 0.68, 8, 12]} />{material(secondary, 0.7)}</mesh>
          <mesh castShadow position={[0.31, 0.23, side * 0.39]} scale={[0.12, 0.1, 0.12]}><sphereGeometry args={[1, 12, 8]} />{material(secondary, 0.72)}</mesh>
          <mesh castShadow position={[0.34, 0.17, side * 0.38]} rotation={[0.25 * side, 0, -0.42]} scale={[0.13, 0.48, 0.12]}><capsuleGeometry args={[0.18, 0.68, 8, 12]} />{material(secondary, 0.7)}</mesh>
          {[-0.1, 0, 0.1].map((offset) => <mesh key={offset} position={[0.54, 0.03, side * (0.42 + offset)]} rotation={[0, 0, Math.PI / 2]} scale={[0.05, 0.22, 0.035]}><capsuleGeometry args={[0.18, 0.68, 6, 10]} />{material(secondary, 0.72)}</mesh>)}
        </group>
      ))}
      <mesh position={[0.55, 0.38, 0]} scale={[0.24, 0.03, 0.38]}><torusGeometry args={[0.52, 0.08, 8, 22, Math.PI]} />{material("#42362f", 0.8)}</mesh>
    </group>
    </group>
  );
}

function BeeModel({ primary, secondary, seed = 0 }: ModelProps) {
  const wings = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (wings.current) wings.current.rotation.x = Math.sin(clock.elapsedTime * 15 + seed) * 0.28;
  });
  return (
    <group>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]} scale={[0.42, 0.7, 0.48]}><capsuleGeometry args={[0.32, 0.46, 10, 16]} />{material(primary, 0.72)}</mesh>
      {[-0.18, 0.08, 0.3].map((x) => <mesh key={x} position={[x, 0, 0]} scale={[0.055, 0.31, 0.3]}><torusGeometry args={[0.7, 0.12, 8, 22]} />{material(secondary, 0.84)}</mesh>)}
      <mesh position={[0.5, 0.03, 0]}><sphereGeometry args={[0.3, 18, 12]} />{material(secondary, 0.82)}</mesh>
      <Eye position={[0.65, 0.1, 0.23]} scale={0.62} /><Eye position={[0.65, 0.1, -0.23]} scale={0.62} />
      <group ref={wings}>
        {[1, -1].map((side) => <mesh key={side} position={[-0.05, 0.25, side * 0.31]} rotation={[side * 0.45, 0, side * 0.18]} scale={[0.62, 0.08, 0.34]}><sphereGeometry args={[1, 18, 10]} /><meshPhysicalMaterial color="#e8f4e8" transparent opacity={0.58} roughness={0.12} depthWrite={false} /></mesh>)}
      </group>
    </group>
  );
}

function ButterflyModel({ primary, secondary, seed = 0 }: ModelProps) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const flap = 0.4 + Math.sin(clock.elapsedTime * 5.4 + seed) * 0.48;
    if (left.current) left.current.rotation.x = flap;
    if (right.current) right.current.rotation.x = -flap;
  });
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.08, 0.58, 8, 12]} />{material("#2d2723", 0.88)}</mesh>
      {[{ side: 1 as const, ref: left }, { side: -1 as const, ref: right }].map(({ side, ref }) => (
        <group key={side} ref={ref} position={[0, 0, side * 0.08]}>
          <mesh position={[0, 0.04, side * 0.14]} rotation={[0, 0, Math.PI / 2]} scale={[0.1, 0.22, 0.1]}><capsuleGeometry args={[0.24, 0.72, 7, 10]} />{material(primary, 0.72)}</mesh>
          <mesh position={[0.08, 0.1, side * 0.34]} rotation={[Math.PI / 2, 0, side * -0.2]} scale={[0.62, 0.48, 0.08]}><sphereGeometry args={[1, 18, 12]} />{material(primary, 0.68)}</mesh>
          <mesh position={[-0.28, -0.02, side * 0.25]} rotation={[Math.PI / 2, 0, side * 0.4]} scale={[0.38, 0.34, 0.07]}><sphereGeometry args={[1, 18, 12]} />{material(secondary, 0.72)}</mesh>
          <mesh position={[0.16, 0.13, side * 0.69]} scale={[0.12, 0.08, 0.04]}><sphereGeometry args={[1, 12, 8]} />{material("#fff1b0", 0.6)}</mesh>
        </group>
      ))}
    </group>
  );
}

function DragonflyModel({ primary, secondary, seed = 0 }: ModelProps) {
  const wings = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (wings.current) wings.current.rotation.x = Math.sin(clock.elapsedTime * 16 + seed) * 0.17;
  });
  return (
    <group>
      <mesh position={[-0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.12, 0.95, 0.12]}><capsuleGeometry args={[0.18, 0.82, 8, 12]} />{material(primary, 0.42)}</mesh>
      <mesh position={[0.18, 0, 0]} scale={[0.32, 0.22, 0.32]}><sphereGeometry args={[1, 14, 9]} />{material(primary, 0.48)}</mesh>
      {[0, -0.24, -0.46, -0.66].map((x, i) => <mesh key={x} position={[x, 0, 0]}><sphereGeometry args={[0.12 - i * 0.012, 12, 8]} />{material(i % 2 ? secondary : primary, 0.5)}</mesh>)}
      <mesh position={[0.45, 0, 0]} scale={[0.28, 0.22, 0.24]}><sphereGeometry args={[1, 18, 12]} />{material(secondary, 0.52)}</mesh>
      <Eye position={[0.57, 0.08, 0.2]} scale={0.58} /><Eye position={[0.57, 0.08, -0.2]} scale={0.58} />
      <group ref={wings}>
        {[1, -1].flatMap((side) => [0.08, -0.22].map((x) => <group key={`${side}-${x}`}>
          <mesh position={[x, 0.05, side * 0.27]} rotation={[Math.PI / 2, 0, side * 0.1]} scale={[0.2, 0.06, 0.09]}><capsuleGeometry args={[0.22, 0.9, 7, 10]} />{material(primary, 0.5)}</mesh>
          <mesh position={[x, 0.08, side * 0.48]} rotation={[Math.PI / 2, 0, side * (x > 0 ? -0.26 : 0.18)]} scale={[0.58, 0.07, 0.16]}><capsuleGeometry args={[0.22, 0.9, 8, 12]} /><meshPhysicalMaterial color="#d9eef1" transparent opacity={0.5} roughness={0.1} depthWrite={false} /></mesh>
        </group>))}
      </group>
    </group>
  );
}

function ArticulatedLeg({ position, color, paw, legRef }: { position: [number, number, number]; color: string; paw: string; legRef?: React.RefObject<THREE.Group | null> }) {
  return <group ref={legRef} position={position}>
    <mesh castShadow position={[0, -0.24, 0]}><cylinderGeometry args={[0.105, 0.085, 0.5, 10]} />{material(color, 0.9)}</mesh>
    <mesh castShadow position={[0, -0.48, 0]}><sphereGeometry args={[0.115, 12, 9]} />{material(color, 0.9)}</mesh>
    <mesh castShadow position={[0.035, -0.68, 0]} rotation={[0, 0, -0.08]}><cylinderGeometry args={[0.075, 0.06, 0.42, 9]} />{material(paw, 0.92)}</mesh>
    <mesh castShadow position={[0.05, -0.87, 0]}><sphereGeometry args={[0.082, 10, 8]} />{material(paw, 0.94)}</mesh>
    <mesh castShadow position={[0.12, -0.91, 0]} scale={[0.18, 0.04, 0.13]}><sphereGeometry args={[1, 12, 8]} />{material(paw, 0.95)}</mesh>
  </group>;
}

type QuadrupedKind = "canid" | "bear" | "feline" | "paca" | "capybara" | "yak";

function QuadrupedModel({ primary, secondary, seed = 0, variant }: ModelProps & { variant: QuadrupedKind }) {
  const root = useRef<THREE.Group>(null);
  const legs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const heavy = variant === "bear" || variant === "yak";
  const rodent = variant === "paca" || variant === "capybara";
  const feline = variant === "feline";
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * (heavy ? 1.1 : 1.8) + seed;
    legs.forEach((leg, index) => { if (leg.current) leg.current.rotation.z = Math.sin(t + (index % 2) * Math.PI) * (heavy ? 0.055 : 0.09); });
    if (root.current) root.current.rotation.z = Math.sin(t * 0.34) * 0.014;
  });
  const bodyScale: [number, number, number] = heavy ? [0.92, 1.12, 0.82] : rodent ? [0.78, 0.94, 0.78] : [0.78, 1.08, 0.7];
  const headY = rodent ? 0.87 : heavy ? 1.18 : 1.17;
  const headX = rodent ? 0.77 : 0.88;
  return <group ref={root}>
    <mesh castShadow position={[-0.12, 1.02, 0]} rotation={[0, 0, Math.PI / 2]} scale={bodyScale}>
      <capsuleGeometry args={[0.5, heavy ? 0.96 : 0.82, 10, 18]} />{material(primary, variant === "feline" ? 0.72 : 0.9)}
    </mesh>
    <mesh castShadow position={[-0.62, 1.03, 0]} scale={heavy ? [0.62, 0.66, 0.62] : [0.5, 0.52, 0.5]}><sphereGeometry args={[0.58, 20, 14]} />{material(primary, 0.9)}</mesh>
    <mesh castShadow position={[0.5, 1.08, 0]} scale={[0.48, heavy ? 0.58 : 0.5, 0.48]}><sphereGeometry args={[0.5, 20, 14]} />{material(primary, 0.86)}</mesh>
    <group position={[headX, headY, 0]}>
      <mesh castShadow scale={variant === "bear" ? [0.58, 0.54, 0.58] : rodent ? [0.48, 0.44, 0.5] : [0.48, 0.46, 0.44]}><sphereGeometry args={[0.52, 22, 15]} />{material(primary, 0.82)}</mesh>
      <mesh castShadow position={[0.38, -0.1, 0]} scale={rodent ? [0.5, 0.32, 0.38] : [0.48, 0.28, 0.3]}><capsuleGeometry args={[0.3, rodent ? 0.38 : 0.48, 9, 14]} />{material(secondary, 0.84)}</mesh>
      <mesh position={[0.7, -0.12, 0]} scale={[0.09, 0.08, 0.11]}><sphereGeometry args={[1, 12, 8]} />{material("#211f1c", 0.72)}</mesh>
      <Eye position={[0.13, 0.12, 0.32]} scale={0.7} /><Eye position={[0.13, 0.12, -0.32]} scale={0.7} />
      {[-1, 1].map((side) => variant === "bear" ? <mesh key={side} position={[-0.12, 0.35, side * 0.28]}><sphereGeometry args={[0.13, 12, 8]} />{material(primary, 0.9)}</mesh> : <mesh key={side} position={[-0.1, 0.34, side * 0.27]} rotation={[0, 0, side * 0.1]} scale={[0.12, rodent ? 0.2 : 0.3, 0.14]}><coneGeometry args={[1, 1, 8]} />{material(primary, 0.88)}</mesh>)}
    </group>
    {[[0.42, 0.31], [0.42, -0.31], [-0.55, 0.31], [-0.55, -0.31]].map(([x, z], index) => <ArticulatedLeg key={index} legRef={legs[index]} position={[x, 0.92, z]} color={primary} paw={secondary} />)}
    {!rodent && <group position={[-0.94, 1.17, 0]} rotation={[0, 0, feline ? 0.7 : variant === "canid" ? 0.45 : 0.2]}>
      <mesh castShadow position={[-0.35, 0.15, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.16, feline ? 0.82 : 0.55, 0.16]}><capsuleGeometry args={[0.25, 0.8, 8, 12]} />{material(primary, 0.9)}</mesh>
    </group>}
    {variant === "paca" && [[-0.48, 1.25], [-0.12, 1.32], [0.26, 1.24]].flatMap(([x, y]) => [-1, 1].map((side) => <mesh key={`${x}-${side}`} position={[x, y, side * 0.43]} scale={[0.07, 0.04, 0.035]}><sphereGeometry args={[1, 9, 6]} />{material("#f3dfb4", 0.86)}</mesh>))}
    {variant === "yak" && <>
      <mesh position={[-0.1, 0.68, 0]} scale={[0.72, 0.34, 0.66]}><sphereGeometry args={[1, 18, 12]} />{material(secondary, 0.98)}</mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[0.77, 1.53, side * 0.25]} rotation={[0, 0, side * -0.65]}><torusGeometry args={[0.28, 0.045, 8, 18, Math.PI * 1.3]} />{material("#e6d6b5", 0.9)}</mesh>)}
    </>}
  </group>;
}

function ElephantModel({ primary, secondary, seed = 0 }: ModelProps) {
  const head = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (head.current) head.current.rotation.z = Math.sin(clock.elapsedTime * 0.55 + seed) * 0.025; });
  return <group>
    <mesh castShadow position={[-0.25, 1.28, 0]} scale={[1.0, 0.78, 0.76]}><sphereGeometry args={[0.78, 24, 16]} />{material(primary, 0.94)}</mesh>
    <group ref={head} position={[0.72, 1.35, 0]}>
      <mesh castShadow scale={[0.62, 0.66, 0.62]}><sphereGeometry args={[0.72, 24, 16]} />{material(primary, 0.92)}</mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[-0.08, 0.03, side * 0.5]} rotation={[0, Math.PI / 2, 0]} scale={[0.54, 0.64, 0.08]}><circleGeometry args={[1, 28]} />{material(secondary, 0.9)}</mesh>)}
      <mesh castShadow position={[0.42, -0.62, 0]} rotation={[0, 0, -0.12]}><capsuleGeometry args={[0.13, 0.95, 10, 16]} />{material(primary, 0.9)}</mesh>
      <mesh castShadow position={[0.32, -1.08, 0]} rotation={[0, 0, 0.28]}><capsuleGeometry args={[0.1, 0.42, 9, 14]} />{material(primary, 0.9)}</mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[0.42, -0.42, side * 0.2]} rotation={[0, 0, -0.18]}><coneGeometry args={[0.045, 0.48, 8]} />{material("#f0e5cf", 0.82)}</mesh>)}
      <Eye position={[0.39, 0.16, 0.43]} scale={0.68} /><Eye position={[0.39, 0.16, -0.43]} scale={0.68} />
    </group>
    {[[0.3, 0.44], [0.3, -0.44], [-0.68, 0.44], [-0.68, -0.44]].map(([x, z], index) => <group key={index} position={[x, 0.88, z]}>
      <mesh castShadow position={[0, -0.36, 0]}><cylinderGeometry args={[0.15, 0.13, 0.72, 10]} />{material(primary, 0.94)}</mesh>
      <mesh castShadow position={[0, -0.71, 0]}><sphereGeometry args={[0.15, 11, 8]} />{material(primary, 0.94)}</mesh>
      <mesh castShadow position={[0.06, -0.83, 0]} scale={[0.22, 0.08, 0.2]}><sphereGeometry args={[1, 12, 8]} />{material(secondary, 0.95)}</mesh>
    </group>)}
  </group>;
}

function DolphinModel({ primary, secondary, seed = 0 }: ModelProps) {
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (root.current) root.current.rotation.z = Math.sin(clock.elapsedTime * 2.2 + seed) * 0.04; });
  return <group ref={root}>
    <mesh scale={[1.08, 0.38, 0.38]}><sphereGeometry args={[0.78, 24, 16]} />{material(primary, 0.38)}</mesh>
    <mesh position={[0.78, -0.02, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.15, 0.52, 0.15]}><capsuleGeometry args={[0.22, 0.7, 8, 12]} />{material(secondary, 0.42)}</mesh>
    <mesh position={[-0.05, 0.48, 0]} scale={[0.35, 0.46, 0.08]}><coneGeometry args={[0.5, 0.72, 3]} />{material(primary, 0.45)}</mesh>
    {[-1, 1].map((side) => <mesh key={side} position={[-0.88, 0, side * 0.34]} rotation={[0, 0, side * 0.3]} scale={[0.42, 0.12, 0.34]}><coneGeometry args={[0.5, 0.8, 3]} />{material(primary, 0.44)}</mesh>)}
    <Eye position={[0.56, 0.12, 0.28]} scale={0.5} /><Eye position={[0.56, 0.12, -0.28]} scale={0.5} />
  </group>;
}

function CrocodileModel({ primary, secondary }: ModelProps) {
  return <group>
    <mesh position={[-0.2, 0.2, 0]} scale={[1.05, 0.24, 0.46]}><sphereGeometry args={[0.72, 22, 13]} />{material(primary, 0.78)}</mesh>
    <mesh position={[0.78, 0.18, 0]} scale={[0.82, 0.18, 0.34]}><capsuleGeometry args={[0.42, 0.66, 9, 14]} />{material(primary, 0.76)}</mesh>
    <mesh position={[-1.18, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.22, 1.2, 0.22]}><coneGeometry args={[0.42, 1.5, 10]} />{material(secondary, 0.8)}</mesh>
    {[-1, 1].flatMap((side) => [-0.48, 0.42].map((x) => <group key={`${side}-${x}`} position={[x, 0.2, side * 0.38]}>
      <mesh rotation={[side * 0.35, 0, 0]} position={[0, -0.12, side * 0.12]}><capsuleGeometry args={[0.07, 0.3, 7, 10]} />{material(primary, 0.82)}</mesh>
      <mesh position={[0.12, -0.2, side * 0.2]} scale={[0.18, 0.05, 0.12]}><sphereGeometry args={[1, 10, 7]} />{material(secondary, 0.84)}</mesh>
    </group>))}
    <Eye position={[0.76, 0.36, 0.28]} scale={0.5} /><Eye position={[0.76, 0.36, -0.28]} scale={0.5} />
  </group>;
}

function SeahorseModel({ primary, secondary, seed = 0 }: ModelProps) {
  const root = useRef<THREE.Group>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.1, 0.75, 0), new THREE.Vector3(-0.1, 0.38, 0), new THREE.Vector3(0.04, 0.02, 0), new THREE.Vector3(-0.18, -0.2, 0), new THREE.Vector3(-0.04, -0.4, 0), new THREE.Vector3(0.18, -0.34, 0),
  ]), []);
  useFrame(({ clock }) => { if (root.current) root.current.rotation.z = Math.sin(clock.elapsedTime * 0.7 + seed) * 0.08; });
  return <group ref={root}>
    <mesh><tubeGeometry args={[curve, 28, 0.11, 8, false]} />{material(primary, 0.64)}</mesh>
    <mesh position={[0.2, 0.85, 0]} scale={[0.42, 0.34, 0.3]}><sphereGeometry args={[0.45, 18, 12]} />{material(primary, 0.62)}</mesh>
    <mesh position={[0.47, 0.83, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.1, 0.34, 0.12]}><capsuleGeometry args={[0.2, 0.6, 7, 10]} />{material(secondary, 0.66)}</mesh>
    <mesh position={[-0.18, 0.42, 0]} scale={[0.08, 0.42, 0.36]}><coneGeometry args={[0.48, 0.78, 5]} />{material(secondary, 0.64)}</mesh>
    <Eye position={[0.3, 0.96, 0.18]} scale={0.48} />
  </group>;
}

function JellyfishModel({ primary, secondary, seed = 0 }: ModelProps) {
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (root.current) root.current.scale.y = 0.94 + Math.sin(clock.elapsedTime * 1.4 + seed) * 0.08; });
  return <group ref={root}>
    <mesh position={[0, 0.38, 0]} scale={[0.72, 0.38, 0.72]}><sphereGeometry args={[1, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} /><meshPhysicalMaterial color={primary} transparent opacity={0.7} roughness={0.18} transmission={0.18} depthWrite={false} /></mesh>
    {[-0.35, -0.12, 0.12, 0.35].map((z, index) => <mesh key={z} position={[(index % 2 ? -1 : 1) * 0.18, -0.28, z]} rotation={[0, 0, (index % 2 ? -1 : 1) * 0.14]}><capsuleGeometry args={[0.035, 0.9 + index * 0.12, 7, 10]} /><meshPhysicalMaterial color={secondary} transparent opacity={0.54} roughness={0.3} depthWrite={false} /></mesh>)}
  </group>;
}

function OctopusModel({ primary, secondary, seed = 0 }: ModelProps) {
  const root = useRef<THREE.Group>(null);
  const tentacles = useMemo(() => Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2;
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * 0.22, 0.2, Math.sin(angle) * 0.22),
      new THREE.Vector3(Math.cos(angle) * 0.5, 0.08, Math.sin(angle) * 0.5),
      new THREE.Vector3(Math.cos(angle + 0.22) * 0.8, 0.03, Math.sin(angle + 0.22) * 0.8),
    ]);
  }), []);
  useFrame(({ clock }) => { if (root.current) root.current.rotation.y = Math.sin(clock.elapsedTime * 0.32 + seed) * 0.16; });
  return <group ref={root}>
    <mesh castShadow position={[0, 0.56, 0]} scale={[0.52, 0.72, 0.52]}><sphereGeometry args={[0.72, 24, 16]} />{material(primary, 0.58)}</mesh>
    <mesh position={[0.35, 0.65, 0.3]}><sphereGeometry args={[0.11, 14, 9]} />{material(secondary, 0.5)}</mesh><Eye position={[0.39, 0.68, 0.37]} scale={0.62} />
    {tentacles.map((curve, index) => <mesh key={index}><tubeGeometry args={[curve, 16, 0.075, 7, false]} />{material(index % 2 ? secondary : primary, 0.62)}</mesh>)}
  </group>;
}

function TurtleModel({ primary, secondary, seed = 0, variant = "turtle" }: ModelProps & { variant?: "turtle" | "tortoise" }) {
  const flippers = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (flippers.current) flippers.current.rotation.x = Math.sin(clock.elapsedTime * 1.5 + seed) * 0.16;
  });
  const tortoise = variant === "tortoise";
  return (
    <group position={tortoise ? [0, -0.06, 0] : [0, 0, 0]} scale={tortoise ? [0.9, 1.08, 0.92] : 1}>
      <mesh castShadow position={[0, 0.34, 0]} scale={[0.9, 0.32, 0.72]}><sphereGeometry args={[0.75, 28, 18]} /><meshPhysicalMaterial color={primary} roughness={0.52} clearcoat={0.35} /></mesh>
      {[[-0.32, 0.12], [0, -0.06], [0.34, 0.11]].map(([x, r], i) => <mesh key={i} position={[x, 0.6, 0]} rotation={[0, 0, r]} scale={[0.06, 0.33, 0.55]}><torusGeometry args={[0.85, 0.08, 8, 28, Math.PI]} />{material(secondary, 0.72)}</mesh>)}
      <mesh position={[0.83, 0.3, 0]} scale={[0.42, 0.32, 0.32]}><sphereGeometry args={[0.46, 22, 14]} />{material(secondary, 0.78)}</mesh>
      <Eye position={[1.0, 0.4, 0.25]} scale={0.62} /><Eye position={[1.0, 0.4, -0.25]} scale={0.62} />
      <group ref={flippers}>
        {[1, -1].map((side) => <group key={side}>
          <mesh position={[0.25, 0.22, side * 0.55]} scale={[0.15, 0.12, 0.15]}><sphereGeometry args={[1, 12, 8]} />{material(secondary, 0.8)}</mesh>
          <mesh position={[0.28, 0.18, side * (tortoise ? 0.58 : 0.73)]} rotation={[0.2 * side, 0, side * -0.15]} scale={tortoise ? [0.28, 0.16, 0.2] : [0.52, 0.11, 0.24]}><capsuleGeometry args={[0.24, 0.88, 8, 14]} />{material(secondary, 0.8)}</mesh>
        </group>)}
      </group>
      {[1, -1].map((side) => <mesh key={side} position={[-0.55, 0.18, side * 0.56]} rotation={[0.1 * side, 0, side * 0.5]} scale={[0.36, 0.09, 0.2]}><capsuleGeometry args={[0.24, 0.72, 8, 14]} />{material(secondary, 0.8)}</mesh>)}
    </group>
  );
}

function RayModel({ primary, secondary, seed = 0 }: ModelProps) {
  const root = useRef<THREE.Group>(null);
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(1.05, 0);
    s.bezierCurveTo(0.35, 0.75, -0.45, 0.95, -0.9, 0);
    s.bezierCurveTo(-0.45, -0.95, 0.35, -0.75, 1.05, 0);
    s.closePath();
    return s;
  }, []);
  const tailCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.78, 0, 0), new THREE.Vector3(-1.4, -0.03, 0.05), new THREE.Vector3(-2.1, 0.05, -0.08), new THREE.Vector3(-2.7, 0, 0),
  ]), []);
  useFrame(({ clock }) => {
    if (root.current) root.current.rotation.z = Math.sin(clock.elapsedTime * 1.4 + seed) * 0.06;
  });
  return (
    <group ref={root}>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.4]}>
        <extrudeGeometry args={[shape, { depth: 0.16, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.05, bevelSegments: 3 }]} />
        <meshPhysicalMaterial color={primary} roughness={0.42} clearcoat={0.25} />
      </mesh>
      <mesh><tubeGeometry args={[tailCurve, 28, 0.035, 8, false]} />{material(secondary, 0.58)}</mesh>
      <Eye position={[0.47, 0.15, 0.24]} scale={0.54} /><Eye position={[0.47, 0.15, -0.24]} scale={0.54} />
      {[1, -1].map((side) => <mesh key={side} position={[0.05, 0.18, side * 0.48]} scale={[0.12, 0.025, 0.2]}><sphereGeometry args={[1, 12, 8]} />{material(secondary, 0.5)}</mesh>)}
    </group>
  );
}

export function AnimalModel({ kind, simplified = false, ...props }: ModelProps & { kind: AnimalVisualKind; simplified?: boolean }) {
  if (simplified) return <SimplifiedAnimalModel kind={kind} primary={props.primary} />;
  if (["deer", "pronghorn", "gazelle", "caribou", "brocket", "musk-deer"].includes(kind)) return <DeerModel {...props} variant={kind as HoofedKind} />;
  if (["rabbit", "jackrabbit", "hare"].includes(kind)) return <RabbitModel {...props} variant={kind as "rabbit" | "jackrabbit" | "hare"} />;
  if (["bird", "wren", "roller", "owl", "macaw", "monal"].includes(kind)) return <BirdModel {...props} variant={kind as "bird" | "wren" | "roller" | "owl" | "macaw" | "monal"} />;
  if (["fish", "catfish", "shark"].includes(kind)) return <FishModel {...props} variant={kind as "fish" | "catfish" | "shark"} />;
  if (kind === "frog" || kind === "bullfrog") return <FrogModel {...props} variant={kind} />;
  if (kind === "bee") return <BeeModel {...props} />;
  if (kind === "butterfly") return <ButterflyModel {...props} />;
  if (kind === "dragonfly") return <DragonflyModel {...props} />;
  if (kind === "turtle" || kind === "tortoise") return <TurtleModel {...props} variant={kind} />;
  if (kind === "ray") return <RayModel {...props} />;
  if (["canid", "bear", "feline", "paca", "capybara", "yak"].includes(kind)) return <QuadrupedModel {...props} variant={kind as QuadrupedKind} />;
  if (kind === "elephant") return <ElephantModel {...props} />;
  if (kind === "dolphin") return <DolphinModel {...props} />;
  if (kind === "crocodile") return <CrocodileModel {...props} />;
  if (kind === "seahorse") return <SeahorseModel {...props} />;
  if (kind === "jellyfish") return <JellyfishModel {...props} />;
  if (kind === "octopus") return <OctopusModel {...props} />;
  throw new Error(`Unknown animal visual kind: ${kind}`);
}
