import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatDate, initials, modalityLabel } from "@/lib/medical";
import type * as Study from "@/server/app/study";
import { RiskChip, StatusPill } from "./severity";

/** Compact study row — patient + study summary, risk/status chip, links to viewer. */
export const StudyListRow = ({ study }: { study: Study.View }) => (
  <Link
    href={`/dashboard/studies/${study.id}` as Route}
    className="group flex items-center gap-2 rounded-row border-transparent border-l-2 px-3 py-3 transition-colors hover:border-l-primary hover:bg-card-hover"
  >
    <span className="flex size-8 shrink-0 items-center justify-center rounded-icon bg-accent font-semibold text-foreground-dimmed text-xs">
      {initials(study.patient.name)}
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate font-medium text-foreground text-sm">
        {study.patient.name}
      </p>
      <p className="truncate text-caption text-xs">
        {study.patient.mrn} · {modalityLabel(study.modality)} {study.bodyPart} ·{" "}
        {formatDate(study.studyDate)}
      </p>
    </div>
    {study.riskBand != null ? (
      <RiskChip band={study.riskBand} value={study.riskValue} />
    ) : (
      <StatusPill status={study.status} />
    )}
  </Link>
);

export const StudyRowEmpty = ({ children }: { children: ReactNode }) => (
  <p className="px-3 py-10 text-center text-foreground-dimmed text-sm">
    {children}
  </p>
);
