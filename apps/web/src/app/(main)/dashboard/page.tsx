import { unwrapResult } from "@zenncore/utils";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import * as Authentication from "@/server/app/authentication";
import { Environment } from "@/server/utils/environment";
import { BodyMap } from "./_components/body-map";
import {
  Greeting,
  PendingReviews,
  RecentStudies,
  SectionSkeleton,
  Stats,
  StatsSkeleton,
  UrgentCases,
} from "./_components/sections";

export default async () => {
  const user = await unwrapResult(
    Authentication.getCurrentUser(Environment.SERVER),
  );
  if (user.role === "pharmacist") redirect("/dashboard/pharmacy");

  return (
    <div className="space-y-8 p-6 md:p-8">
      <header className="relative overflow-hidden rounded-card border border-accent/60 bg-gradient-to-br from-card/80 via-card/40 to-transparent p-5 md:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative space-y-1.5">
          <Suspense
            fallback={
              <div className="h-8 w-72 animate-pulse rounded-md bg-accent" />
            }
          >
            <Greeting />
          </Suspense>
          <p className="max-w-xl text-foreground-dimmed text-sm leading-relaxed">
            Studime të renditura sipas urgjencës nga AI. Modeli ndihmon — nuk e
            zëvendëson kurrë leximin tënd.
          </p>
        </div>
      </header>

      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <BodyMap />
        <div className="flex flex-col gap-6">
          <Suspense fallback={<SectionSkeleton title="Rastet urgjente" />}>
            <UrgentCases />
          </Suspense>
          <Suspense
            fallback={<SectionSkeleton title="Në pritje për rishikim" />}
          >
            <PendingReviews />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<SectionSkeleton title="Studimet e fundit" />}>
        <RecentStudies />
      </Suspense>
    </div>
  );
};
