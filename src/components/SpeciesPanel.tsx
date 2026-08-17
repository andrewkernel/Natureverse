"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

export type SpeciesStatus = "thriving" | "healthy" | "stressed" | "degraded" | "critical" | string;

export interface SpeciesConnection {
  id?: string;
  name: string;
  detail?: string;
  icon?: ReactNode;
  status?: SpeciesStatus;
}

export interface SpeciesDetails {
  id?: string;
  name: string;
  scientificName?: string;
  category?: string;
  habitat?: string;
  icon?: ReactNode;
  accent?: "leaf" | "sky" | "amber" | "violet";
  role: string;
  roleDescription?: string;
  status: SpeciesStatus;
  health: number;
  population?: string | number;
  description: string;
  dependencies?: SpeciesConnection[];
  supports?: SpeciesConnection[];
}

export interface SpeciesPanelProps {
  species: SpeciesDetails | null;
  open?: boolean;
  onClose: () => void;
  onConnectionSelect?: (connection: SpeciesConnection) => void;
}

const accentStyles = {
  leaf: {
    icon: "bg-emerald-400/15 text-emerald-300 ring-emerald-300/20",
    glow: "from-emerald-400/20 via-emerald-400/5 to-transparent",
    bar: "bg-emerald-300",
  },
  sky: {
    icon: "bg-sky-400/15 text-sky-300 ring-sky-300/20",
    glow: "from-sky-400/20 via-sky-400/5 to-transparent",
    bar: "bg-sky-300",
  },
  amber: {
    icon: "bg-amber-300/15 text-amber-200 ring-amber-300/20",
    glow: "from-amber-300/20 via-amber-300/5 to-transparent",
    bar: "bg-amber-300",
  },
  violet: {
    icon: "bg-violet-300/15 text-violet-200 ring-violet-300/20",
    glow: "from-violet-300/20 via-violet-300/5 to-transparent",
    bar: "bg-violet-300",
  },
} as const;

const statusStyles: Record<string, { dot: string; text: string; label: string }> = {
  thriving: { dot: "bg-emerald-300", text: "text-emerald-200", label: "Thriving" },
  healthy: { dot: "bg-lime-300", text: "text-lime-200", label: "Healthy" },
  stressed: { dot: "bg-amber-300", text: "text-amber-200", label: "Stressed" },
  degraded: { dot: "bg-orange-300", text: "text-orange-200", label: "Degraded" },
  critical: { dot: "bg-rose-300", text: "text-rose-200", label: "Critical" },
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 14 14 6M7 6h7v7" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.8 4.2C12.7 4.5 6.4 6.2 4.7 11c-1.2 3.3 1.5 6.5 4.8 5.4 4.8-1.7 7.1-6.2 7.7-10.2" />
      <path strokeLinecap="round" d="M4.8 19.4c2.2-3.1 5-5.6 8.7-7.7" />
    </svg>
  );
}

function ConnectionList({
  items,
  kind,
  onSelect,
}: {
  items: SpeciesConnection[];
  kind: "depends" | "supports";
  onSelect?: (connection: SpeciesConnection) => void;
}) {
  const isDependency = kind === "depends";

  return (
    <div className="space-y-2">
      {items.length > 0 ? (
        items.map((connection) => {
          const content = (
            <>
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${isDependency ? "bg-sky-400/10 text-sky-200" : "bg-emerald-400/10 text-emerald-200"}`}>
                {connection.icon ?? (isDependency ? <span className="text-sm">←</span> : <span className="text-sm">→</span>)}
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-medium text-white/90">{connection.name}</span>
                {connection.detail && <span className="mt-0.5 block truncate text-xs text-white/45">{connection.detail}</span>}
              </span>
              {connection.status && (
                <span className={`hidden rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] sm:block ${statusStyles[connection.status.toLowerCase()]?.text ?? "text-white/50"}`}>
                  {statusStyles[connection.status.toLowerCase()]?.label ?? connection.status}
                </span>
              )}
              {onSelect && <ArrowUpRightIcon />}
            </>
          );

          return onSelect ? (
            <button
              type="button"
              key={connection.id ?? connection.name}
              onClick={() => onSelect(connection)}
              className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-2.5 text-left transition hover:border-white/15 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80"
              aria-label={`Explore connection to ${connection.name}`}
            >
              {content}
            </button>
          ) : (
            <div key={connection.id ?? connection.name} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-2.5">
              {content}
            </div>
          );
        })
      ) : (
        <p className="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-white/40">No connected species recorded yet.</p>
      )}
    </div>
  );
}

export function SpeciesPanel({ species, open = true, onClose, onConnectionSelect }: SpeciesPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open || !species) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open, species]);

  if (!open || !species) return null;

  const accent = accentStyles[species.accent ?? "leaf"] ?? accentStyles.leaf;
  const safeHealth = Math.max(0, Math.min(100, species.health));
  const status = statusStyles[species.status.toLowerCase()] ?? {
    dot: "bg-white/50",
    text: "text-white/70",
    label: species.status,
  };

  return (
    <div role="presentation" className="fixed inset-0 z-50 flex justify-end bg-slate-950/55 p-3 backdrop-blur-[3px] sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative flex h-full w-full max-w-[440px] flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-[#102119]/95 text-white shadow-[0_24px_100px_rgba(0,0,0,0.48)] ring-1 ring-black/20"
      >
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b ${accent.glow}`} />
        <div className="relative flex items-center justify-between px-5 pb-3 pt-5 sm:px-7 sm:pt-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">Selected species</p>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/65 transition hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80"
            aria-label="Close species details"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7">
          <div className="flex items-start gap-4">
            <div className={`flex size-16 shrink-0 items-center justify-center rounded-[1.35rem] ring-1 ${accent.icon}`}>
              {species.icon ?? <LeafIcon />}
            </div>
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h2 id={titleId} className="text-2xl font-semibold tracking-[-0.04em] text-white">{species.name}</h2>
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">
                  <span className={`size-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              {species.scientificName && <p className="mt-1 text-sm italic text-white/45">{species.scientificName}</p>}
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-white/55">
                {species.category && <span className="rounded-lg bg-white/[0.07] px-2.5 py-1">{species.category}</span>}
                {species.habitat && <span className="rounded-lg bg-white/[0.07] px-2.5 py-1">{species.habitat}</span>}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Population health</p>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-white">{Math.round(safeHealth)}<span className="ml-1 text-base font-medium text-white/40">/ 100</span></p>
              </div>
              {species.population !== undefined && (
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Observed population</p>
                  <p className="mt-1 text-sm font-semibold text-white/80">{species.population}</p>
                </div>
              )}
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={`${species.name} population health`} aria-valuenow={Math.round(safeHealth)} aria-valuemin={0} aria-valuemax={100}>
              <div className={`h-full rounded-full ${accent.bar} transition-[width] duration-700 ease-out`} style={{ width: `${safeHealth}%` }} />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">About this species</p>
            <p id={descriptionId} className="text-sm leading-6 text-white/65">{species.description}</p>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-200"><LeafIcon /></span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/65">Ecological role</p>
                <p className="mt-1 text-base font-semibold text-white">{species.role}</p>
                {species.roleDescription && <p className="mt-1.5 text-sm leading-5 text-white/60">{species.roleDescription}</p>}
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2 sm:gap-4">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-sky-200">←</span>
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">Depends on</h3>
              </div>
              <ConnectionList items={species.dependencies ?? []} kind="depends" onSelect={onConnectionSelect} />
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">Supports</h3>
                <span className="text-sm text-emerald-200">→</span>
              </div>
              <ConnectionList items={species.supports ?? []} kind="supports" onSelect={onConnectionSelect} />
            </div>
          </div>
        </div>
        <div className="relative border-t border-white/10 bg-black/10 px-5 py-4 sm:px-7">
          <p className="flex items-center gap-2 text-xs text-white/40"><span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" /> Live from the current ecosystem simulation</p>
        </div>
      </section>
    </div>
  );
}

export default SpeciesPanel;
