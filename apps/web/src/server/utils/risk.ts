/**
 * Risk scorer — pure, deterministic stub seam (ROADMAP Part C).
 *
 * Fabricated but clinically weighted: the worst finding drives urgency (triage
 * is dominated by the single most dangerous sign), scaled by model confidence.
 * Real models swap in behind this signature. Always recorded as `modelRef`
 * "stub-v0" upstream so nothing here is ever mistaken for a validated read.
 */

import type { RiskBand, Severity } from "@/lib/medical";

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 100,
  moderate: 55,
  normal: 6,
};

const bandFor = (value: number): RiskBand => {
  switch (true) {
    case value >= 80:
      return "critical";
    case value >= 65:
      return "high";
    case value >= 38:
      return "moderate";
    default:
      return "low";
  }
};

export const score = (
  findings: { severity: Severity; confidence: number }[],
): { value: number; band: RiskBand } => {
  if (findings.length === 0) return { value: 0, band: "low" };

  const value = Math.min(
    100,
    Math.round(
      Math.max(
        ...findings.map(
          (finding) =>
            SEVERITY_WEIGHT[finding.severity] *
            (0.6 + 0.4 * finding.confidence),
        ),
      ),
    ),
  );

  return { value, band: bandFor(value) };
};
