import { unwrapResult } from "@zenncore/utils";
import * as Analysis from "@/server/app/analysis";
import type * as Study from "@/server/app/study";
import { Environment } from "@/server/utils/environment";
import { Viewer } from "./viewer";

/**
 * Streamed data layer — ensures the study has a CURRENT read, then hands the
 * shared `findings[]` to the viewer. We call `ingest` (not just `getForStudy`):
 * it's idempotent — a study that already has a ranked analysis returns instantly,
 * but one whose analysis was reset (rankedAt = null) is re-read with the live
 * per-modality logic. So a study self-heals instead of showing a stale read.
 */
export const ViewerData = async ({ study }: { study: Study.View }) => {
  const read = await unwrapResult(
    Analysis.ingest(Environment.SERVER, { study: study.id }),
  );

  return (
    <Viewer
      study={study}
      analysis={read?.analysis ?? null}
      findings={read?.findings ?? []}
    />
  );
};
