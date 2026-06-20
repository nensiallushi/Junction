"use server";

import type { Report } from "@/server/database/schema";
import { db } from "@/server/database/store";
import { withAuthentication } from "@/server/utils/context";
import { repository } from "@/server/utils/repository";

export type Type = Report;

const reports = repository(db.reports);
const studies = repository(db.studies);

const scopedStudyId = async (
  id: string,
  organizationId: string,
): Promise<boolean> => {
  const study = await studies.get(id);
  return study?.organizationId === organizationId;
};

export const getForStudy = withAuthentication(
  async (_environment, session, { study: id }: { study: string }) => {
    if (!(await scopedStudyId(id, session.organizationId))) return null;
    return (await reports.find((report) => report.studyId === id))[0] ?? null;
  },
  "Report.getForStudy",
);

/** Save the doctor's report as a draft — kept distinct from `analysis.summary`. */
export const save = withAuthentication(
  async (
    _environment,
    session,
    { study: id, body }: { study: string; body: string },
  ) => {
    if (!(await scopedStudyId(id, session.organizationId))) return null;
    const existing = (await reports.find((report) => report.studyId === id))[0];
    if (existing) return reports.update(existing.id, { body });
    return reports.create({
      id: `rep_${Date.now()}`,
      studyId: id,
      authorId: session.user.id,
      status: "draft",
      body,
      finalizedAt: null,
    });
  },
  "Report.save",
);

export const finalize = withAuthentication(
  async (
    _environment,
    session,
    { study: id, body }: { study: string; body: string },
  ) => {
    if (!(await scopedStudyId(id, session.organizationId))) return null;
    const finalizedAt = new Date().toISOString();
    const existing = (await reports.find((report) => report.studyId === id))[0];
    const report = existing
      ? await reports.update(existing.id, {
          body,
          status: existing.status === "finalized" ? "amended" : "finalized",
          finalizedAt,
        })
      : await reports.create({
          id: `rep_${Date.now()}`,
          studyId: id,
          authorId: session.user.id,
          status: "finalized",
          body,
          finalizedAt,
        });
    await studies.update(id, { status: "reported" });
    return report;
  },
  "Report.finalize",
);
