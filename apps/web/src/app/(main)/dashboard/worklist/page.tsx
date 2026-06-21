import { XIcon } from "@zenncore/icons";
import { cn } from "@zenncore/utils";
import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  STUDY_STATUS,
  type StudyStatus,
  studyStatusLabel,
} from "@/lib/medical";
import { WorklistSkeleton, WorklistTable } from "./_components/worklist-table";

export default async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; bodyPart?: string }>;
}) => {
  const { status, bodyPart } = await searchParams;
  const active = STUDY_STATUS.find((candidate) => candidate === status);
  const part = bodyPart?.trim();

  const href = (value?: StudyStatus): Route => {
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    if (part) params.set("bodyPart", part);
    const query = params.toString();
    return (
      query ? `/dashboard/worklist?${query}` : "/dashboard/worklist"
    ) as Route;
  };

  const filters: { value?: StudyStatus; label: string }[] = [
    { value: undefined, label: "Të gjitha" },
    ...STUDY_STATUS.map((value) => ({ value, label: studyStatusLabel(value) })),
  ];

  return (
    <div className="space-y-6 p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="font-semibold text-2xl text-foreground">
          Lista e punës
        </h1>
        <p className="text-foreground-dimmed text-sm">
          Radha e rasteve, e renditur me kritikët të parët sipas pikëve të
          rrezikut nga AI.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.label}
            href={href(filter.value)}
            className={cn(
              "rounded-pill px-3 py-1 font-medium text-sm transition-colors",
              filter.value === active
                ? "bg-primary text-white"
                : "bg-accent text-foreground-dimmed hover:text-foreground",
            )}
          >
            {filter.label}
          </Link>
        ))}

        {part && (
          <Link
            href={
              (active
                ? `/dashboard/worklist?status=${active}`
                : "/dashboard/worklist") as Route
            }
            className="ml-auto flex items-center gap-1.5 rounded-pill bg-primary/15 px-3 py-1 font-medium text-primary-rich text-sm transition-colors hover:bg-primary/25"
          >
            Pjesa: {part}
            <XIcon className="size-4" />
          </Link>
        )}
      </div>

      <Suspense
        key={`${active ?? "all"}-${part ?? ""}`}
        fallback={<WorklistSkeleton />}
      >
        <WorklistTable status={active} bodyPart={part} />
      </Suspense>
    </div>
  );
};
