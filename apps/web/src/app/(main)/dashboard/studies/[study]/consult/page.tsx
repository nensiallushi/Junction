import { unwrapResult } from "@zenncore/utils";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { PatientHeader } from "@/components/patient-header";
import * as Analysis from "@/server/app/analysis";
import * as Collaboration from "@/server/app/collaboration";
import * as Study from "@/server/app/study";
import { Environment } from "@/server/utils/environment";
import { ConsultThread } from "./_components/consult-thread";

export default async ({ params }: { params: Promise<{ study: string }> }) => {
  const { study: id } = await params;
  const [study, thread, read] = await Promise.all([
    unwrapResult(Study.get(Environment.SERVER, { study: id })),
    unwrapResult(Collaboration.getForStudy(Environment.SERVER, { study: id })),
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
          Konsultë — mendim i dytë
        </h1>
        <PatientHeader patient={study.patient} />
      </header>

      <ConsultThread
        study={id}
        initialMessages={thread?.messages ?? []}
        findings={read?.findings ?? []}
      />
    </div>
  );
};
