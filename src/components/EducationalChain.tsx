"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

export interface CauseEffectStep {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  metric?: string;
  tone?: "amber" | "sky" | "rose" | "emerald" | "violet";
}

export interface ChainOutcome {
  label: string;
  value?: string;
  description: string;
}

export interface EducationalChainProps {
  chain: CauseEffectStep[];
  outcome?: ChainOutcome;
  open?: boolean;
  onClose: () => void;
  onStepSelect?: (step: CauseEffectStep, index: number) => void;
  activeIndex?: number;
  title?: string;
  subtitle?: string;
}

const toneStyles = {
  amber: { icon: "bg-amber-300/15 text-amber-200 ring-amber-300/20", line: "bg-amber-300/50", label: "text-amber-200" },
  sky: { icon: "bg-sky-300/15 text-sky-200 ring-sky-300/20", line: "bg-sky-300/50", label: "text-sky-200" },
  rose: { icon: "bg-rose-300/15 text-rose-200 ring-rose-300/20", line: "bg-rose-300/50", label: "text-rose-200" },
  emerald: { icon: "bg-emerald-300/15 text-emerald-200 ring-emerald-300/20", line: "bg-emerald-300/50", label: "text-emerald-200" },
  violet: { icon: "bg-violet-300/15 text-violet-200 ring-violet-300/20", line: "bg-violet-300/50", label: "text-violet-200" },
} as const;

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3ZM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h13m-5-5 5 5-5 5" />
    </svg>
  );
}

export function EducationalChain({
  chain,
  outcome,
  open = true,
  onClose,
  onStepSelect,
  activeIndex,
  title = "The ripple effect",
  subtitle = "Every change travels through the ecosystem.",
}: EducationalChainProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div role="presentation" className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/50 p-3 backdrop-blur-[2px] sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/15 bg-[#12251f]/95 text-white shadow-[0_24px_100px_rgba(0,0,0,0.52)] ring-1 ring-black/20 sm:max-h-[calc(100vh-3rem)]"
      >
        <div className="pointer-events-none absolute -left-24 -top-36 size-96 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative flex items-start justify-between gap-5 border-b border-white/10 px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200 ring-1 ring-emerald-300/20"><SparkIcon /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200/60">Ecology, in context</p>
              <h2 id={titleId} className="mt-1 text-xl font-semibold tracking-[-0.035em] sm:text-2xl">{title}</h2>
              <p id={descriptionId} className="mt-1 text-sm text-white/50">{subtitle}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/65 transition hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80"
            aria-label="Close cause and effect explanation"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">A living chain reaction</p>
            <p className="text-xs text-white/35"><span className="text-emerald-200">{chain.length}</span> connected moments</p>
          </div>

          {chain.length > 0 ? (
            <ol className="grid gap-3 lg:grid-cols-[repeat(5,minmax(0,1fr))]">
              {chain.map((step, index) => {
                const tone = toneStyles[step.tone ?? "emerald"];
                const isActive = activeIndex === index;
                const card = (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <span className={`flex size-11 items-center justify-center rounded-2xl ring-1 ${tone.icon}`}>
                        {step.icon ?? <span className="text-sm font-semibold">{index + 1}</span>}
                      </span>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${isActive ? `${tone.label} bg-white/[0.08]` : "text-white/35"}`}>
                        {index === 0 ? "Cause" : index === chain.length - 1 ? "Effect" : `Step ${index + 1}`}
                      </span>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold leading-5 text-white/90">{step.label}</h3>
                    {step.description && <p className="mt-2 text-xs leading-5 text-white/50">{step.description}</p>}
                    {step.metric && <p className={`mt-4 text-xs font-semibold ${tone.label}`}>{step.metric}</p>}
                  </>
                );

                return (
                  <li key={step.id} className="relative flex items-stretch lg:min-w-0">
                    {onStepSelect ? (
                      <button
                        type="button"
                        onClick={() => onStepSelect(step, index)}
                        aria-current={isActive ? "step" : undefined}
                        className={`w-full rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 ${isActive ? "border-emerald-300/35 bg-emerald-300/[0.09] shadow-[0_10px_35px_rgba(52,211,153,0.08)]" : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]"}`}
                      >
                        {card}
                      </button>
                    ) : (
                      <div className={`w-full rounded-2xl border p-4 ${isActive ? "border-emerald-300/35 bg-emerald-300/[0.09]" : "border-white/10 bg-white/[0.035]"}`}>{card}</div>
                    )}
                    {index < chain.length - 1 && (
                      <span className={`absolute -bottom-4 left-1/2 z-10 flex size-7 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#173028] text-white/45 lg:-right-5 lg:bottom-auto lg:left-auto lg:top-1/2 lg:translate-x-1/2 lg:-translate-y-1/2 ${tone.line}`} aria-hidden="true"><ArrowIcon /></span>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-white/45">No cause-and-effect steps are available for this change yet.</p>
          )}

          {outcome && (
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-emerald-300/20 bg-gradient-to-r from-emerald-300/[0.11] to-sky-300/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-200"><SparkIcon /></span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/65">What this means</p>
                  <p className="mt-1 text-sm font-semibold text-white/90">{outcome.label}</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">{outcome.description}</p>
                </div>
              </div>
              {outcome.value && <p className="shrink-0 pl-12 text-2xl font-semibold tracking-[-0.05em] text-emerald-200 sm:pl-0">{outcome.value}</p>}
            </div>
          )}
        </div>
        <div className="relative border-t border-white/10 px-5 py-4 sm:px-8">
          <p className="text-center text-xs text-white/35">Healthy ecosystems are networks, not collections of isolated parts.</p>
        </div>
      </section>
    </div>
  );
}

export default EducationalChain;
