import { cn, unwrapResult } from "@zenncore/utils";
import type { ReactNode } from "react";
import { StudyListRow, StudyRowEmpty } from "@/components/study-row";
import * as Authentication from "@/server/app/authentication";
import * as Study from "@/server/app/study";
import { Environment } from "@/server/utils/environment";

type Tone = "error" | "warning" | "neutral";

const TONE_BADGE: Record<Tone, string> = {
  error: "bg-error/15 text-error",
  warning: "bg-warning/15 text-warning",
  neutral: "bg-accent text-foreground-dimmed",
};

const SectionCard = ({
  title,
  subtitle,
  count,
  tone,
  delay,
  children,
}: {
  title: string;
  subtitle: string;
  count: number;
  tone: Tone;
  delay: number;
  children: ReactNode;
}) => (
  <section
    className="flex animate-fade-up flex-col rounded-card border border-accent bg-card/70 p-2 shadow-card"
    style={{ animationDelay: `${delay}ms` }}
  >
    <header className="flex items-center justify-between gap-2 px-3 py-2">
      <div>
        <h2 className="font-semibold text-foreground text-sm">{title}</h2>
        <p className="text-caption text-xs">{subtitle}</p>
      </div>
      <span
        className={cn(
          "rounded-pill px-2 py-1 font-semibold text-xs tabular-nums",
          TONE_BADGE[tone],
        )}
      >
        {count}
      </span>
    </header>
    <div className="flex flex-col">{children}</div>
  </section>
);

export const Greeting = async () => {
  const user = await unwrapResult(
    Authentication.getCurrentUser(Environment.SERVER),
  );
  const hour = new Date().getHours();
  const part =
    hour < 12 ? "Mirëmëngjes" : hour < 18 ? "Mirëdita" : "Mirëmbrëma";
  return (
    <h1 className="font-semibold text-2xl text-foreground">
      {part}, {user.name}
    </h1>
  );
};

export const UrgentCases = async () => {
  const { urgent } = await unwrapResult(Study.dashboard(Environment.SERVER));
  return (
    <SectionCard
      title="Rastet urgjente"
      subtitle="Rrezik kritik & i lartë"
      tone="error"
      count={urgent.length}
      delay={0}
    >
      {urgent.length > 0 ? (
        urgent.map((study) => <StudyListRow key={study.id} study={study} />)
      ) : (
        <StudyRowEmpty>Asnjë rast urgjent — punë e mbarë.</StudyRowEmpty>
      )}
    </SectionCard>
  );
};

export const PendingReviews = async () => {
  const { pending } = await unwrapResult(Study.dashboard(Environment.SERVER));
  return (
    <SectionCard
      title="Në pritje për rishikim"
      subtitle="Të analizuara, presin raportin tënd"
      tone="warning"
      count={pending.length}
      delay={100}
    >
      {pending.length > 0 ? (
        pending.map((study) => <StudyListRow key={study.id} study={study} />)
      ) : (
        <StudyRowEmpty>Radha jote e rishikimit është e pastër.</StudyRowEmpty>
      )}
    </SectionCard>
  );
};

export const RecentStudies = async () => {
  const { recent } = await unwrapResult(Study.dashboard(Environment.SERVER));
  return (
    <SectionCard
      title="Studimet e fundit"
      subtitle="Më të rejat në të gjithë spitalin"
      tone="neutral"
      count={recent.length}
      delay={200}
    >
      {recent.length > 0 ? (
        recent.map((study) => <StudyListRow key={study.id} study={study} />)
      ) : (
        <StudyRowEmpty>Ende asnjë studim.</StudyRowEmpty>
      )}
    </SectionCard>
  );
};

export const SectionSkeleton = ({ title }: { title: string }) => (
  <section className="flex flex-col rounded-card border border-accent bg-card/70 p-2 shadow-card">
    <header className="px-3 py-2">
      <h2 className="font-semibold text-foreground text-sm">{title}</h2>
      <p className="text-caption text-xs">Po ngarkohet…</p>
    </header>
    <div className="flex flex-col gap-2 p-2">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex items-center gap-2 px-1 py-2">
          <div className="size-8 shrink-0 animate-pulse rounded-icon bg-accent" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 animate-pulse rounded bg-accent" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-accent" />
          </div>
        </div>
      ))}
    </div>
  </section>
);
