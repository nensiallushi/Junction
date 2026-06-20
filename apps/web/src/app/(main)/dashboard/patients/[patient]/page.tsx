import { unwrapResult } from "@zenncore/utils";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackLink } from "@/components/back-link";
import { PatientHeader } from "@/components/patient-header";
import * as Patient from "@/server/app/patient";
import { Environment } from "@/server/utils/environment";
import {
  PanelSkeleton,
  PatientHistory,
  PatientStudies,
} from "./_components/patient-panels";

export default async ({ params }: { params: Promise<{ patient: string }> }) => {
  const { patient: id } = await params;
  const patient = await unwrapResult(
    Patient.get(Environment.SERVER, { patient: id }),
  );
  if (!patient) notFound();

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <BackLink href="/dashboard/patients">Kthehu te pacientët</BackLink>
      </div>
      <header className="space-y-2">
        <h1 className="font-semibold text-2xl text-foreground">
          {patient.name}
        </h1>
        <PatientHeader patient={patient} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Suspense fallback={<PanelSkeleton />}>
          <PatientStudies patient={id} />
        </Suspense>
        <Suspense fallback={<PanelSkeleton />}>
          <PatientHistory patient={id} />
        </Suspense>
      </div>
    </div>
  );
};
