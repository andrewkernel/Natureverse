"use client";

import { Check, Droplets, Leaf, Sparkles, X } from "lucide-react";

type ProofMetric = {
  label: string;
  before: number;
  after: number;
  icon: "water" | "life" | "species";
};

type ImpactSummary = {
  recoveredSpecies: number;
  strongestRelationship: string;
  remainingRisk: string;
};

export function RestorationProof({ title, lesson, metrics, impact, onClose }: { title: string; lesson: string; metrics: ProofMetric[]; impact?: ImpactSummary; onClose: () => void }) {
  const icons = { water: Droplets, life: Leaf, species: Sparkles };
  return <section className="restoration-proof" aria-live="polite" aria-label="Restoration results">
    <div className="restoration-proof-head">
      <span className="restoration-proof-check"><Check size={15} strokeWidth={2.8} /></span>
      <div><small>Restoration proof</small><strong>{title}</strong></div>
      <button type="button" onClick={onClose} aria-label="Dismiss restoration results"><X size={16} /></button>
    </div>
    <div className="restoration-proof-metrics">
      {metrics.map((metric) => {
        const Icon = icons[metric.icon];
        return <div key={metric.label}>
          <Icon size={14} />
          <span>{metric.label}</span>
          <b>{Math.round(metric.before)}</b><i aria-hidden="true">→</i><strong>{Math.round(metric.after)}</strong>
        </div>;
      })}
    </div>
    {impact && <div className="restoration-proof-impact">
      <div><small>Food-web response</small><strong>{impact.recoveredSpecies} species recovering</strong></div>
      <div><small>Strongest link</small><span>{impact.strongestRelationship}</span></div>
      <div><small>Keep watching</small><span>{impact.remainingRisk}</span></div>
    </div>}
    <p>{lesson}</p>
  </section>;
}
