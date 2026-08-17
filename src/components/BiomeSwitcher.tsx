"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { MountainSnow, Shell, Snowflake, Sun, TreePine, Trees, Waves } from "lucide-react";
import type { BiomeIconKey, BiomeId } from "../types/biome";

export type BiomeSummary = {
  id: BiomeId;
  name: string;
  shortLabel: string;
  location: string;
  iconKey: BiomeIconKey;
  accent: string;
};

export type BiomeSwitcherProps = {
  biomes: BiomeSummary[];
  activeId: BiomeId;
  onChange: (id: BiomeId) => void;
};

const icons: Record<BiomeIconKey, LucideIcon> = {
  forest: Trees,
  sun: Sun,
  savanna: TreePine,
  snow: Snowflake,
  river: Waves,
  mountain: MountainSnow,
  reef: Shell,
};

export function BiomeSwitcher({ biomes, activeId, onChange }: BiomeSwitcherProps) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(0, biomes.findIndex((biome) => biome.id === activeId));

  useEffect(() => {
    buttons.current[activeIndex]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % biomes.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + biomes.length) % biomes.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = biomes.length - 1;
    else return;
    event.preventDefault();
    onChange(biomes[next].id);
    buttons.current[next]?.focus();
  };

  return (
    <nav className="biome-switcher" aria-label="Explore seven connected biomes">
      <div className="biome-switcher-kicker"><span>World atlas</span><strong>07 biomes</strong></div>
      <div className="biome-switcher-rail" role="tablist" aria-label="Available biomes">
        {biomes.map((biome, index) => {
          const Icon = icons[biome.iconKey];
          const active = biome.id === activeId;
          return (
            <button
              key={biome.id}
              ref={(button) => { buttons.current[index] = button; }}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              title={`${biome.name} · ${biome.location}`}
              className={active ? "active" : ""}
              style={{ "--biome-accent": biome.accent } as CSSProperties}
              onClick={() => onChange(biome.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="biome-icon"><Icon size={15} strokeWidth={1.8} /></span>
              <span className="biome-tab-copy"><strong>{biome.shortLabel}</strong><small>{biome.location}</small></span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
