"use client";
/* eslint-disable react/no-unknown-property */

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import * as THREE from "three";
import { getBiomeFauna } from "../data/biomeFauna";
import { useModalFocus } from "../hooks/useModalFocus";
import type { BiomeConfig, FloraStyle } from "../types/biome";
import type { AnimalVisualKind } from "../types/fauna";
import { AnimalModel } from "../scene/AnimalModels";

type GalleryAnimal = {
  id: string;
  label: string;
  type: "animal";
  visualKind: AnimalVisualKind;
  primary: string;
  secondary: string;
  category: string;
  habitat: string;
  description: string;
  scientificName?: string;
};

type GalleryFlora = {
  id: "oak" | "fruit_tree" | "wildflower";
  label: string;
  type: "flora";
  floraStyle: FloraStyle;
  primary: string;
  secondary: string;
  category: string;
  habitat: string;
  description: string;
};

export type GalleryItem = GalleryAnimal | GalleryFlora;

const floraIds: GalleryFlora["id"][] = ["oak", "fruit_tree", "wildflower"];

// The field models are authored at different physical sizes. Keeping framing
// data beside the gallery prevents a whale-sized elephant or tiny bee from
// being cropped when a judge moves through the specimen index.
const galleryAnimalScale: Partial<Record<AnimalVisualKind, number>> = {
  elephant: 0.7,
  bear: 0.82,
  yak: 0.78,
  muskox: 0.8,
  shark: 0.94,
  dolphin: 0.96,
  ray: 0.98,
  jellyfish: 1.02,
  octopus: 1.08,
  seahorse: 1.12,
  slug: 1.1,
  clam: 1.02,
  bee: 1.42,
  butterfly: 1.38,
  dragonfly: 1.34,
};

export const galleryItemsForBiome = (biome: BiomeConfig): GalleryItem[] => {
  const animals = getBiomeFauna(biome.id).spawns.map((spawn) => {
    const species = biome.species[spawn.role];
    return {
      id: spawn.id,
      label: spawn.label,
      type: "animal" as const,
      visualKind: spawn.kind,
      primary: spawn.primary ?? species.primary,
      secondary: spawn.secondary ?? species.secondary,
      category: spawn.category ?? species.category,
      habitat: spawn.habitat ?? species.habitat,
      description: spawn.ecologicalBeat,
      scientificName: spawn.scientificName ?? species.scientificName,
    };
  });

  const flora = biome.signatureFlora.map((label, index) => ({
    id: floraIds[index],
    label,
    type: "flora" as const,
    floraStyle: biome.floraStyle,
    primary: index === 1 ? biome.palette.floraSecondary : biome.palette.flora,
    secondary: biome.palette.groundDry,
    category: index === 2 ? "Signature meadow flora" : "Signature plant",
    habitat: biome.location,
    description: index === 0 ? "Creates shelter, shade, and structure for the surrounding food web." : index === 1 ? "Provides food and cover across the ecosystem." : "Marks the flowering layer that supports pollinators.",
  }));

  return [...animals, ...flora];
};

function FloraSpecimen({ floraStyle, primary, secondary }: Pick<GalleryFlora, "floraStyle" | "primary" | "secondary">) {
  if (floraStyle === "cactus") return <group>
    <mesh position={[0, 0.1, 0]}><capsuleGeometry args={[0.42, 2.8, 10, 18]} /><meshStandardMaterial color={primary} roughness={0.82} /></mesh>
    {[-1, 1].map((side) => <group key={side} position={[side * 0.5, -0.05, 0]} rotation={[0, 0, side * -0.68]}><mesh position={[0, 0.54, 0]}><capsuleGeometry args={[0.17, 1.05, 8, 12]} /><meshStandardMaterial color={secondary} roughness={0.84} /></mesh></group>)}
  </group>;
  if (floraStyle === "acacia") return <group>
    <mesh position={[0, -0.52, 0]}><cylinderGeometry args={[0.16, 0.32, 2.55, 10]} /><meshStandardMaterial color="#705032" roughness={0.92} /></mesh>
    <mesh position={[-0.4, 1.0, 0]} scale={[1.45, 0.42, 1.05]}><sphereGeometry args={[1, 24, 14]} /><meshStandardMaterial color={primary} roughness={0.9} /></mesh>
    <mesh position={[0.68, 1.16, 0.16]} scale={[1.1, 0.34, 0.84]}><sphereGeometry args={[1, 20, 12]} /><meshStandardMaterial color={secondary} roughness={0.9} /></mesh>
  </group>;
  if (floraStyle === "coral") return <group>
    {Array.from({ length: 11 }, (_, index) => <mesh key={index} position={[(index % 4 - 1.5) * 0.34, -0.35 + (index % 3) * 0.42, (Math.floor(index / 4) - 0.8) * 0.34]} rotation={[0.14 * (index % 2), 0, (index % 2 ? 1 : -1) * 0.22]}><capsuleGeometry args={[0.15, 1.1 + (index % 3) * 0.18, 8, 12]} /><meshStandardMaterial color={index % 2 ? primary : secondary} roughness={0.56} /></mesh>)}
  </group>;
  if (floraStyle === "tundra") return <group>
    {Array.from({ length: 18 }, (_, index) => <mesh key={index} position={[(index % 6 - 2.5) * 0.36, -0.62 + (index % 3) * 0.17, (Math.floor(index / 6) - 1) * 0.36]} scale={[0.26, 0.3 + (index % 3) * 0.08, 0.3]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color={index % 3 ? primary : secondary} roughness={1} /></mesh>)}
  </group>;
  const layered = floraStyle === "conifer" || floraStyle === "alpine";
  return <group>
    <mesh position={[0, -0.64, 0]}><cylinderGeometry args={[0.17, 0.32, 2.7, 10]} /><meshStandardMaterial color="#60432e" roughness={0.95} /></mesh>
    {layered
      ? [0.05, 0.67, 1.2].map((height, index) => <mesh key={height} position={[0, height, 0]} scale={[1.42 - index * 0.26, 0.95, 1.42 - index * 0.26]}><coneGeometry args={[1, 1.45, 14]} /><meshStandardMaterial color={index % 2 ? secondary : primary} roughness={0.9} /></mesh>)
      : <><mesh position={[0, 0.78, 0]} scale={[1.42, 1.25, 1.2]}><icosahedronGeometry args={[1, 2]} /><meshStandardMaterial color={primary} roughness={0.88} /></mesh><mesh position={[0.46, 0.47, 0.14]} scale={[0.9, 0.72, 0.78]}><icosahedronGeometry args={[1, 2]} /><meshStandardMaterial color={secondary} roughness={0.88} /></mesh></>}
  </group>;
}

function GalleryModel({ item }: { item: GalleryItem }) {
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    root.current.rotation.y += delta * 0.28;
    root.current.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.07 - 0.22;
  });
  const scale = item.type === "animal" ? galleryAnimalScale[item.visualKind] ?? 1.08 : 0.96;
  return <group ref={root} position={[0, -0.42, 0]} rotation={[0, -0.56, 0]} scale={scale}>
    {item.type === "animal"
      ? <AnimalModel kind={item.visualKind} primary={item.primary} secondary={item.secondary} seed={19} />
      : <FloraSpecimen floraStyle={item.floraStyle} primary={item.primary} secondary={item.secondary} />}
  </group>;
}

function GalleryStage({ item, biome }: { item: GalleryItem; biome: BiomeConfig }) {
  return <Canvas dpr={[1, 1.5]} shadows camera={{ position: [0, 0.65, 7.8], fov: 34, near: 0.1, far: 40 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.06; }}>
    <ambientLight intensity={1.32} color={biome.palette.skyHorizon} />
    <directionalLight castShadow position={[4.5, 6, 5]} intensity={2.25} color={biome.palette.sunlight} shadow-mapSize={[512, 512]} />
    <directionalLight position={[-5, 1, -3]} intensity={0.7} color={biome.palette.accent} />
    <GalleryModel key={item.id} item={item} />
    <ContactShadows position={[0, -1.06, 0]} opacity={0.36} scale={8} blur={2.4} far={4.5} color={biome.palette.cliff} />
    <OrbitControls enablePan={false} minDistance={5.8} maxDistance={9} minPolarAngle={0.75} maxPolarAngle={1.8} target={[0, 0.35, 0]} />
  </Canvas>;
}

type Props = {
  biome: BiomeConfig;
  selectedId: string | null;
  onClose: () => void;
  onInspect: (id: string) => void;
};

export function BiomeGallery({ biome, selectedId, onClose, onInspect }: Props) {
  const { dialogRef, closeButtonRef } = useModalFocus(onClose);
  const items = useMemo(() => galleryItemsForBiome(biome), [biome]);
  const [activeId, setActiveId] = useState(() => items.find((item) => item.id === selectedId)?.id ?? items[0]?.id ?? "");
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const activeItem = items[activeIndex] ?? items[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setActiveId(items[(activeIndex + 1) % items.length].id);
      if (event.key === "ArrowLeft") setActiveId(items[(activeIndex - 1 + items.length) % items.length].id);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, items, onClose]);

  if (!activeItem) return null;
  const chooseRelative = (offset: number) => setActiveId(items[(activeIndex + offset + items.length) % items.length].id);

  return <section ref={dialogRef} className="biome-gallery" role="dialog" aria-modal="true" aria-label={`${biome.name} specimen gallery`} style={{ "--gallery-sky": biome.palette.skyTop, "--gallery-horizon": biome.palette.skyHorizon, "--gallery-accent": biome.palette.accent } as CSSProperties}>
    <div className="biome-gallery-stage">
      <GalleryStage item={activeItem} biome={biome} />
    </div>
    <header className="biome-gallery-header"><span>{biome.name}</span><strong>Field gallery</strong><button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close field gallery"><X size={18} /></button></header>
    <section className="biome-gallery-detail" aria-live="polite">
      <span>{activeItem.type === "animal" ? "Observed animal" : "Observed flora"}</span>
      <h2>{activeItem.label}</h2>
      {activeItem.type === "animal" && activeItem.scientificName && <em>{activeItem.scientificName}</em>}
      <p>{activeItem.description}</p>
      <dl><div><dt>Type</dt><dd>{activeItem.category}</dd></div><div><dt>Habitat</dt><dd>{activeItem.habitat}</dd></div></dl>
      <button type="button" onClick={() => onInspect(activeItem.id)}>Find in the field <ArrowUpRight size={15} /></button>
    </section>
    <nav className="biome-gallery-index" aria-label="Tagged specimens in this biome">
      <button type="button" className="gallery-step" onClick={() => chooseRelative(-1)} aria-label="Previous specimen"><ChevronLeft size={18} /></button>
      <div>{items.map((item, index) => <button key={item.id} type="button" className={item.id === activeItem.id ? "active" : ""} onClick={() => setActiveId(item.id)} aria-current={item.id === activeItem.id ? "true" : undefined}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.label}</strong></button>)}</div>
      <button type="button" className="gallery-step" onClick={() => chooseRelative(1)} aria-label="Next specimen"><ChevronRight size={18} /></button>
    </nav>
  </section>;
}

export default BiomeGallery;
