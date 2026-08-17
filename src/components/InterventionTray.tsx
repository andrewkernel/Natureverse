"use client";

import { Check, Droplets, Leaf, LockKeyhole, Sprout } from "lucide-react";
import type { RestorationAction } from "../data/interventions";

type Props = {
  actions: RestorationAction[];
  remaining: number;
  appliedIds: string[];
  busy?: boolean;
  onApply: (action: RestorationAction) => void;
};

const iconForAction = (id: string) => id.includes("water") || id.includes("stream") || id.includes("river") || id.includes("lagoon") || id.includes("spring") || id.includes("runoff") ? Droplets : id.includes("corridor") || id.includes("gate") || id.includes("cross") || id.includes("channel") ? Leaf : Sprout;

export function InterventionTray({ actions, remaining, appliedIds, busy = false, onApply }: Props) {
  return (
    <section className="intervention-tray" aria-labelledby="intervention-tray-title">
      <div className="intervention-tray-head">
        <div><small>Restoration toolkit</small><h2 id="intervention-tray-title">Spend actions where the web needs them</h2></div>
        <span>{remaining} <small>left</small></span>
      </div>
      <div className="intervention-grid">
        {actions.map((action) => {
          const applied = appliedIds.includes(action.id);
          const locked = remaining <= 0 || applied || busy;
          const Icon = iconForAction(action.id);
          return <article key={action.id} className={`intervention-card ${applied ? "applied" : ""}`}>
            <span className="intervention-icon">{applied ? <Check size={16} /> : <Icon size={16} />}</span>
            <div><h3>{action.label}</h3><p>{action.description}</p></div>
            <small>{action.tradeoff}</small>
            <button type="button" disabled={locked} onClick={() => onApply(action)}>
              {applied ? "Applied" : locked ? <><LockKeyhole size={14} />Unavailable</> : "Apply action"}
            </button>
          </article>;
        })}
      </div>
    </section>
  );
}

export default InterventionTray;
