"use client";

import { ArrowRight, Check, Compass, Leaf, MapPin, Mountain, Snowflake, Sparkles, SunMedium, Trees, Waves } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
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
  const [logoUnavailable, setLogoUnavailable] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const firstBiomeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase !== "choose-region") return;
    const frame = window.requestAnimationFrame(() => firstBiomeRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [phase]);

  const trapDialogFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  if (phase === "loading") {
    return (
      <div className="launch-backdrop launch-loading-backdrop" role="status" aria-live="polite" aria-label="Loading Natureverse">
        <section className={"launch-wall" + (progress >= 76 ? " is-opening" : "")} aria-label="Preparing your field sites">
          <div className="launch-wall-shutter launch-wall-shutter-left" aria-hidden="true" />
          <div className="launch-wall-shutter launch-wall-shutter-right" aria-hidden="true" />
          <div className="launch-wall-content">
            <div className="launch-wall-logo-frame">
              {logoUnavailable
                ? <div className="launch-wall-logo-fallback" aria-label="Natureverse"><Leaf size={94} /><strong>Nature<span>verse</span></strong><small>Explore · Learn · Restore</small></div>
                : <>
                  {/* The supplied transparent brand art is intentionally presented at its native aspect ratio. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/natureverse-launch-logo.png" alt="Natureverse logo — Explore, learn, restore" className="launch-wall-logo" onError={() => setLogoUnavailable(true)} />
                </>}
            </div>
            <div className="launch-wall-status">
              <span>{progress < 48 ? "Gathering living systems" : progress < 76 ? "Connecting every field site" : "Opening the field guide"}</span>
              <div className="launch-progress" aria-hidden="true"><i style={{ width: progress + "%" }} /></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const selectedBiome = biomes.find((biome) => biome.id === selectedBiomeId);

  return (
    <div className="launch-backdrop" role="presentation">
      <section className="region-launch" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="region-launch-title" aria-describedby="region-launch-copy">
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
                ref={biome === biomes[0] ? firstBiomeRef : undefined}
                aria-pressed={selected}
                onClick={() => onSelectBiome(biome.id)}
                onKeyDown={trapDialogFocus}
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
          <button className="region-launch-begin" type="button" disabled={!selectedBiome} onClick={onBegin} onKeyDown={trapDialogFocus}>
            {selectedBiome ? <>Begin in {selectedBiome.shortLabel}<ArrowRight size={16} /></> : <>Choose a region<ArrowRight size={16} /></>}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default NatureverseLaunch;
