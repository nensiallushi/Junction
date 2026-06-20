"use client";

import { useState } from "react";
import type * as Study from "@/server/app/study";
import type { Analysis, Finding } from "@/server/database/schema";
import { DiagnosisView } from "./diagnosis-view";
import { ActiveContext } from "./viewer-context";
import { XrayViewer } from "./xray-viewer";

/**
 * The always-split-panel viewer (DESIGN.md §7.1). Holds the shared hover state so
 * both panels stay in sync, and hands the *same* `findings[]` to each — overlays
 * and rows keyed by `finding.id`.
 */
export const Viewer = ({
  study,
  analysis,
  findings,
}: {
  study: Study.View;
  analysis: Analysis | null;
  findings: Finding[];
}) => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <ActiveContext value={[active, setActive]}>
      <div className="grid gap-4 lg:grid-cols-[44%_1fr]">
        <XrayViewer study={study} findings={findings} />
        <DiagnosisView study={study} analysis={analysis} findings={findings} />
      </div>
    </ActiveContext>
  );
};
