/**
 * Cascade deletes over the in-memory store — keeps data valid when a study or
 * patient is removed. No orphaned analyses, findings, risk history, reports,
 * images, consults or messages are left behind. Mirrors what a real DB would do
 * with `ON DELETE CASCADE`. Plain module (not a server action) so both
 * `Study.destroy` and `Patient.destroy` can reuse it.
 */

import { db } from "@/server/database/store";
import { repository } from "@/server/utils/repository";

const purge = async <Row extends { id: string }>(
  collection: Row[],
  predicate: (row: Row) => boolean,
): Promise<void> => {
  const repo = repository(collection);
  const doomed = await repo.find(predicate);
  await Promise.all(doomed.map((row) => repo.destroy(row.id)));
};

/** Delete a study and everything that hangs off it. */
export const purgeStudy = async (studyId: string): Promise<void> => {
  const consults = await repository(db.consults).find(
    (consult) => consult.studyId === studyId,
  );
  const consultIds = new Set(consults.map((consult) => consult.id));

  await purge(db.messages, (message) => consultIds.has(message.consultId));
  await purge(db.consults, (consult) => consult.studyId === studyId);
  await purge(db.findings, (finding) => finding.studyId === studyId);
  await purge(db.analyses, (analysis) => analysis.studyId === studyId);
  await purge(db.riskScoreHistory, (entry) => entry.studyId === studyId);
  await purge(db.reports, (report) => report.studyId === studyId);
  await purge(db.images, (image) => image.studyId === studyId);
  await purge(db.studies, (study) => study.id === studyId);
};

/** Delete a patient and all of their studies (each fully cascaded). */
export const purgePatient = async (patientId: string): Promise<void> => {
  const studies = await repository(db.studies).find(
    (study) => study.patientId === patientId,
  );
  await Promise.all(studies.map((study) => purgeStudy(study.id)));
  await purge(db.patients, (patient) => patient.id === patientId);
};
