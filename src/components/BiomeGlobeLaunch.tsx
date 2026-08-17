"use client";

import { ArrowRight, Check, Globe2, MapPin, RotateCcw } from "lucide-react";
import { useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import type { BiomeConfig, BiomeId } from "../types/biome";

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
  onBegin: () => void;
};

export function BiomeGlobeLaunch({ biomes, selectedBiomeId, onSelectBiome, onBegin }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const firstSiteRef = useRef<HTMLButtonElement>(null);
  const dragging = useRef<number | null>(null);
  const pointerX = useRef(0);
  const phi = useRef(0.4);
  const targetPhi = useRef(0.4);
  const size = useRef(560);
  const selectedBiome = biomes.find((biome) => biome.id === selectedBiomeId);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => firstSiteRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let disposed = false;
    let destroy: (() => void) | undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => { size.current = Math.max(330, Math.round(element.getBoundingClientRect().width)); };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);

    void import("cobe").then(({ default: createGlobe }) => {
      if (disposed) return;
      const globe = createGlobe(element, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: size.current,
        height: size.current,
        phi: phi.current,
        theta: 0.14,
        dark: 0,
        diffuse: 1.1,
        scale: 0.95,
        mapSamples: 14_000,
        mapBrightness: 6,
        baseColor: [0.08, 0.22, 0.16],
        glowColor: [0.26, 0.68, 0.48],
        markerColor: [0.85, 0.95, 0.53],
        markers: biomes.map((biome) => ({ location: coordinates[biome.id], size: biome.id === selectedBiomeId ? 0.085 : 0.052, id: biome.id })),
        onRender: (state) => {
          if (!reducedMotion && dragging.current == null) targetPhi.current += 0.0017;
          phi.current += (targetPhi.current - phi.current) * 0.09;
          state.phi = phi.current;
          state.width = size.current;
          state.height = size.current;
        },
      });
      destroy = () => globe.destroy();
    });

    return () => {
      disposed = true;
      observer.disconnect();
      destroy?.();
    };
  }, [biomes, selectedBiomeId]);

  const pointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    dragging.current = event.pointerId;
    pointerX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (dragging.current !== event.pointerId) return;
    const delta = event.clientX - pointerX.current;
    pointerX.current = event.clientX;
    targetPhi.current += delta / 180;
  };
  const pointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (dragging.current === event.pointerId) dragging.current = null;
  };

  return (
    <div className="globe-launch" role="presentation">
      <section className="globe-launch-layout" role="dialog" aria-modal="true" aria-labelledby="globe-launch-title" aria-describedby="globe-launch-copy">
        <header className="globe-launch-intro">
          <p><Globe2 size={15} /> Natureverse field sites</p>
          <h1 id="globe-launch-title">Choose where to begin.</h1>
          <p id="globe-launch-copy">Select a marked place on the living globe. Each site opens a distinct 3D ecosystem.</p>
        </header>

        <div className="globe-launch-map" aria-label="Interactive field-site globe">
          <canvas ref={canvas} className="globe-launch-canvas" aria-hidden="true" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} />
          <div className="globe-launch-marker-layer" aria-label="Field sites on the globe">
            {biomes.map((biome) => {
              const selected = biome.id === selectedBiomeId;
              return (
                <button
                  className={"globe-site-marker" + (selected ? " is-selected" : "")}
                  key={biome.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectBiome(biome.id)}
                  style={{ "--globe-anchor": `--cobe-${biome.id}`, "--globe-marker-visible": `var(--cobe-visible-${biome.id}, 0)`, "--site-accent": biome.palette.accent } as CSSProperties}
                >
                  <i aria-hidden="true" />
                  <span>{biome.shortLabel}</span>
                </button>
              );
            })}
          </div>
          <p className="globe-launch-drag"><RotateCcw size={13} /> Drag to rotate · select a marker</p>
        </div>

        <aside className="globe-launch-directory" aria-label="Field-site directory">
          <p className="globe-directory-label">Site directory</p>
          <div className="globe-directory-list">
            {biomes.map((biome, index) => {
              const selected = biome.id === selectedBiomeId;
              return (
                <button
                  ref={index === 0 ? firstSiteRef : undefined}
                  className={selected ? "is-selected" : ""}
                  key={biome.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectBiome(biome.id)}
                >
                  <span className="globe-directory-number">{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{biome.name}</strong><small><MapPin size={11} /> {biome.location}</small></span>
                  {selected && <Check size={15} aria-label="Selected" />}
                </button>
              );
            })}
          </div>
          <div className="globe-launch-choice" aria-live="polite">
            {selectedBiome ? <><span style={{ backgroundColor: selectedBiome.palette.accent }} /><p><strong>{selectedBiome.name}</strong>{selectedBiome.tagline}</p></> : <p>Select a site to continue.</p>}
          </div>
          <button className="globe-launch-begin" type="button" disabled={!selectedBiome} onClick={onBegin}>
            {selectedBiome ? <>Enter {selectedBiome.shortLabel}<ArrowRight size={16} /></> : <>Select a site<ArrowRight size={16} /></>}
          </button>
        </aside>
      </section>
    </div>
  );
}

export default BiomeGlobeLaunch;
