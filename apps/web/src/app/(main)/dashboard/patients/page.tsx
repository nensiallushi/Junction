import { Suspense } from "react";
import { AddPatientDialog } from "./_components/add-patient-dialog";
import { PatientSearch } from "./_components/patient-search";
import { PatientsSkeleton, PatientsTable } from "./_components/patients-table";

export default async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) => {
  const { query } = await searchParams;

  return (
    <div className="space-y-6 p-6 md:p-8">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl text-foreground">Pacientët</h1>
          <p className="text-foreground-dimmed text-sm">
            Të dhëna të centralizuara në të gjithë spitalin. Kërko sipas emrit
            ose MRN.
          </p>
        </div>
        <AddPatientDialog />
      </header>

      <PatientSearch initial={query ?? ""} />

      <Suspense key={query ?? "all"} fallback={<PatientsSkeleton />}>
        <PatientsTable query={query} />
      </Suspense>
    </div>
  );
};
