/**
 * Severity / risk / status atoms — the redundant color + shape + icon encoding
 * (DESIGN.md §2.4, §6.4, §11). Pure presentational, safe in both server and
 * client trees. The shape glyph (diamond / triangle / circle-check) is what keeps
 * the encoding legible for colorblind users.
 */

import { cn } from "@zenncore/utils";
import { Meter } from "@zenncore/web/components/meter";
import type { JSX } from "react";
import {
  type RiskBand,
  riskBandSeverity,
  riskBandToken,
  type Severity,
  type StudyStatus,
  severityLabel,
  severityToken,
  studyStatusLabel,
} from "@/lib/medical";

type Tone = "error" | "warning" | "success";

const TONE: Record<Tone, { text: string; chip: string; fill: string }> = {
  error: {
    text: "text-error",
    chip: "bg-error/15 text-error",
    fill: "bg-error",
  },
  warning: {
    text: "text-warning",
    chip: "bg-warning/15 text-warning",
    fill: "bg-warning",
  },
  success: {
    text: "text-success",
    chip: "bg-success/15 text-success",
    fill: "bg-success",
  },
};

/** The bare severity shape: diamond (critical), triangle (moderate), circle+check (normal). */
export const SeverityShape = ({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}): JSX.Element => {
  switch (severity) {
    case "critical":
      return (
        <svg
          viewBox="0 0 16 16"
          className={className}
          aria-hidden
          fill="currentColor"
        >
          <path d="M8 0.8 15.2 8 8 15.2 0.8 8Z" />
        </svg>
      );
    case "moderate":
      return (
        <svg
          viewBox="0 0 16 16"
          className={className}
          aria-hidden
          fill="currentColor"
        >
          <path d="M8 1.6 15 14H1Z" />
        </svg>
      );
    case "normal":
      return (
        <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none">
          <circle cx="8" cy="8" r="7.2" fill="currentColor" />
          <path
            d="M4.8 8.4 7 10.6 11.2 5.8"
            className="stroke-background"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
};

/** Rounded badge holding the severity shape — the diagnosis-row / thumbnail badge. */
export const SeverityBadge = ({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}): JSX.Element => (
  <span
    title={severityLabel(severity)}
    className={cn(
      "inline-flex size-6 shrink-0 items-center justify-center rounded-full",
      TONE[severityToken(severity)].chip,
      className,
    )}
  >
    <SeverityShape severity={severity} className="size-4" />
  </span>
);

/** Worklist risk chip — band shape + numeric value. */
export const RiskChip = ({
  band,
  value,
  className,
}: {
  band: RiskBand;
  value?: number | null;
  className?: string;
}): JSX.Element => (
  <span
    className={cn(
      "inline-flex items-center gap-2 rounded-pill px-2 py-1 font-medium text-xs capitalize",
      TONE[riskBandToken(band)].chip,
      className,
    )}
  >
    <SeverityShape severity={riskBandSeverity(band)} className="size-4" />
    {value != null ? value : band}
  </span>
);

const STATUS_TONE: Record<StudyStatus, { chip: string; dot: string }> = {
  queued: {
    chip: "bg-accent text-foreground-dimmed",
    dot: "bg-foreground-dimmed",
  },
  analyzing: {
    chip: "bg-info/15 text-info-rich",
    dot: "bg-info animate-pulse",
  },
  analyzed: { chip: "bg-primary/15 text-primary-rich", dot: "bg-primary" },
  reported: { chip: "bg-success/15 text-success", dot: "bg-success" },
  archived: {
    chip: "bg-accent-dimmed text-foreground-dimmed",
    dot: "bg-neutral",
  },
};

/** Study lifecycle pill — desaturated chrome (DESIGN-adjacent B2B pattern). */
export const StatusPill = ({
  status,
  className,
}: {
  status: StudyStatus;
  className?: string;
}): JSX.Element => (
  <span
    className={cn(
      "inline-flex items-center gap-2 rounded-pill px-2 py-1 font-medium text-xs",
      STATUS_TONE[status].chip,
      className,
    )}
  >
    <span className={cn("size-2 rounded-full", STATUS_TONE[status].dot)} />
    {studyStatusLabel(status)}
  </span>
);

/** Small linear risk gauge — band drives the fill color (DESIGN-adjacent). */
export const RiskGauge = ({
  value,
  band,
  className,
}: {
  value: number;
  band: RiskBand;
  className?: string;
}): JSX.Element => (
  <Meter
    value={value}
    className={cn("w-full", className)}
    classList={{
      track: "h-2 rounded-pill bg-accent",
      indicator: cn("rounded-pill", TONE[riskBandToken(band)].fill),
    }}
  />
);
