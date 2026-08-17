import type { BiomeConfig } from "../types/biome";
import type { SimulationControls } from "../types/ecosystem";

export type ConditionsControlKey = "drought" | "pollution" | "habitatLoss";

export type ConditionsPanelProps = {
  biome: BiomeConfig;
  controls: SimulationControls;
  onControlChange: (control: ConditionsControlKey, value: number) => void;
  onReset: () => void;
  className?: string;
};

type RangeControlProps = {
  id: string;
  label: string;
  description: string;
  value: number;
  output: string;
  onChange: (value: number) => void;
};

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

function RangeControl({ id, label, description, value, output, onChange }: RangeControlProps) {
  const safeValue = clamp(value);
  const descriptionId = `${id}-description`;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <label htmlFor={id} className="text-sm font-medium text-slate-100">
            {label}
          </label>
          <p id={descriptionId} className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>
        </div>
        <output htmlFor={id} className="shrink-0 text-sm tabular-nums text-slate-200" aria-live="polite">
          {output}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min="0"
        max="100"
        step="1"
        value={safeValue}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-describedby={descriptionId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
        className="h-2 w-full cursor-pointer accent-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      />
    </div>
  );
}

export function ConditionsPanel({ biome, controls, onControlChange, onReset, className = "" }: ConditionsPanelProps) {
  const rainfall = 100 - clamp(controls.drought);
  const waterQuality = 100 - clamp(controls.pollution);
  const habitatCover = 100 - clamp(controls.habitatLoss);

  return (
    <section
      className={`w-full max-w-sm border border-white/10 bg-slate-950 px-5 py-5 text-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.18)] ${className}`}
      aria-labelledby="conditions-panel-title"
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 id="conditions-panel-title" className="text-base font-semibold text-white">
            Environmental conditions
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {biome.name} · {biome.location}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 border border-white/15 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5 py-5" aria-label="Manual environmental controls">
        <RangeControl
          id="conditions-rainfall"
          label="Rainfall"
          description="Higher rainfall lowers drought stress"
          value={rainfall}
          output={`${rainfall}%`}
          onChange={(value) => onControlChange("drought", 100 - value)}
        />
        <RangeControl
          id="conditions-water-quality"
          label="Water quality"
          description="Higher quality lowers pollution pressure"
          value={waterQuality}
          output={`${waterQuality}%`}
          onChange={(value) => onControlChange("pollution", 100 - value)}
        />
        <RangeControl
          id="conditions-habitat-cover"
          label="Habitat cover"
          description="Higher cover lowers habitat loss"
          value={habitatCover}
          output={`${habitatCover}%`}
          onChange={(value) => onControlChange("habitatLoss", 100 - value)}
        />
      </div>

      <dl className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-xs">
        <div>
          <dt className="text-slate-500">Drought stress</dt>
          <dd className="mt-1 text-sm tabular-nums text-slate-200">{100 - rainfall}%</dd>
        </div>
        <div>
          <dt className="text-slate-500">Pollution</dt>
          <dd className="mt-1 text-sm tabular-nums text-slate-200">{100 - waterQuality}%</dd>
        </div>
        <div>
          <dt className="text-slate-500">Habitat loss</dt>
          <dd className="mt-1 text-sm tabular-nums text-slate-200">{100 - habitatCover}%</dd>
        </div>
      </dl>
    </section>
  );
}

export default ConditionsPanel;
