"use client";

import { Bird, Bug, Fish, Rabbit, Search } from "lucide-react";
import type { CSSProperties } from "react";
import type { BiomeSpecies, SpeciesRole } from "../types/biome";

type Props = {
  species: Array<{ id: SpeciesRole; item: BiomeSpecies; health: number }>;
  selectedId: string | null;
  onSelect: (id: SpeciesRole) => void;
};

const icons: Record<SpeciesRole, typeof Bird> = { deer: Rabbit, rabbit: Rabbit, bird: Bird, fish: Fish, frog: Bug, bee: Bug, butterfly: Bug, dragonfly: Bug };

export function SpeciesRail({ species, selectedId, onSelect }: Props) {
  return <section className="species-rail" aria-label="Species to inspect">
    <div className="species-rail-head"><span><Search size={14} />Field clues</span><small>Tap any animal</small></div>
    <div className="species-rail-list">
      {species.map(({ id, item, health }) => {
        const Icon = icons[id];
        return <button type="button" key={id} onClick={() => onSelect(id)} className={selectedId === id ? "active" : ""} aria-pressed={selectedId === id}>
          <span><Icon size={15} /></span><strong>{item.name}</strong><i style={{ "--health": `${Math.max(0, Math.min(100, health))}%` } as CSSProperties} aria-label={`${Math.round(health)} percent population health`} />
        </button>;
      })}
    </div>
  </section>;
}

export default SpeciesRail;
