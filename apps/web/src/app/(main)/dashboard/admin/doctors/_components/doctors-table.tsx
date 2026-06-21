import { unwrapResult } from "@zenncore/utils";
import * as Authentication from "@/server/app/authentication";
import * as Doctor from "@/server/app/doctor";
import { Environment } from "@/server/utils/environment";
import { DoctorsDataTable } from "./doctors-data-table";

export const DoctorsTable = async () => {
  const [doctors, user] = await Promise.all([
    unwrapResult(Doctor.list(Environment.SERVER)),
    unwrapResult(Authentication.getCurrentUser(Environment.SERVER)),
  ]);
  return (
    <DoctorsDataTable
      rows={doctors.map((doctor) => ({ ...doctor, _id: doctor.id }))}
      currentUserId={user.id}
    />
  );
};

export const DoctorsSkeleton = () => (
  <div className="overflow-hidden rounded-card border border-accent bg-card/60">
    <div className="flex flex-col divide-y divide-accent">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex items-center gap-3 p-4">
          <div className="size-8 shrink-0 animate-pulse rounded-full bg-accent" />
          <div className="h-3 w-40 animate-pulse rounded bg-accent" />
          <div className="ml-auto h-3 w-20 animate-pulse rounded-pill bg-accent" />
        </div>
      ))}
    </div>
  </div>
);
