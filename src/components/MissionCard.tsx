"use client";

import type { ReactNode } from "react";

export type MissionCardStatus = "active" | "completed" | "locked";

export interface MissionCardProps {
  title: string;
  description: string;
  progress: number;
  target: number;
  reward?: string;
  category?: string;
  status?: MissionCardStatus;
  icon?: ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

const statusCopy: Record<MissionCardStatus, string> = {
  active: "In progress",
  completed: "Complete",
  locked: "Locked",
};

function LeafMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.6 4.4C12.2 4.1 6.3 6.1 5 11.2c-.9 3.6 1.6 6.6 5.1 6.2 5.1-.6 8.3-5.1 9.5-13Z" />
      <path d="M4.5 20c2.4-4.5 5.5-7.1 10.1-9.6" />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <path d="m5 10.4 3.2 3.1L15.2 6.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MissionCard({
  title,
  description,
  progress,
  target,
  reward,
  category = "Ecosystem challenge",
  status = "active",
  icon,
  onAction,
  actionLabel,
  className = "",
}: MissionCardProps) {
  const safeTarget = Math.max(target, 1);
  const safeProgress = Math.min(Math.max(progress, 0), safeTarget);
  const percentage = Math.round((safeProgress / safeTarget) * 100);
  const isComplete = status === "completed" || percentage >= 100;
  const isLocked = status === "locked";
  const resolvedStatus = isComplete ? "completed" : status;
  const defaultActionLabel = isComplete ? "View reward" : isLocked ? "Locked" : "Open mission";

  return (
    <article
      className={`group relative flex min-h-[248px] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#12231d]/95 p-5 text-[#f1f5e8] shadow-[0_20px_70px_-35px_rgba(8,30,22,0.85)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#b6d867]/30 hover:shadow-[0_25px_80px_-35px_rgba(118,174,101,0.35)] ${isLocked ? "opacity-80" : ""} ${className}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#b6d867]/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${isComplete ? "border-[#d8f17e]/30 bg-[#d8f17e]/15 text-[#d8f17e]" : "border-[#b6d867]/20 bg-[#b6d867]/10 text-[#c5e77a]"}`}>
            {icon ?? <LeafMark />}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#aab9a2]">{category}</p>
            <p className={`mt-1 flex items-center gap-1.5 text-xs font-medium ${isComplete ? "text-[#d8f17e]" : isLocked ? "text-[#aab9a2]" : "text-[#b8d6b0]"}`}>
              {isComplete && <CheckMark />}
              {statusCopy[resolvedStatus]}
            </p>
          </div>
        </div>

        {reward && (
          <div className="shrink-0 rounded-full border border-[#f2c879]/20 bg-[#f2c879]/10 px-2.5 py-1 text-[11px] font-semibold text-[#f5d58f]">
            +{reward}
          </div>
        )}
      </div>

      <div className="relative mt-5">
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">{title}</h3>
        <p className="mt-2 max-w-[34rem] text-sm leading-6 text-[#b5c4b8]">{description}</p>
      </div>

      <div className="relative mt-auto pt-6">
        <div className="mb-2 flex items-baseline justify-between gap-3 text-xs">
          <span className="font-medium text-[#b5c4b8]">Mission progress</span>
          <span className="font-semibold tabular-nums text-[#e5eddd]">
            {safeProgress} <span className="font-normal text-[#84958b]">/ {safeTarget}</span>
          </span>
        </div>
        <div
          aria-label={`${title} progress`}
          aria-valuemax={safeTarget}
          aria-valuemin={0}
          aria-valuenow={safeProgress}
          className="h-2 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${isComplete ? "bg-[#d8f17e]" : "bg-gradient-to-r from-[#7eae6c] via-[#b6d867] to-[#d8f17e]"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {onAction && (
          <button
            type="button"
            disabled={isLocked}
            onClick={onAction}
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-[#edf5e5] transition-all duration-200 ease-out hover:border-[#b6d867]/40 hover:bg-[#b6d867]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8f17e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#12231d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLabel ?? defaultActionLabel}
            {!isLocked && <span aria-hidden="true" className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5">→</span>}
          </button>
        )}
      </div>
    </article>
  );
}

export default MissionCard;
