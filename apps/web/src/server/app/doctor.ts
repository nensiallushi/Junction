"use server";

import type { Role } from "@/lib/medical";
import type { Doctor } from "@/server/database/schema";
import { db } from "@/server/database/store";
import { withAuthentication, withAuthorization } from "@/server/utils/context";
import { repository } from "@/server/utils/repository";

export type Type = Doctor;

const doctors = repository(db.doctors);

export const list = withAuthentication(
  async (_environment, session) =>
    doctors.find((doctor) => doctor.organizationId === session.organizationId),
  "Doctor.list",
);

/**
 * "Hospital registers doctors" — admin + invitation (ROADMAP Part C). Creates an
 * invited account pre-bound to the admin's organization + role. Real Better Auth
 * issues a verification-backed invite token here; accept binds the user.
 */
export const invite = withAuthorization(
  async (
    _environment,
    session,
    data: { name: string; email: string; role: Role; specialty?: string },
  ) =>
    doctors.create({
      id: `doc_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      organizationId: session.organizationId,
      status: "invited",
      specialty: data.specialty ?? null,
      avatarUrl: null,
    }),
  { roles: ["hospital_admin"], label: "Doctor.invite" },
);

export const setRole = withAuthorization(
  async (
    _environment,
    session,
    { doctor: id, role }: { doctor: string; role: Role },
  ) => {
    const doctor = await doctors.get(id);
    if (!doctor || doctor.organizationId !== session.organizationId)
      return null;
    return doctors.update(id, { role });
  },
  { roles: ["hospital_admin"], label: "Doctor.setRole" },
);

export const disable = withAuthorization(
  async (_environment, session, { doctor: id }: { doctor: string }) => {
    const doctor = await doctors.get(id);
    if (!doctor || doctor.organizationId !== session.organizationId)
      return null;
    return doctors.update(id, { status: "disabled" });
  },
  { roles: ["hospital_admin"], label: "Doctor.disable" },
);
