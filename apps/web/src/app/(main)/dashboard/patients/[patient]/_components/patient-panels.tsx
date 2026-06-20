import { unwrapResult } from "@zenncore/utils";
import { HospitalIcon } from "@/components/medical-icons";
import { StudyListRow, StudyRowEmpty } from "@/components/study-row";
import * as Organization from "@/server/app/organization";
import * as Patient from "@/server/app/patient";
import * as Study from "@/server/app/study";
import { Environment } from "@/server/utils/environment";

export const PatientStudies = async ({ patient }: { patient: string }) => {
  const studies = await unwrapResult(
    Study.forPatient(Environment.SERVER, { patient }),
  );

  return (
    <section className="flex flex-col rounded-card border border-accent bg-card/70 p-2 shadow-card">
      <header className="flex items-center justify-between px-3 py-2">
        <h2 className="font-semibold text-foreground">Studimet</h2>
        <span className="rounded-pill bg-accent px-2 py-1 font-semibold text-foreground-dimmed text-xs">
          {studies.length}
        </span>
      </header>
      <div className="flex flex-col">
        {studies.length > 0 ? (
          studies.map((study) => <StudyListRow key={study.id} study={study} />)
        ) : (
          <StudyRowEmpty>Ende asnjë studim për këtë pacient.</StudyRowEmpty>
        )}
      </div>
    </section>
  );
};

/** Cross-facility prior records (#7) — the separate, audited lookup path. */
export const PatientHistory = async ({ patient }: { patient: string }) => {
  const [matches, organizations] = await Promise.all([
    unwrapResult(Patient.findCrossFacility(Environment.SERVER, { patient })),
    unwrapResult(Organization.listPublic(Environment.SERVER)),
  ]);

  const facility = (id: string) =>
    organizations.find((organization) => organization.id === id)?.name ??
    "External facility";

  return (
    <section className="flex flex-col rounded-card border border-accent bg-card/70 p-2 shadow-card">
      <header className="px-3 py-2">
        <h2 className="font-semibold text-foreground text-sm">
          Të dhëna ndër-institucionale
        </h2>
        <p className="text-caption text-xs">Spitale publike pjesëmarrëse</p>
      </header>
      <div className="flex flex-col gap-2 p-2">
        {matches.length === 0 ? (
          <p className="px-1 py-4 text-foreground-dimmed text-sm">
            Asnjë e dhënë përputhëse në institucione të tjera.
          </p>
        ) : (
          matches.map((record) => (
            <div
              key={record.id}
              className="rounded-row border border-accent bg-card/60 p-3"
            >
              <div className="flex items-center gap-2">
                <HospitalIcon className="size-4 text-primary" />
                <p className="font-medium text-foreground text-sm">
                  {facility(record.organizationId)}
                </p>
              </div>
              <p className="mt-1 text-caption text-xs">
                MRN {record.mrn} · qasja u regjistrua
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export const PanelSkeleton = () => (
  <div className="space-y-3 rounded-card border border-accent bg-card/70 p-4 shadow-card">
    <div className="h-4 w-32 animate-pulse rounded bg-accent" />
    <div className="h-3 w-full animate-pulse rounded bg-accent" />
    <div className="h-3 w-4/5 animate-pulse rounded bg-accent" />
  </div>
);
