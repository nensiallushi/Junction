"use server";

import type { Patient } from "@/server/database/schema";
import { db } from "@/server/database/store";
import { purgePatient } from "@/server/utils/cascade";
import { withAuthentication } from "@/server/utils/context";
import { repository } from "@/server/utils/repository";

export type Type = Patient;

const patients = repository(db.patients);

export const get = withAuthentication(
  async (_environment, session, { patient: id }: { patient: string }) => {
    const patient = await patients.get(id);
    // org-scoping wall: a forged id from another hospital returns nothing.
    if (!patient || patient.organizationId !== session.organizationId)
      return null;
    return patient;
  },
  "Patient.get",
);

export const paginate = withAuthentication(
  async (
    _environment,
    session,
    args: { page?: number; query?: string } = {},
  ) => {
    const query = args.query?.trim().toLowerCase() ?? "";
    const matched = (
      await patients.find(
        (patient) =>
          patient.organizationId === session.organizationId &&
          (query === "" ||
            patient.name.toLowerCase().includes(query) ||
            patient.mrn.toLowerCase().includes(query)),
      )
    ).sort((a, b) => a.name.localeCompare(b.name));

    const page = args.page ?? 1;
    const pageSize = 20;
    const start = (page - 1) * pageSize;
    return {
      rows: matched.slice(start, start + pageSize),
      page,
      pageSize,
      total: matched.length,
      pageCount: Math.max(1, Math.ceil(matched.length / pageSize)),
    };
  },
  "Patient.paginate",
);

/** All patients in the org, sorted A–Z — feeds the upload autocomplete. */
export const list = withAuthentication(
  async (_environment, session): Promise<Patient[]> => {
    const rows = await patients.find(
      (patient) => patient.organizationId === session.organizationId,
    );
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  },
  "Patient.list",
);

export const search = withAuthentication(
  async (_environment, session, { query }: { query: string }) => {
    const term = query.trim().toLowerCase();
    if (term === "") return [];
    return patients.find(
      (patient) =>
        patient.organizationId === session.organizationId &&
        (patient.name.toLowerCase().includes(term) ||
          patient.mrn.toLowerCase().includes(term)),
    );
  },
  "Patient.search",
);

export const create = withAuthentication(
  async (
    _environment,
    session,
    data: {
      name: string;
      mrn: string;
      dateOfBirth: string;
      sex: Patient["sex"];
    },
  ) =>
    patients.create({
      id: `pat_${Date.now()}`,
      organizationId: session.organizationId,
      ...data,
    }),
  "Patient.create",
);

/** Delete a patient and cascade their studies/analyses/reports. Org-scoped. */
export const destroy = withAuthentication(
  async (
    _environment,
    session,
    { patient: id }: { patient: string },
  ): Promise<boolean> => {
    const patient = await patients.get(id);
    if (!patient || patient.organizationId !== session.organizationId)
      return false;
    await purgePatient(id);
    return true;
  },
  "Patient.destroy",
);

/**
 * Cross-facility lookup (#7) — the sharpest PHI edge, kept as a *separate*,
 * audited path. Unions only public organizations and never relaxes the default
 * `organizationId === session.organizationId` scope of every other model.
 * Identity is matched on name + date of birth (mrn is per-org).
 */
export const findCrossFacility = withAuthentication(
  async (_environment, session, { patient: id }: { patient: string }) => {
    const local = await patients.get(id);
    if (!local || local.organizationId !== session.organizationId) return [];

    const publicOrganizations = new Set(
      db.organizations
        .filter((organization) => organization.type === "public")
        .map((organization) => organization.id),
    );

    // (a real implementation logs this access against the requesting clinician)
    return patients.find(
      (patient) =>
        patient.organizationId !== session.organizationId &&
        publicOrganizations.has(patient.organizationId) &&
        patient.name === local.name &&
        patient.dateOfBirth === local.dateOfBirth,
    );
  },
  "Patient.findCrossFacility",
);
