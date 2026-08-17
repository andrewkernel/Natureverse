"use client";

import { ArrowRight, Check, Compass, Leaf, MapPin, Mountain, Snowflake, Sparkles, SunMedium, Trees, Waves } from "lucide-react";
import type { CSSProperties } from "react";
import type { BiomeConfig, BiomeIconKey, BiomeId } from "../types/biome";

type Props = {
  phase: "loading" | "choose-region";
  progress: number;
  biomes: BiomeConfig[];
  selectedBiomeId: BiomeId | null;
  onSelectBiome: (id: BiomeId) => void;
  onBegin: () => void;
};

const biomeIcons: Record<BiomeIconKey, typeof Trees> = {
  forest: Trees,
  sun: SunMedium,
  savanna: Leaf,
  snow: Snowflake,
  river: Waves,
  mountain: Mountain,
  reef: Waves,
};

export function NatureverseLaunch({ phase, progress, biomes, selectedBiomeId, onSelectBiome, onBegin }: Props) {
  if (phase === "loading") {
    return (
      <div className="launch-backdrop launch-loading-backdrop" role="status" aria-live="polite" aria-label="Loading Natureverse">
        <section className="launch-loader" aria-label="Preparing your field sites">
          <div className="launch-orbit" aria-hidden="true"><i /><i /><span><Leaf size={23} /></span></div>
          <p>Natureverse field notes</p>
          <h1>Waking the world</h1>
          <div className="launch-progress" aria-hidden="true"><i style={{ width: progress + "%" }} /></div>
          <small>{progress < 62 ? "Mapping habitats" : progress < 90 ? "Listening for life" : "Field sites ready"}</small>
        </section>
      </div>
    );
  }

  const selectedBiome = biomes.find((biome) => biome.id === selectedBiomeId);

  return (
    <div className="launch-backdrop" role="presentation">
      <section className="region-launch" role="dialog" aria-modal="true" aria-labelledby="region-launch-title" aria-describedby="region-launch-copy">
        <header className="region-launch-header">
          <div className="region-launch-mark"><Compass size={19} /></div>
          <div>
            <p>Natureverse · Field explorer</p>
            <h1 id="region-launch-title">Where would you like to begin?</h1>
          </div>
          <span className="region-launch-count">07 sites</span>
        </header>
        <p className="region-launch-copy" id="region-launch-copy">Choose a living region. Its weather, species, and ecological story will become your field site.</p>

        <div className="region-launch-grid" aria-label="Available regions">
          {biomes.map((biome) => {
            const Icon = biomeIcons[biome.iconKey];
            const selected = biome.id === selectedBiomeId;
            return (
              <button
                className={"region-launch-card" + (selected ? " is-selected" : "")}
                key={biome.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectBiome(biome.id)}
                style={{ "--region-accent": biome.palette.accent, "--region-sky": biome.palette.skyTop } as CSSProperties}
              >
                <span className="region-launch-icon"><Icon size={17} /></span>
                <span className="region-launch-card-copy"><strong>{biome.shortLabel}</strong><small><MapPin size={10} />{biome.location}</small><em>{biome.tagline}</em></span>
                <span className="region-launch-check" aria-hidden="true"><Check size={13} /></span>
              </button>
            );
          })}
        </div>

        <footer className="region-launch-footer">
          <div className="region-launch-selection" aria-live="polite">
            {selectedBiome ? <><Sparkles size={14} /><span><strong>{selectedBiome.name}</strong> is ready to explore</span></> : <span>Select a field site to continue</span>}
          </div>
          <button className="region-launch-begin" type="button" disabled={!selectedBiome} onClick={onBegin}>
            {selectedBiome ? <>Begin in {selectedBiome.shortLabel}<ArrowRight size={16} /></> : <>Choose a region<ArrowRight size={16} /></>}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default NatureverseLaunch;
