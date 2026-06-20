"use server";

import type { Modality } from "@/lib/medical";
import type { Patient, Study } from "@/server/database/schema";
import { db } from "@/server/database/store";
import { withAuthentication } from "@/server/utils/context";
import { repository } from "@/server/utils/repository";

export type Type = Study;
/** A study joined with its patient — what the worklist / dashboard rows render. */
export type View = Study & { patient: Patient };

export type Dashboard = {
  urgent: View[];
  pending: View[];
  recent: View[];
};

const studies = repository(db.studies);

const enrich = (study: Study): View | null => {
  const patient = db.patients.find(
    (candidate) => candidate.id === study.patientId,
  );
  return patient ? { ...study, patient } : null;
};

const isView = (view: View | null): view is View => view !== null;

const byRiskDescending = (a: View, b: View) =>
  (b.riskValue ?? -1) - (a.riskValue ?? -1);

const byDateDescending = (a: View, b: View) =>
  new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime();

export const get = withAuthentication(
  async (_environment, session, { study: id }: { study: string }) => {
    const study = await studies.get(id);
    if (!study || study.organizationId !== session.organizationId) return null;
    return enrich(study);
  },
  "Study.get",
);

/** Case queue — org-scoped, ordered critical-first with no join at read time. */
export const worklist = withAuthentication(
  async (
    _environment,
    session,
    args: { status?: Study["status"]; bodyPart?: string } = {},
  ): Promise<View[]> => {
    const part = args.bodyPart?.trim().toLowerCase();
    const rows = await studies.find(
      (study) =>
        study.organizationId === session.organizationId &&
        (args.status === undefined || study.status === args.status) &&
        (!part || study.bodyPart.toLowerCase().includes(part)),
    );
    return rows.map(enrich).filter(isView).sort(byRiskDescending);
  },
  "Study.worklist",
);

export const dashboard = withAuthentication(
  async (_environment, session): Promise<Dashboard> => {
    const rows = (
      await studies.find(
        (study) => study.organizationId === session.organizationId,
      )
    )
      .map(enrich)
      .filter(isView);

    return {
      urgent: rows
        .filter(
          (study) => study.riskBand === "critical" || study.riskBand === "high",
        )
        .sort(byRiskDescending),
      pending: rows
        .filter((study) => study.status === "analyzed")
        .sort(byRiskDescending),
      recent: [...rows].sort(byDateDescending).slice(0, 6),
    };
  },
  "Study.dashboard",
);

export const forPatient = withAuthentication(
  async (
    _environment,
    session,
    { patient }: { patient: string },
  ): Promise<View[]> => {
    const rows = await studies.find(
      (study) =>
        study.organizationId === session.organizationId &&
        study.patientId === patient,
    );
    return rows.map(enrich).filter(isView).sort(byDateDescending);
  },
  "Study.forPatient",
);

export const setStatus = withAuthentication(
  async (
    _environment,
    session,
    { study: id, status }: { study: string; status: Study["status"] },
  ) => {
    const study = await studies.get(id);
    if (!study || study.organizationId !== session.organizationId) return null;
    return studies.update(id, { status });
  },
  "Study.setStatus",
);

export const create = withAuthentication(
  async (
    _environment,
    session,
    data: {
      patient: string;
      modality: Modality;
      bodyPart: string;
      imageUrl: string;
      mediaType: Study["mediaType"];
      fileName: string;
    },
  ): Promise<Study> => {
    const id = `study_${Date.now()}`;
    return studies.create({
      id,
      organizationId: session.organizationId,
      patientId: data.patient,
      uploaderId: session.user.id,
      modality: data.modality,
      bodyPart: data.bodyPart,
      status: "queued",
      studyDate: new Date().toISOString(),
      studyInstanceUid: `1.2.840.113619.2.${id}`,
      riskValue: null,
      riskBand: null,
      rankedAt: null,
      imageUrl: data.imageUrl,
      mediaType: data.mediaType,
      fileName: data.fileName,
    });
  },
  "Study.create",
);
