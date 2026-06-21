import { CheckBadgeIcon } from "@zenncore/icons";
import { unwrapResult } from "@zenncore/utils";
import type { Route } from "next";
import Link from "next/link";
import { formatDateTime } from "@/lib/medical";
import * as Analysis from "@/server/app/analysis";
import * as Report from "@/server/app/report";
import { Environment } from "@/server/utils/environment";

const normalize = (lines: string[]): string =>
  lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

/**
 * The doctor's report on the study viewer:
 *  - not finalized            → waiting
 *  - finalized, unchanged     → "doctor agrees with the AI report"
 *  - finalized, edited        → the doctor's version
 */
export const DoctorReport = async ({ study }: { study: string }) => {
  const [report, read] = await Promise.all([
    unwrapResult(Report.getForStudy(Environment.SERVER, { study })),
    unwrapResult(Analysis.getForStudy(Environment.SERVER, { study })),
  ]);

  const finalized =
    report?.status === "finalized" || report?.status === "amended";
  const reportText = normalize((report?.body ?? "").split("\n"));
  const aiText = normalize(read?.analysis.summary ?? []);
  // The doctor left the AI read as-is (or cleared it) → they agree with the AI.
  const unchanged = reportText === "" || reportText === aiText;

  return (
    <section className="rounded-card border border-accent bg-card/70 p-4 shadow-card">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-semibold text-foreground">Raporti i mjekut</h2>
        {finalized ? (
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-success/15 px-2 py-1 font-medium text-success text-xs">
            <CheckBadgeIcon className="size-3.5" />
            Finalizuar dhe analizuar
          </span>
        ) : (
          <span className="rounded-pill bg-warning/15 px-2 py-1 font-medium text-warning text-xs">
            Në pritje të raportit
          </span>
        )}
      </header>

      {finalized ? (
        unchanged ? (
          <p className="text-foreground-dimmed text-sm">
            Mjeku është dakord me raportin e AI — pa ndryshime.
          </p>
        ) : (
          <p className="whitespace-pre-wrap text-foreground text-sm leading-relaxed">
            {report?.body}
          </p>
        )
      ) : (
        <p className="text-foreground-dimmed text-sm">
          Ende pa raport përfundimtar. Hap "Finalizo raportin" për ta mbyllur
          rastin.
        </p>
      )}

      {report?.finalizedAt && (
        <p className="mt-3 text-caption text-xs">
          Finalizuar më {formatDateTime(report.finalizedAt)}
        </p>
      )}

      <div className="mt-4">
        <Link
          href={`/dashboard/studies/${study}/report` as Route}
          className="text-primary-rich text-sm underline-offset-4 hover:underline"
        >
          {finalized ? "Ndrysho raportin" : "Shkruaj / finalizo raportin"}
        </Link>
      </div>
    </section>
  );
};

export const DoctorReportSkeleton = () => (
  <div className="h-28 animate-pulse rounded-card border border-accent bg-card/60" />
);
