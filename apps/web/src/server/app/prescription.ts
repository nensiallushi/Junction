"use server";

import type { Prescription } from "@/server/database/schema";
import { db } from "@/server/database/store";
import { withAuthentication, withAuthorization } from "@/server/utils/context";
import { repository } from "@/server/utils/repository";

export type Type = Prescription;

const prescriptions = repository(db.prescriptions);
const patients = repository(db.patients);

const byNewest = (a: Prescription, b: Prescription) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

/** Doctor issues a GENERIC prescription for one of their patients. */
export const create = withAuthentication(
  async (
    _environment,
    session,
    data: {
      patient: string;
      medication: string;
      note?: string;
      study?: string | null;
    },
  ): Promise<Prescription | null> => {
    const patient = await patients.get(data.patient);
    if (!patient || patient.organizationId !== session.organizationId)
      return null;
    if (data.medication.trim() === "") return null;
    return prescriptions.create({
      id: `rx_${Date.now()}`,
      organizationId: session.organizationId,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: session.user.id,
      doctorName: session.user.name,
      studyId: data.study ?? null,
      medication: data.medication.trim(),
      note: data.note?.trim() ?? "",
      createdAt: new Date().toISOString(),
      dispensed: false,
    });
  },
  "Prescription.create",
);

/** Pharmacist marks a prescription as given to (or un-given from) the patient. */
export const setDispensed = withAuthorization(
  async (
    _environment,
    _session,
    {
      prescription: id,
      dispensed,
    }: { prescription: string; dispensed: boolean },
  ): Promise<boolean> => {
    const rx = await prescriptions.get(id);
    if (!rx) return false;
    await prescriptions.update(id, { dispensed });
    return true;
  },
  { roles: ["pharmacist"], label: "Prescription.setDispensed" },
);

/** Pharmacist removes a prescription from the pharmacy queue (cross-org). */
export const remove = withAuthorization(
  async (
    _environment,
    _session,
    { prescription: id }: { prescription: string },
  ): Promise<boolean> => {
    const rx = await prescriptions.get(id);
    if (!rx) return false;
    return prescriptions.destroy(id);
  },
  { roles: ["pharmacist"], label: "Prescription.remove" },
);

/** A patient's prescriptions (org-scoped) — shown to the issuing doctor. */
export const forPatient = withAuthentication(
  async (
    _environment,
    session,
    { patient }: { patient: string },
  ): Promise<Prescription[]> => {
    const rows = await prescriptions.find(
      (rx) =>
        rx.organizationId === session.organizationId &&
        rx.patientId === patient,
    );
    return rows.sort(byNewest);
  },
  "Prescription.forPatient",
);

/**
 * Centralized pharmacy view (cross-org, pharmacist-only). Returns every
 * prescription's patient name, medication and issuing doctor — and nothing
 * clinical (no images, no findings).
 */
export const forPharmacy = withAuthorization(
  async (_environment, _session): Promise<Prescription[]> => {
    const rows = await prescriptions.find();
    return rows.sort(byNewest);
  },
  { roles: ["pharmacist"], label: "Prescription.forPharmacy" },
);

export const destroy = withAuthentication(
  async (
    _environment,
    session,
    { prescription: id }: { prescription: string },
  ): Promise<boolean> => {
    const rx = await prescriptions.get(id);
    if (!rx || rx.organizationId !== session.organizationId) return false;
    return prescriptions.destroy(id);
  },
  "Prescription.destroy",
);
