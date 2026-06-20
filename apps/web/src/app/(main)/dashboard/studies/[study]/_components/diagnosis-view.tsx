"use client";

import { cn } from "@zenncore/utils";
import { Button } from "@zenncore/web/components/button";
import type { ReactNode } from "react";
import { CalendarIcon, SpecialtyIcon } from "@/components/medical-icons";
import { SeverityBadge } from "@/components/severity";
import { deriveAppointments, modalityLabel } from "@/lib/medical";
import type * as Study from "@/server/app/study";
import type { Analysis, Finding } from "@/server/database/schema";
import { useActive } from "./viewer-context";

const Card = ({ children, delay }: { children: ReactNode; delay: number }) => (
  <section
    className="flex animate-fade-up flex-col rounded-card border border-accent bg-card/70 p-2 shadow-card"
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </section>
);

const CardTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="px-3 py-2 font-semibold text-foreground">{children}</h2>
);

/**
 * Right panel — the patient-centred 3-section IA (DESIGN.md §12.1):
 * Conclusions (the verdict) → Suggested appointments (the action) → Detailed
 * diagnosis (the evidence). Each detailed row is a hover target that syncs the
 * matching overlay via shared `finding.id` state.
 */
export const DiagnosisView = ({
  study,
  analysis,
  findings,
}: {
  study: Study.View;
  analysis: Analysis | null;
  findings: Finding[];
}) => {
  const [active, setActive] = useActive();
  const appointments = deriveAppointments(findings);

  if (!analysis)
    return (
      <Card delay={0}>
        <CardTitle>Analiza në vazhdim</CardTitle>
        <p className="px-3 pb-4 text-foreground-dimmed text-sm">
          AI po e lexon këtë studim. Gjetjet dhe konkluzionet do të shfaqen këtu
          sapo të përfundojë analiza.
        </p>
      </Card>
    );

  return (
    <div className="flex flex-col gap-4">
      <Card delay={0}>
        <CardTitle>
          {modalityLabel(study.modality)} {study.bodyPart} — Konkluzione
        </CardTitle>
        <ul className="flex flex-col gap-2 px-3 pb-3">
          {analysis.summary.map((line) => (
            <li
              key={line}
              className="flex gap-2 text-foreground text-sm leading-relaxed"
            >
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {line}
            </li>
          ))}
        </ul>
      </Card>

      {appointments.length > 0 && (
        <Card delay={100}>
          <CardTitle>Vizitat e sugjeruara</CardTitle>
          <div className="flex flex-col">
            {appointments.map((appointment) => (
              <div
                key={appointment.specialty}
                className="flex items-center gap-3 px-3 py-3"
              >
                <div className="relative shrink-0">
                  <div className="flex size-10 items-center justify-center rounded-icon bg-accent">
                    <SpecialtyIcon
                      specialty={appointment.specialty}
                      className="size-6 text-primary"
                    />
                  </div>
                  <SeverityBadge
                    severity={appointment.severity}
                    className="absolute -top-1 -right-1 size-5 ring-2 ring-card"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm">
                    {appointment.specialty}
                  </p>
                  <p className="text-foreground-dimmed text-xs">
                    {appointment.status}
                  </p>
                  <p className="text-warning text-xs">
                    Arsyeja: {appointment.reason}
                  </p>
                </div>
                <Button variant="soft" color="primary">
                  <CalendarIcon className="size-4" />
                  Cakto
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card delay={200}>
        <CardTitle>Diagnoza e detajuar</CardTitle>
        <div className="flex flex-col">
          {findings.map((finding, index) => {
            const isActive = active === finding.id;
            return (
              // biome-ignore lint/a11y/noStaticElementInteractions: hover sync mirrors the overlay; not a control
              <div
                key={finding.id}
                onMouseEnter={() => setActive(finding.id)}
                onMouseLeave={() => setActive(null)}
                className={cn(
                  "flex flex-col gap-1 rounded-row border-transparent border-l-2 px-3 py-3 transition-colors",
                  isActive && "border-l-primary bg-card-hover",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-foreground text-sm">
                    {index + 1}. {finding.region}
                  </p>
                  <SeverityBadge severity={finding.severity} />
                </div>
                <p className="text-foreground-dimmed text-sm leading-relaxed">
                  {finding.description}
                </p>
                <p className="text-xs">
                  <span className="text-caption">Gjetja: </span>
                  <span className="text-link underline decoration-link/40 underline-offset-2">
                    {finding.label}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
