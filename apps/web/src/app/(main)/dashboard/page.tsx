import { Suspense } from "react";
import { BodyMap } from "./_components/body-map";
import {
  Greeting,
  PendingReviews,
  RecentStudies,
  SectionSkeleton,
  UrgentCases,
} from "./_components/sections";

export default () => (
  <div className="space-y-8 p-6 md:p-8">
    <header className="space-y-1">
      <Suspense
        fallback={
          <div className="h-8 w-72 animate-pulse rounded-md bg-accent" />
        }
      >
        <Greeting />
      </Suspense>
      <p className="text-foreground-dimmed text-sm">
        Studimet të renditura sipas urgjencës nga AI. Modeli ndihmon — nuk e
        zëvendëson kurrë leximin tënd.
      </p>
    </header>

    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <BodyMap />
      <div className="flex flex-col gap-6">
        <Suspense fallback={<SectionSkeleton title="Rastet urgjente" />}>
          <UrgentCases />
        </Suspense>
        <Suspense fallback={<SectionSkeleton title="Në pritje për rishikim" />}>
          <PendingReviews />
        </Suspense>
      </div>
    </div>

    <Suspense fallback={<SectionSkeleton title="Studimet e fundit" />}>
      <RecentStudies />
    </Suspense>
  </div>
);
