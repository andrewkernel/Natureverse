import type { ReactNode } from "react";

export interface ScenarioPanelProps {
  pollution: number;
  drought: number;
  habitatLoss: number;
  invasiveSpecies: boolean;
  onPollutionChange: (value: number) => void;
  onDroughtChange: (value: number) => void;
  onHabitatLossChange: (value: number) => void;
  onInvasiveSpeciesChange: (enabled: boolean) => void;
  onRestore: () => void;
  onReset: () => void;
  isRestoring?: boolean;
  restorationDisabled?: boolean;
  restorationLabel?: string;
  restorationProgressLabel?: string;
  restorationHelp?: string;
  labels?: Partial<{
    pollution: string;
    drought: string;
    habitatLoss: string;
    invasiveSpecies: string;
  }>;
  className?: string;
}

type SliderControlProps = {
  id: string;
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  icon: ReactNode;
  accent: string;
};

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const getPressureLabel = (value: number) => {
  if (value === 0) return "None";
  if (value < 35) return "Low";
  if (value < 70) return "Moderate";
  return "High";
};

function SliderControl({
  id,
  label,
  description,
  value,
  onChange,
  icon,
  accent,
}: SliderControlProps) {
  const safeValue = clamp(value);
  const valueLabel = getPressureLabel(safeValue);
  const descriptionId = `${id}-description`;

  return (
    <div className="group rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-4 transition-colors hover:border-white/15 hover:bg-white/[0.065]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] ${accent}`}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <label
              htmlFor={id}
              className="block cursor-pointer text-sm font-semibold tracking-[-0.01em] text-white"
            >
              {label}
            </label>
            <p id={descriptionId} className="mt-1 text-xs leading-5 text-slate-400">
              {description}
            </p>
          </div>
        </div>
        <output
          htmlFor={id}
          aria-live="polite"
          className="shrink-0 rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1 text-right text-xs font-semibold tabular-nums text-slate-200"
        >
          <span className="text-white">{safeValue}%</span>
          <span className="ml-1.5 text-slate-500">{valueLabel}</span>
        </output>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span aria-hidden="true" className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-600">
          0
        </span>
        <input
          id={id}
          type="range"
          min="0"
          max="100"
          step="1"
          value={safeValue}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={label}
          aria-describedby={descriptionId}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={safeValue}
          aria-valuetext={`${safeValue} percent, ${valueLabel.toLowerCase()} pressure`}
          className={`h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-slate-700/80 accent-current ${accent} focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
        />
        <span aria-hidden="true" className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-600">
          100
        </span>
      </div>
    </div>
  );
}

export function ScenarioPanel({
  pollution,
  drought,
  habitatLoss,
  invasiveSpecies,
  onPollutionChange,
  onDroughtChange,
  onHabitatLossChange,
  onInvasiveSpeciesChange,
  onRestore,
  onReset,
  isRestoring = false,
  restorationDisabled = false,
  restorationLabel = "Restore ecosystem",
  restorationProgressLabel = "Restoring ecosystem…",
  restorationHelp = "Restoration happens gradually, just like it does in nature.",
  labels,
  className = "",
}: ScenarioPanelProps) {
  const restoreDisabled = restorationDisabled || isRestoring;

  return (
    <aside
      aria-labelledby="scenario-panel-title"
      className={`w-full max-w-[25rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/85 text-slate-100 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl ${className}`}
    >
      <div className="border-b border-white/8 px-5 pb-5 pt-5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/12 text-emerald-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a8.5 8.5 0 0 0 8.5-8.5C20.5 7.25 17 3.5 12 3.5S3.5 7.25 3.5 12.5A8.5 8.5 0 0 0 12 21Z" />
                <path strokeLinecap="round" d="M12 3.5V21M3.8 12h16.4M5.8 6.5c1.7 1.1 3.9 1.8 6.2 1.8s4.5-.7 6.2-1.8M5.8 17.5c1.7-1.1 3.9-1.8 6.2-1.8s4.5.7 6.2 1.8" />
              </svg>
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">Live simulation</p>
              <h2 id="scenario-panel-title" className="mt-1 text-lg font-semibold tracking-[-0.03em] text-white">
                Change the ecosystem
              </h2>
            </div>
          </div>
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.85)]" aria-label="Simulation active" role="status" />
        </div>
        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
          Adjust environmental pressures and watch the living web respond in real time.
        </p>
      </div>

      <form
        onSubmit={(event) => event.preventDefault()}
        className="space-y-3 px-5 py-5 sm:px-6"
        aria-describedby="scenario-panel-help"
      >
        <p id="scenario-panel-help" className="sr-only">
          Use the sliders with your keyboard or touch device. Changes are reflected in the ecosystem immediately.
        </p>

        <SliderControl
          id="pollution"
          label={labels?.pollution ?? "Pollution"}
          description="Water and air quality pressure"
          value={pollution}
          onChange={onPollutionChange}
          accent="text-amber-300"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 18.5h8.5a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 7.1 9.6 3.5 3.5 0 0 0 8 18.5Z" />
              <path strokeLinecap="round" d="M7 6.5h.01M11 4.5h.01M15 6h.01" />
            </svg>
          }
        />

        <SliderControl
          id="drought"
          label={labels?.drought ?? "Drought severity"}
          description="Water scarcity and heat stress"
          value={drought}
          onChange={onDroughtChange}
          accent="text-orange-300"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <circle cx="12" cy="12" r="3.2" />
              <path strokeLinecap="round" d="M12 2.5v2M12 19.5v2M4.58 4.58l1.42 1.42M18 18l1.42 1.42M2.5 12h2M19.5 12h2M4.58 19.42 6 18M18 6l1.42-1.42" />
            </svg>
          }
        />

        <SliderControl
          id="habitat-loss"
          label={labels?.habitatLoss ?? "Habitat loss"}
          description="Shrinking space for native species"
          value={habitatLoss}
          onChange={onHabitatLossChange}
          accent="text-rose-300"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 20 5.5-9L14 15l2.1-3.5L19 20H5Z" />
              <path strokeLinecap="round" d="M12 11V4m0 0L9.5 6.5M12 4l2.5 2.5" />
            </svg>
          }
        />

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-4 transition-colors hover:border-white/15 hover:bg-white/[0.065]">
          <div className="flex min-w-0 items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-violet-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.5c5 0 8-3 8-7.5 0-3.9-3.1-7.5-8-10-4.9 2.5-8 6.1-8 10 0 4.5 3 7.5 8 7.5Z" />
                <path strokeLinecap="round" d="M12 20V9m0 0L8.5 12M12 9l3.5 3" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-[-0.01em] text-white">{labels?.invasiveSpecies ?? "Invasive species"}</p>
              <p id="invasive-species-description" className="mt-1 text-xs leading-5 text-slate-400">
                Introduce competition for native species
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={invasiveSpecies}
            aria-describedby="invasive-species-description"
            aria-label="Toggle invasive species"
            onClick={() => onInvasiveSpeciesChange(!invasiveSpecies)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              invasiveSpecies ? "border-violet-300/50 bg-violet-400/80" : "border-white/15 bg-slate-800"
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${invasiveSpecies ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>
      </form>

      <div className="border-t border-white/8 bg-slate-900/45 px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onRestore}
          disabled={restoreDisabled}
          aria-busy={isRestoring}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
        >
          {isRestoring ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" aria-hidden="true">
              <circle cx="12" cy="12" r="8.5" className="opacity-25" stroke="currentColor" strokeWidth="3" />
              <path d="M20.5 12a8.5 8.5 0 0 0-8.5-8.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8 8 0 1 0 1 4M20 5v6h-6" />
            </svg>
          )}
          {isRestoring ? restorationProgressLabel : restorationLabel}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="mt-3 flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          Reset simulation
        </button>
        <p className="mt-3 text-center text-[11px] leading-5 text-slate-500">
          {restorationHelp}
        </p>
      </div>
    </aside>
  );
}

export default ScenarioPanel;
