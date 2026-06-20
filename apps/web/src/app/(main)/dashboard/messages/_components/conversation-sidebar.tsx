"use client";

import { cn } from "@zenncore/utils";
import type { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HospitalIcon } from "@/components/medical-icons";
import { initials, roleLabel } from "@/lib/medical";
import type * as Doctor from "@/server/app/doctor";

const ROW =
  "flex items-center gap-2 rounded-row p-2 text-left transition-colors";

export const ConversationSidebar = ({
  colleagues,
  groupName,
}: {
  colleagues: Doctor.Type[];
  groupName: string;
}) => {
  const active = useSearchParams().get("with");

  return (
    <div className="flex flex-col gap-1">
      <Link
        href="/dashboard/messages"
        className={cn(
          ROW,
          active === null ? "bg-accent" : "hover:bg-accent/50",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-icon bg-primary/15">
          <HospitalIcon className="size-4 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground text-sm">
            {groupName}
          </p>
          <p className="truncate text-caption text-xs">Kanali i grupit</p>
        </div>
      </Link>

      <p className="px-2 pt-4 pb-1 font-medium text-caption text-xs uppercase tracking-wide">
        Mesazhe direkte
      </p>

      {colleagues.map((colleague) => (
        <Link
          key={colleague.id}
          href={`/dashboard/messages?with=${colleague.id}` as Route}
          className={cn(
            ROW,
            active === colleague.id ? "bg-accent" : "hover:bg-accent/50",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-foreground-dimmed text-xs">
            {initials(colleague.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground text-sm">
              {colleague.name}
            </p>
            <p className="truncate text-caption text-xs">
              {roleLabel(colleague.role)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};
