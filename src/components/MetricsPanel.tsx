"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export type MetricKey =
  | "biodiversity"
  | "waterQuality"
  | "pollination"
  | "overallHealth";

export type MetricTrend = "up" | "down" | "steady";

export type MetricStatus = "thriving" | "healthy" | "recovering" | "at-risk" | "critical";

export interface EcosystemMetric {
  /** Current value on a 0–100 scale. Values outside the range are clamped. */
  value: number;
  /** Change from the previous reading, also on a 0–100 scale. */
  delta?: number;
  trend?: MetricTrend;
  status?: MetricStatus;
  description?: string;
}

export type EcosystemMetrics = Record<MetricKey, EcosystemMetric>;

export interface MetricsPanelProps {
  metrics: EcosystemMetrics;
  title?: string;
  eyebrow?: string;
  className?: string;
  /** Renders the dashboard in a tighter layout for narrow side panels. */
  compact?: boolean;
  /** Optional live region text announced when the metrics change. */
  announcement?: ReactNode;
}

type MetricConfig = {
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
  softAccent: string;
  icon: ReactNode;
};

const METRIC_ORDER: MetricKey[] = [
  "biodiversity",
  "waterQuality",
  "pollination",
  "overallHealth",
];

const METRIC_CONFIG: Record<MetricKey, MetricConfig> = {
  biodiversity: {
    label: "Biodiversity",
    shortLabel: "Diversity",
    description: "Species richness",
    accent: "#b7ef8a",
    softAccent: "rgba(183, 239, 138, 0.14)",
    icon: <LeafIcon />,
  },
  waterQuality: {
    label: "Water quality",
    shortLabel: "Water",
    description: "Stream clarity",
    accent: "#82d8e8",
    softAccent: "rgba(130, 216, 232, 0.14)",
    icon: <WaterIcon />,
  },
  pollination: {
    label: "Pollination",
    shortLabel: "Pollination",
    description: "Floral activity",
    accent: "#f7ce78",
    softAccent: "rgba(247, 206, 120, 0.14)",
    icon: <FlowerIcon />,
  },
  overallHealth: {
    label: "Overall health",
    shortLabel: "Health",
    description: "Ecosystem balance",
    accent: "#d5b8ff",
    softAccent: "rgba(213, 184, 255, 0.14)",
    icon: <PulseIcon />,
  },
};

const DEFAULT_STATUS: MetricStatus = "healthy";

function clamp(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

function getStatusLabel(status: MetricStatus) {
  return status.replace("-", " ");
}

function getStatusTone(status: MetricStatus) {
  switch (status) {
    case "thriving":
      return "border-[#b7ef8a]/25 bg-[#b7ef8a]/10 text-[#c9f5aa]";
    case "recovering":
      return "border-[#82d8e8]/25 bg-[#82d8e8]/10 text-[#a7e6ef]";
    case "at-risk":
      return "border-[#f7ce78]/25 bg-[#f7ce78]/10 text-[#f9d991]";
    case "critical":
      return "border-[#ff8f8f]/25 bg-[#ff8f8f]/10 text-[#ffb0b0]";
    default:
      return "border-white/10 bg-white/[0.06] text-white/65";
  }
}

function getTrend(metric: EcosystemMetric): MetricTrend {
  if (metric.trend) return metric.trend;
  if (!metric.delta) return "steady";
  return metric.delta > 0 ? "up" : "down";
}

function formatDelta(delta = 0) {
  const rounded = Math.abs(delta).toFixed(1).replace(".0", "");
  return `${delta > 0 ? "+" : delta < 0 ? "−" : "±"}${rounded}`;
}

function TrendIcon({ trend }: { trend: MetricTrend }) {
  if (trend === "steady") {
    return (
      <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
      <path
        d={trend === "up" ? "M3 11 8 6l2.2 2.2L13 5" : "m3 5 5 5 2.2-2.2L13 11"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M19.7 4.3C13.2 4.1 7.7 6.1 5.3 10.2c-1.8 3.1-.5 6.7 2.7 7.5 4.4 1.1 8.7-3.4 9.6-8.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.8 20c1.6-4.5 4.3-7.4 9.3-10.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function WaterIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 3.8s-5.1 5.5-5.1 9.2A5.1 5.1 0 0 0 12 18a5.1 5.1 0 0 0 5.1-5c0-3.7-5.1-9.2-5.1-9.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.4 13.5a2.7 2.7 0 0 0 2.6 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FlowerIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 12.3v8.1M8.1 20.4h7.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 12.3c-3.2 1.1-5.4-.8-4.6-3.2.6-1.8 2.8-2.4 4.6-1.1.2-2.3 2.1-3.7 3.7-2.6 1.8 1.3 1 3.5-.7 4.7 2.3.1 3.6 2 2.5 3.7-1.2 1.8-3.6 1-4.7-1.5-1 2.5-3.2 3.2-4.5 1.7-1.2-1.5-.1-3.4 1.7-4.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="11.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M3.5 12h4l2.2-5.1 3.1 10.2 2.2-5.1h5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function animateMetricValues(
  from: Record<MetricKey, number>,
  to: Record<MetricKey, number>,
  onFrame: (values: Record<MetricKey, number>) => void,
  reducedMotion: boolean,
) {
  if (reducedMotion) {
    onFrame(to);
    return () => undefined;
  }

  let frame = 0;
  const start = performance.now();
  const duration = 680;
  const easeOut = (progress: number) => 1 - Math.pow(1 - progress, 3);

  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = easeOut(progress);
    const next = {} as Record<MetricKey, number>;

    for (const key of METRIC_ORDER) {
      next[key] = from[key] + (to[key] - from[key]) * eased;
    }

    onFrame(next);
    if (progress < 1) frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

export function MetricsPanel({
  metrics,
  title = "Ecosystem pulse",
  eyebrow = "Live habitat readout",
  className = "",
  compact = false,
  announcement,
}: MetricsPanelProps) {
  const panelId = useId();
  const normalizedMetrics = useMemo(() => {
    const next = {} as EcosystemMetrics;
    for (const key of METRIC_ORDER) {
      next[key] = {
        ...metrics[key],
        value: clamp(metrics[key]?.value ?? 0),
        delta: metrics[key]?.delta ?? 0,
        status: metrics[key]?.status ?? DEFAULT_STATUS,
      };
    }
    return next;
  }, [metrics]);

  const targetValues = useMemo(() => {
    const values = {} as Record<MetricKey, number>;
    for (const key of METRIC_ORDER) values[key] = normalizedMetrics[key].value;
    return values;
  }, [normalizedMetrics]);

  const [displayValues, setDisplayValues] = useState(targetValues);
  const previousValues = useRef(targetValues);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = animateMetricValues(
      previousValues.current,
      targetValues,
      setDisplayValues,
      mediaQuery.matches,
    );
    previousValues.current = targetValues;
    return stop;
  }, [targetValues]);

  const overall = normalizedMetrics.overallHealth;
  const panelClasses = compact
    ? "rounded-[1.75rem] p-4 sm:p-5"
    : "rounded-[2rem] p-5 sm:p-6";

  return (
    <section
      aria-labelledby={`${panelId}-title`}
      className={`relative overflow-hidden border border-white/10 bg-[#101b1b]/90 text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl ${panelClasses} ${className}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#8bd17c]/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-48 rounded-full bg-[#6bb8c0]/[0.06] blur-3xl" />

      <header className="relative flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#b7ef8a]/75">
            {eyebrow}
          </p>
          <h2 id={`${panelId}-title`} className="text-lg font-medium tracking-[-0.02em] text-white sm:text-xl">
            {title}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b7ef8a] opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#b7ef8a]" />
          </span>
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-white/55">Live</span>
        </div>
      </header>

      <div className="relative mt-5 flex items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/40">Overall health</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="tabular-nums text-4xl font-semibold tracking-[-0.06em] text-white sm:text-[2.75rem]">
              {Math.round(displayValues.overallHealth)}
            </span>
            <span className="text-sm text-white/35">/ 100</span>
          </div>
        </div>
        <span className={`mb-1 inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-medium capitalize ${getStatusTone(overall.status ?? DEFAULT_STATUS)}`}>
          {getStatusLabel(overall.status ?? DEFAULT_STATUS)}
        </span>
      </div>

      <div
        aria-label="Ecosystem metrics"
        className={`relative grid gap-3 pt-5 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
      >
        {METRIC_ORDER.map((key) => {
          const metric = normalizedMetrics[key];
          const config = METRIC_CONFIG[key];
          const trend = getTrend(metric);
          const value = displayValues[key];
          const deltaText = formatDelta(metric.delta);
          const trendTone = trend === "up" ? "text-[#b7ef8a]" : trend === "down" ? "text-[#ffb0a7]" : "text-white/45";
          const labelId = `${panelId}-${key}-label`;

          return (
            <article
              key={key}
              aria-labelledby={labelId}
              className={`group rounded-2xl border border-white/[0.09] bg-white/[0.035] p-3.5 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.055] ${key === "overallHealth" && !compact ? "sm:col-span-2" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: config.softAccent, color: config.accent } as CSSProperties}
                  >
                    {config.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 id={labelId} className="truncate text-sm font-medium text-white/85">
                      <span className="sm:hidden">{config.shortLabel}</span>
                      <span className="hidden sm:inline">{config.label}</span>
                    </h3>
                    <p className="mt-0.5 truncate text-[0.68rem] text-white/38">
                      {metric.description ?? config.description}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 text-xs font-medium tabular-nums">
                  <span className={trendTone}>
                    <span className="sr-only">{trend === "up" ? "Increasing" : trend === "down" ? "Decreasing" : "Holding steady"}: </span>
                    {deltaText}
                  </span>
                  <span className={trendTone}>
                    <TrendIcon trend={trend} />
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <span className="text-2xl font-semibold tracking-[-0.05em] text-white tabular-nums">
                  {Math.round(value)}
                  <span className="ml-1 text-xs font-normal tracking-normal text-white/35">%</span>
                </span>
                <span className={`mb-1 text-[0.62rem] font-medium capitalize ${trendTone}`}>
                  {getStatusLabel(metric.status ?? DEFAULT_STATUS)}
                </span>
              </div>

              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]"
                role="progressbar"
                aria-label={`${config.label} level`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(value)}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-150 ease-out motion-reduce:transition-none"
                  style={{ width: `${value}%`, backgroundColor: config.accent } as CSSProperties}
                />
              </div>
            </article>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement ?? `Overall ecosystem health is ${Math.round(displayValues.overallHealth)} out of 100, ${getStatusLabel(overall.status ?? DEFAULT_STATUS)}.`}
      </p>
    </section>
  );
}
