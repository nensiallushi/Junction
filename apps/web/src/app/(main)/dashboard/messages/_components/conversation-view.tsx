import { unwrapResult } from "@zenncore/utils";
import { roleLabel } from "@/lib/medical";
import * as Channel from "@/server/app/channel";
import * as Direct from "@/server/app/direct";
import type * as Doctor from "@/server/app/doctor";
import { Environment } from "@/server/utils/environment";
import { MessageThread } from "./message-thread";

export const ConversationView = async ({
  with: other,
  currentUserId,
  colleagues,
  groupName,
}: {
  with?: string;
  currentUserId: string;
  colleagues: Doctor.Type[];
  groupName: string;
}) => {
  if (other) {
    const colleague = colleagues.find((candidate) => candidate.id === other);
    if (!colleague)
      return (
        <p className="text-foreground-dimmed text-sm">Bisedë e pavlefshme.</p>
      );

    const messages = await unwrapResult(
      Direct.conversation(Environment.SERVER, { with: other }),
    );

    return (
      <div className="space-y-3">
        <header className="border-accent border-b pb-3">
          <h2 className="font-semibold text-foreground">{colleague.name}</h2>
          <p className="text-caption text-xs">{roleLabel(colleague.role)}</p>
        </header>
        <MessageThread
          target={{ kind: "direct", with: other }}
          initialMessages={messages}
          currentUserId={currentUserId}
        />
      </div>
    );
  }

  const messages = await unwrapResult(Channel.list(Environment.SERVER));

  return (
    <div className="space-y-3">
      <header className="border-accent border-b pb-3">
        <h2 className="font-semibold text-foreground">{groupName}</h2>
        <p className="text-caption text-xs">
          Kanali i grupit — i gjithë spitali
        </p>
      </header>
      <MessageThread
        target={{ kind: "group" }}
        initialMessages={messages}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export const ConversationSkeleton = () => (
  <div className="space-y-3">
    <div className="h-5 w-40 animate-pulse rounded bg-accent" />
    {[0, 1, 2].map((row) => (
      <div key={row} className="flex gap-2">
        <div className="size-8 shrink-0 animate-pulse rounded-full bg-accent" />
        <div className="h-12 flex-1 animate-pulse rounded-card bg-accent" />
      </div>
    ))}
  </div>
);
