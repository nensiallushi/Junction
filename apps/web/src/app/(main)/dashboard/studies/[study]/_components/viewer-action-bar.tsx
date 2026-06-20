"use client";

import { CheckBadgeIcon, DownloadIcon } from "@zenncore/icons";
import { Button } from "@zenncore/web/components/button";
import type { Route } from "next";
import Link from "next/link";
import { ConsultIcon } from "@/components/medical-icons";

/**
 * Sticky glass action bar (DESIGN.md §10). Print/Download are de-prioritised
 * relative to the clinical actions (Consult, Finalize report).
 */
export const ViewerActionBar = ({ study }: { study: string }) => (
  <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 border-accent border-t bg-background-rich/60 px-6 py-3 backdrop-blur-xl">
    <Button
      variant="ghost"
      color="neutral"
      render={<Link href={`/dashboard/studies/${study}/consult` as Route} />}
    >
      <ConsultIcon className="size-4" />
      Konsultë
    </Button>
    <Button variant="outline" color="neutral" onClick={() => window.print()}>
      <DownloadIcon className="size-4" />
      Printo / Shkarko
    </Button>
    <Button
      variant="soft"
      color="primary"
      render={<Link href={`/dashboard/studies/${study}/report` as Route} />}
    >
      <CheckBadgeIcon className="size-4" />
      Finalizo raportin
    </Button>
  </div>
);
