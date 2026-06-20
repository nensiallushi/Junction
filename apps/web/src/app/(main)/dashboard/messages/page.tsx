import { unwrapResult } from "@zenncore/utils";
import { Suspense } from "react";
import * as Authentication from "@/server/app/authentication";
import * as Doctor from "@/server/app/doctor";
import * as Organization from "@/server/app/organization";
import { Environment } from "@/server/utils/environment";
import { ConversationSidebar } from "./_components/conversation-sidebar";
import {
  ConversationSkeleton,
  ConversationView,
} from "./_components/conversation-view";

export default async ({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) => {
  const { with: other } = await searchParams;
  const [user, doctors, organization] = await Promise.all([
    unwrapResult(Authentication.getCurrentUser(Environment.SERVER)),
    unwrapResult(Doctor.list(Environment.SERVER)),
    unwrapResult(Organization.current(Environment.SERVER)),
  ]);

  const colleagues = doctors.filter(
    (doctor) => doctor.id !== user.id && doctor.status === "active",
  );
  const groupName = organization?.name ?? "Spitali";

  return (
    <div className="space-y-6 p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="font-semibold text-2xl text-foreground">Mesazhet</h1>
        <p className="text-foreground-dimmed text-sm">
          Bisedo me kolegët — në grup ose privatisht.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <aside className="h-fit rounded-card border border-accent bg-card/60 p-2">
          <ConversationSidebar colleagues={colleagues} groupName={groupName} />
        </aside>
        <section className="rounded-card border border-accent bg-card/60 p-4">
          <Suspense key={other ?? "group"} fallback={<ConversationSkeleton />}>
            <ConversationView
              with={other}
              currentUserId={user.id}
              colleagues={colleagues}
              groupName={groupName}
            />
          </Suspense>
        </section>
      </div>
    </div>
  );
};
