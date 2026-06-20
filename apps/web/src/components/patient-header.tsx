import { cn } from "@zenncore/utils";
import type { ReactNode } from "react";
import { age, formatDate, sexLabel } from "@/lib/medical";
import type * as Patient from "@/server/app/patient";

const Chip = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "rounded-pill bg-accent/60 px-2 py-0.5 text-caption text-xs",
      className,
    )}
  >
    {children}
  </span>
);

/** Patient identity strip — name / MRN / DOB+age / sex (ROADMAP Part A pattern). */
export const PatientHeader = ({
  patient,
  className,
}: {
  patient: Patient.Type;
  className?: string;
}) => (
  <div className={cn("flex flex-wrap items-center gap-2", className)}>
    <span className="font-medium text-foreground text-sm">{patient.name}</span>
    <Chip>MRN {patient.mrn}</Chip>
    <Chip>
      {formatDate(patient.dateOfBirth)} · {age(patient.dateOfBirth)} vjeç
    </Chip>
    <Chip>{sexLabel(patient.sex)}</Chip>
  </div>
);
