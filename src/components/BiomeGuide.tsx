"use client";

import { CloudSun, MapPin, Target } from "lucide-react";

export type BiomeGuideProps = {
  name: string;
  location: string;
  climate: string;
  focalSpecies: Array<{ id: string; name: string }>;
  mission: string;
  discovery: { found: number; total: number };
};

export function BiomeGuide({ name, location, climate, focalSpecies, mission, discovery }: BiomeGuideProps) {
  const progress = discovery.total ? Math.min(100, Math.max(0, (discovery.found / discovery.total) * 100)) : 0;
  return (
    <aside className="biome-guide" aria-label={`${name} field guide`}>
      <div className="biome-guide-heading">
        <div><small>Active field guide</small><strong>{name}</strong></div>
        <span>{String(discovery.found).padStart(2, "0")}/{String(discovery.total).padStart(2, "0")}</span>
      </div>
      <div className="biome-guide-meta">
        <p><MapPin size={13} /><span>{location}</span></p>
        <p><CloudSun size={13} /><span>{climate}</span></p>
      </div>
      <div className="biome-guide-species" aria-label="Focal species">
        {focalSpecies.map((species) => <span key={species.id}>{species.name}</span>)}
      </div>
      <div className="biome-guide-mission"><Target size={14} /><p><small>Restoration focus</small>{mission}</p></div>
      <div className="biome-guide-progress" role="progressbar" aria-label="Species discovered" aria-valuemin={0} aria-valuemax={discovery.total} aria-valuenow={discovery.found}><i style={{ width: `${progress}%` }} /></div>
    </aside>
  );
}
