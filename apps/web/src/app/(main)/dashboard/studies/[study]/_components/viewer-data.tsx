import { unwrapResult } from "@zenncore/utils";
import * as Analysis from "@/server/app/analysis";
import type * as Study from "@/server/app/study";
import { Environment } from "@/server/utils/environment";
import { Viewer } from "./viewer";

/**
 * Streamed data layer — fetches the analysis (+ findings) for the study and hands
 * the shared `findings[]` to the viewer. The study itself is already resolved by
 * the page shell, so the title/patient chip render instantly while this streams.
 */
export const ViewerData = async ({ study }: { study: Study.View }) => {
  const read = await unwrapResult(
    Analysis.getForStudy(Environment.SERVER, { study: study.id }),
  );

  return (
    <Viewer
      study={study}
      analysis={read?.analysis ?? null}
      findings={read?.findings ?? []}
    />
  );
};
