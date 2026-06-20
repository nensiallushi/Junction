import { unwrapResult } from "@zenncore/utils";
import type { StudyStatus } from "@/lib/medical";
import * as Study from "@/server/app/study";
import { Environment } from "@/server/utils/environment";
import { WorklistDataTable } from "./worklist-data-table";

export const WorklistTable = async ({
  status,
  bodyPart,
}: {
  status?: StudyStatus;
  bodyPart?: string;
}) => {
  const studies = await unwrapResult(
    Study.worklist(Environment.SERVER, { status, bodyPart }),
  );
  return (
    <WorklistDataTable
      rows={studies.map((study) => ({ ...study, _id: study.id }))}
    />
  );
};

export const WorklistSkeleton = () => (
  <div className="overflow-hidden rounded-card border border-accent bg-card/60">
    <div className="flex flex-col divide-y divide-accent">
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="flex items-center gap-3 p-4">
          <div className="size-8 shrink-0 animate-pulse rounded-icon bg-accent" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 animate-pulse rounded bg-accent" />
            <div className="h-2 w-24 animate-pulse rounded bg-accent" />
          </div>
          <div className="h-2 w-32 animate-pulse rounded-pill bg-accent" />
        </div>
      ))}
    </div>
  </div>
);
