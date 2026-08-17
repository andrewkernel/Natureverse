"use client";

import { ArrowRight, Check, Eye, RotateCcw, Sprout, Target } from "lucide-react";

export type MissionStage = "explore" | "investigate" | "restore" | "complete" | "failed";

type Props = {
  title: string;
  objective: string;
  stage: MissionStage;
  progress: number;
  discoveries: number;
  discoveryTarget: number;
  restorationBudget: number;
  onPrimaryAction: () => void;
  onMissionOpen: () => void;
};

const stageCopy: Record<MissionStage, { eyebrow: string; prompt: string; action: string; Icon: typeof Eye }> = {
  explore: { eyebrow: "Field objective", prompt: "Find a living clue in the ecosystem.", action: "Inspect a species", Icon: Eye },
  investigate: { eyebrow: "Field objective", prompt: "Select an animal to trace its ecological role.", action: "Investigate now", Icon: Eye },
  restore: { eyebrow: "Restoration window", prompt: "Choose connected actions—not a single quick fix.", action: "Open restoration tools", Icon: Sprout },
  complete: { eyebrow: "Mission complete", prompt: "The recovery is measurable across the food web.", action: "Review impact proof", Icon: Check },
  failed: { eyebrow: "Recovery paused", prompt: "One link improved, but the food web needs a connected solution.", action: "Retry mission", Icon: RotateCcw },
};

export function MissionHUD({ title, objective, stage, progress, discoveries, discoveryTarget, restorationBudget, onPrimaryAction, onMissionOpen }: Props) {
  const copy = stageCopy[stage];
  const Icon = copy.Icon;
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <section className={`mission-hud mission-hud-${stage}`} aria-label="Current Natureverse objective">
      <div className="mission-hud-topline">
        <span><Target size={14} />{copy.eyebrow}</span>
        <button type="button" onClick={onMissionOpen} aria-label="Open mission details">Details <ArrowRight size={13} /></button>
      </div>
      <h2>{title}</h2>
      <p>{objective}</p>
      <div className="mission-hud-track" role="progressbar" aria-label="Mission recovery progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(safeProgress)}>
        <span style={{ width: `${safeProgress}%` }} />
      </div>
      <div className="mission-hud-signals">
        <span><Eye size={13} />{discoveries}/{discoveryTarget} clues</span>
        <span><Sprout size={13} />{restorationBudget} actions left</span>
      </div>
      <button type="button" className="mission-hud-action" onClick={onPrimaryAction}><Icon size={16} />{copy.action}<ArrowRight size={16} /></button>
      <p className="mission-hud-prompt">{copy.prompt}</p>
    </section>
  );
}

export default MissionHUD;
