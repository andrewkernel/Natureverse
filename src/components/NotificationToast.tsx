"use client";

import type { ReactNode } from "react";

export type NotificationImpact = "positive" | "negative" | "neutral";

export interface NotificationToastProps {
  cause: ReactNode;
  effect: ReactNode;
  impact?: NotificationImpact;
  visible?: boolean;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const impactStyles: Record<NotificationImpact, { labelClass: string; icon: string; label: string }> = {
  positive: { labelClass: "text-[#d7f184]", icon: "bg-[#c8e97b]/15 text-[#d8f17e]", label: "Positive ecosystem change" },
  negative: { labelClass: "text-[#ffc2a5]", icon: "bg-[#f0a77f]/15 text-[#ffb89a]", label: "Ecosystem warning" },
  neutral: { labelClass: "text-[#c9e3d8]", icon: "bg-[#a5c9bd]/15 text-[#c9e3d8]", label: "Ecosystem update" },
};

function ImpactIcon({ impact }: { impact: NotificationImpact }) {
  if (impact === "positive") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21V10" />
        <path d="M12 14c-3.8 0-6-2-6-5.5C9.7 8.5 12 10 12 14Z" />
        <path d="M12 11c0-3.6 2.3-5.8 6-6.5C18 8.1 15.9 11 12 11Z" />
      </svg>
    );
  }

  if (impact === "negative") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v4" />
        <path d="M12 17.2v.1" />
        <path d="m10.3 4.2-7.5 13a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13a2 2 0 0 0-3.4 0Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 10.5v5" />
      <path d="M12 7.8v.1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  );
}

export function NotificationToast({
  cause,
  effect,
  impact = "neutral",
  visible = true,
  onDismiss,
  actionLabel,
  onAction,
  className = "",
}: NotificationToastProps) {
  const styles = impactStyles[impact];

  return (
    <div
      aria-atomic="true"
      aria-hidden={!visible}
      aria-live={impact === "negative" ? "assertive" : "polite"}
      className={`pointer-events-none w-full max-w-sm transition-all duration-300 ease-out ${visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"} ${className}`}
      role={impact === "negative" ? "alert" : "status"}
    >
      <div className="pointer-events-auto overflow-hidden rounded-2xl border border-white/10 bg-[#13241f]/95 p-4 text-[#edf5e5] shadow-[0_20px_60px_-24px_rgba(6,24,17,0.9)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
            <ImpactIcon impact={impact} />
          </div>

          <div className="min-w-0 flex-1">
            <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${styles.labelClass}`}>
              {styles.label}
            </p>
            <p className="mt-1.5 text-sm leading-5 text-[#c4d1c7]">
              <span className="font-semibold text-white">{cause}</span>{" "}
              <span className="text-[#a9bbb0]">→</span>{" "}
              {effect}
            </p>
          </div>

          {onDismiss && (
            <button
              aria-label="Dismiss notification"
              type="button"
              onClick={onDismiss}
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8fa297] transition-colors duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8f17e]"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {onAction && actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="mt-3 ml-12 inline-flex min-h-8 items-center rounded-lg px-2.5 text-xs font-semibold text-[#d8f17e] transition-colors duration-200 hover:bg-[#b6d867]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8f17e]"
          >
            {actionLabel}
            <span aria-hidden="true" className="ml-1.5">↗</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default NotificationToast;
