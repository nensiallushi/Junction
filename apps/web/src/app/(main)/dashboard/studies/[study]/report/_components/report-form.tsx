"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Report from "@/server/app/report";

/**
 * The doctor's report editor — deliberately distinct from `analysis.summary`
 * (the AI read is shown for reference only). `@zenncore/web` ships no Textarea,
 * so the long-form body uses a tokenized native textarea.
 */
export const ReportForm = ({
  study,
  initialBody,
  aiSummary,
}: {
  study: string;
  initialBody: string;
  aiSummary: string[];
}) => {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);

  const [saveDraft, saving] = useAsyncAction(async () => {
    await Report.save({ study, body });
    router.refresh();
  });

  const [finalize, finalizing] = useAsyncAction(async () => {
    const report = await Report.finalize({ study, body });
    if (report.success) router.push(`/dashboard/studies/${study}` as Route);
  });

  return (
    <div className="space-y-4">
      {aiSummary.length > 0 && (
        <div className="rounded-card border border-accent bg-card/60 p-4">
          <p className="font-medium text-caption text-xs uppercase tracking-wide">
            Konkluzionet e AI — vetëm referencë, jo raporti yt
          </p>
          <ul className="mt-2 space-y-1 text-foreground-dimmed text-sm">
            {aiSummary.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        </div>
      )}

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={12}
        placeholder="Shkruaj raportin klinik final…"
        className="w-full resize-y rounded-card border border-accent bg-card/60 p-4 text-foreground text-sm leading-relaxed outline-none transition-colors placeholder:text-caption focus:border-primary"
      />

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          color="neutral"
          disabled={saving}
          onClick={() => saveDraft()}
        >
          Ruaj draftin
        </Button>
        <Button
          color="primary"
          disabled={finalizing || body.trim().length === 0}
          onClick={() => finalize()}
        >
          Finalizo raportin
        </Button>
      </div>
    </div>
  );
};
