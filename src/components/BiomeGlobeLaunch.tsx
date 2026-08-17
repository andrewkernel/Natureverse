"use client";

import { ArrowRight, Check, Globe2, MapPin, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import { EarthSelectorScene } from "./EarthSelectorScene";
import type { BiomeConfig, BiomeId } from "../types/biome";

type Props = {
  biomes: BiomeConfig[];
  selectedBiomeId: BiomeId | null;
  onSelectBiome: (id: BiomeId) => void;
  onBegin: () => void;
};

export function BiomeGlobeLaunch({ biomes, selectedBiomeId, onSelectBiome, onBegin }: Props) {
  const firstSiteRef = useRef<HTMLButtonElement>(null);
  const selectedBiome = biomes.find((biome) => biome.id === selectedBiomeId);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => firstSiteRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="globe-launch" role="presentation">
      <section className="globe-launch-layout" role="dialog" aria-modal="true" aria-labelledby="globe-launch-title" aria-describedby="globe-launch-copy">
        <header className="globe-launch-intro">
          <p><Globe2 size={15} /> Natureverse field sites</p>
          <h1 id="globe-launch-title">Choose where to begin.</h1>
          <p id="globe-launch-copy">Rotate the Earth, then choose a field site from the directory. Each site opens a distinct 3D ecosystem.</p>
        </header>

        <div className="globe-launch-map" aria-label="Interactive field-site globe">
          <EarthSelectorScene biomes={biomes} selectedBiomeId={selectedBiomeId} onSelectBiome={onSelectBiome} />
          <p className="globe-launch-drag"><RotateCcw size={13} /> Drag Earth to rotate · field pins mark each site</p>
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
          <p className="globe-launch-credit">Earth model by <a href="https://sketchfab.com/Jacobs_Development" target="_blank" rel="noreferrer">Jacobs Development</a> · CC BY 4.0</p>
          <button className="globe-launch-begin" type="button" disabled={!selectedBiome} onClick={onBegin}>
            {selectedBiome ? <>Enter {selectedBiome.shortLabel}<ArrowRight size={16} /></> : <>Select a site<ArrowRight size={16} /></>}
          </button>
        </aside>
      </section>
    </div>
  );
}

export default BiomeGlobeLaunch;
