"use server";

import type { Analysis, Finding, Study } from "@/server/database/schema";
import { db } from "@/server/database/store";
import { analyze } from "@/server/utils/analysis";
import { type Session, withAuthentication } from "@/server/utils/context";
import { repository } from "@/server/utils/repository";

export type Type = Analysis;
/** What the viewer reads — both panels share this `findings[]` (keyed by id). */
export type WithFindings = { analysis: Analysis; findings: Finding[] };

const analyses = repository(db.analyses);
const findings = repository(db.findings);
const studies = repository(db.studies);
const history = repository(db.riskScoreHistory);

const scopedStudy = async (
  id: string,
  session: Session,
): Promise<Study | null> => {
  const study = await studies.get(id);
  return study && study.organizationId === session.organizationId
    ? study
    : null;
};

const byDisplayOrder = (a: Finding, b: Finding) =>
  a.displayOrder - b.displayOrder;

export const getForStudy = withAuthentication(
  async (
    _environment,
    session,
    { study: id }: { study: string },
  ): Promise<WithFindings | null> => {
    if (!(await scopedStudy(id, session))) return null;
    const analysis = (await analyses.find((row) => row.studyId === id))[0];
    if (!analysis) return null;
    const list = (await findings.find((row) => row.studyId === id)).sort(
      byDisplayOrder,
    );
    return { analysis, findings: list };
  },
  "Analysis.getForStudy",
);

/**
 * Run the stub read and persist it: write `analysis` + bulk `finding`, then the
 * risk score onto the study (+ append to history). Idempotent — guards on
 * `rankedAt` so re-running (or a racing cron rerank) never double-writes
 * (ROADMAP Risk #6).
 */
export const ingest = withAuthentication(
  async (
    _environment,
    session,
    { study: id }: { study: string },
  ): Promise<WithFindings | null> => {
    const study = await scopedStudy(id, session);
    if (!study) return null;

    const existing = (await analyses.find((row) => row.studyId === id))[0];
    if (existing && study.rankedAt) {
      const list = (await findings.find((row) => row.studyId === id)).sort(
        byDisplayOrder,
      );
      return { analysis: existing, findings: list };
    }

    const read = await analyze(study);
    const analysisId = `ana_${Date.now()}`;
    const analysis = await analyses.create({
      id: analysisId,
      studyId: id,
      status: "complete",
      modelRef: read.modelRef,
      summary: read.summary,
      completedAt: new Date().toISOString(),
      error: null,
    });

    const created = await Promise.all(
      read.findings.map((draft, index) =>
        findings.create({
          id: `find_${analysisId}_${index}`,
          analysisId,
          studyId: id,
          imageId: null,
          ...draft,
        }),
      ),
    );

    const rankedAt = new Date().toISOString();
    await studies.update(id, {
      status: "analyzed",
      riskValue: read.risk.value,
      riskBand: read.risk.band,
      rankedAt,
    });
    await history.create({
      id: `risk_${analysisId}`,
      studyId: id,
      value: read.risk.value,
      band: read.risk.band,
      modelRef: read.modelRef,
      rankedAt,
    });

    return { analysis, findings: created.sort(byDisplayOrder) };
  },
  "Analysis.ingest",
);
