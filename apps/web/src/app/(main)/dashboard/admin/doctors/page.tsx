import { unwrapResult } from "@zenncore/utils";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import * as Authentication from "@/server/app/authentication";
import { Environment } from "@/server/utils/environment";
import { DoctorsSkeleton, DoctorsTable } from "./_components/doctors-table";
import { InviteDoctorForm } from "./_components/invite-doctor-form";

export default async () => {
  const user = await unwrapResult(
    Authentication.getCurrentUser(Environment.SERVER),
  );
  if (user.role !== "hospital_admin") redirect("/dashboard");

  return (
    <div className="space-y-6 p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="font-semibold text-2xl text-foreground">Mjekët</h1>
        <p className="text-foreground-dimmed text-sm">
          Regjistro dhe menaxho klinicistët. Llogaritë e ftuara lidhen me këtë
          spital dhe rol pas pranimit.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Suspense fallback={<DoctorsSkeleton />}>
          <DoctorsTable />
        </Suspense>

        <section className="h-fit space-y-4 rounded-card border border-accent bg-card/70 p-4 shadow-card">
          <div>
            <h2 className="font-semibold text-foreground">Fto një mjek</h2>
            <p className="text-caption text-xs">
              Ata marrin një ftesë për ta pranuar.
            </p>
          </div>
          <InviteDoctorForm />
        </section>
      </div>
    </div>
  );
};
