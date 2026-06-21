import { unwrapResult } from "@zenncore/utils";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PatientHeader } from "@/components/patient-header";
import { StatusPill } from "@/components/severity";
import { formatDate, modalityLabel } from "@/lib/medical";
import * as Study from "@/server/app/study";
import { Environment } from "@/server/utils/environment";
import {
  DoctorReport,
  DoctorReportSkeleton,
} from "./_components/doctor-report";
import { ViewerActionBar } from "./_components/viewer-action-bar";
import { ViewerData } from "./_components/viewer-data";
import { ViewerSkeleton } from "./_components/viewer-skeleton";

export default async ({ params }: { params: Promise<{ study: string }> }) => {
  const { study: id } = await params;
  const study = await unwrapResult(
    Study.get(Environment.SERVER, { study: id }),
  );
  if (!study) notFound();

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-start justify-between gap-4 border-accent border-b px-6 py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-foreground text-xl">
              {modalityLabel(study.modality)} {study.bodyPart} — diagnozë
            </h1>
            <StatusPill status={study.status} />
          </div>
          <PatientHeader patient={study.patient} />
        </div>
        <p className="text-caption text-xs">
          Studuar më {formatDate(study.studyDate)} · model AI stub-v0
        </p>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
        <Suspense fallback={<ViewerSkeleton />}>
          <ViewerData study={study} />
        </Suspense>

        <Suspense fallback={<DoctorReportSkeleton />}>
          <DoctorReport study={study.id} />
        </Suspense>
      </div>

      <ViewerActionBar study={study.id} />
    </div>
  );
};
