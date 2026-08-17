"use client";

import { Droplets, Leaf, Play, RefreshCw, Trees, X } from "lucide-react";

export type StoryPhase = "idle" | "witness" | "pressure" | "collapse" | "restore" | "return";

const beats: Record<Exclude<StoryPhase, "idle">, { eyebrow: string; title: string; description: string; icon: typeof Play; step: number }> = {
  witness: { eyebrow: "01 · Baseline", title: "A cold river supports a living forest", description: "Watch salmon, pollinators, birds, and browsers use the same connected habitat.", icon: Leaf, step: 1 },
  pressure: { eyebrow: "02 · Pressure", title: "Runoff clouds the spawning river", description: "Water quality falls first. Aquatic species slow down and begin to retreat.", icon: Droplets, step: 2 },
  collapse: { eyebrow: "03 · Ripple", title: "Canopy loss breaks the food web", description: "Trees disappear, stumps spread, and animals leave damaged habitat as biodiversity drops.", icon: Trees, step: 3 },
  restore: { eyebrow: "04 · Intervention", title: "A riparian buffer begins recovery", description: "Native canopy and clean water return together—rebuilding several ecological links at once.", icon: RefreshCw, step: 4 },
  return: { eyebrow: "05 · Recovery", title: "The spawning run returns", description: "Clear water, connected habitat, and moving wildlife make resilience visible again.", icon: Play, step: 5 },
};

export function EcosystemStory({ phase, onClose }: { phase: StoryPhase; onClose: () => void }) {
  if (phase === "idle") return null;
  const beat = beats[phase];
  const Icon = beat.icon;
  return (
    <aside className={`story-beat story-${phase}`} aria-live="polite" aria-label="Guided ecosystem story">
      <div className="story-beat-icon"><Icon size={18} /></div>
      <div className="story-beat-copy"><small>{beat.eyebrow}</small><strong>{beat.title}</strong><p>{beat.description}</p></div>
      <button type="button" aria-label="Stop guided story" onClick={onClose}><X size={15} /></button>
      <div className="story-progress" aria-hidden="true">{[1, 2, 3, 4, 5].map((step) => <i key={step} className={step <= beat.step ? "active" : ""} />)}</div>
    </aside>
  );
}
