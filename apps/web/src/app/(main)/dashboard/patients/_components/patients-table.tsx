import { unwrapResult } from "@zenncore/utils";
import * as Patient from "@/server/app/patient";
import { Environment } from "@/server/utils/environment";
import { PatientsDataTable } from "./patients-data-table";

export const PatientsTable = async ({ query }: { query?: string }) => {
  const patients = await unwrapResult(
    Patient.paginate(Environment.SERVER, { query }),
  );
  return (
    <PatientsDataTable
      rows={patients.rows.map((patient) => ({ ...patient, _id: patient.id }))}
    />
  );
};

export const PatientsSkeleton = () => (
  <div className="overflow-hidden rounded-card border border-accent bg-card/60">
    <div className="flex flex-col divide-y divide-accent">
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="flex items-center gap-3 p-4">
          <div className="size-8 shrink-0 animate-pulse rounded-full bg-accent" />
          <div className="h-3 w-40 animate-pulse rounded bg-accent" />
          <div className="ml-auto h-3 w-24 animate-pulse rounded bg-accent" />
        </div>
      ))}
    </div>
  </div>
);
