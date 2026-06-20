import { unwrapResult } from "@zenncore/utils";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { PatientHeader } from "@/components/patient-header";
import * as Analysis from "@/server/app/analysis";
import * as Report from "@/server/app/report";
import * as Study from "@/server/app/study";
import { Environment } from "@/server/utils/environment";
import { ReportForm } from "./_components/report-form";

export default async ({ params }: { params: Promise<{ study: string }> }) => {
  const { study: id } = await params;
  const [study, report, read] = await Promise.all([
    unwrapResult(Study.get(Environment.SERVER, { study: id })),
    unwrapResult(Report.getForStudy(Environment.SERVER, { study: id })),
    unwrapResult(Analysis.getForStudy(Environment.SERVER, { study: id })),
  ]);
  if (!study) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
      <div>
        <BackLink href={`/dashboard/studies/${id}` as Route}>
          Kthehu te studimi
        </BackLink>
      </div>
      <header className="space-y-2">
        <h1 className="font-semibold text-foreground text-xl">
          Finalizo raportin
        </h1>
        <PatientHeader patient={study.patient} />
      </header>

      <ReportForm
        study={id}
        initialBody={report?.body ?? ""}
        aiSummary={read?.analysis.summary ?? []}
      />
    </div>
  );
};
