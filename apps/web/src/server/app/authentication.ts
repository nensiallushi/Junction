"use server";

import { cookies } from "next/headers";
import type { Doctor } from "@/server/database/schema";
import { db } from "@/server/database/store";
import {
  SESSION_COOKIE,
  withAuthentication,
  withContext,
} from "@/server/utils/context";
import { InvalidCredentialsError, RequestError } from "@/server/utils/errors";
import { repository } from "@/server/utils/repository";

export type Type = Doctor;

export const getCurrentUser = withAuthentication(
  async (_environment, session) => session.user,
  "Authentication.getCurrentUser",
);

export const isAuthenticated = withContext(async () => {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE) !== undefined;
}, "Authentication.isAuthenticated");

/**
 * Mock sign-in — validates email + password against the seeded credentials and
 * pins the session cookie to the clinician (real Better Auth issues a verified
 * session here). Only active accounts may sign in.
 */
export const signIn = withContext(
  async (
    _environment,
    { email, password }: { email: string; password: string },
  ) => {
    const doctor = db.doctors.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.trim().toLowerCase(),
    );
    const credential = doctor
      ? db.credentials.find((entry) => entry.id === doctor.id)
      : undefined;
    if (
      !doctor ||
      doctor.status !== "active" ||
      !credential ||
      credential.password !== password
    )
      throw new InvalidCredentialsError("Email ose fjalëkalim i pasaktë.");

    await setSession(doctor.id);
    return { success: true as const };
  },
  "Authentication.signIn",
);

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const setSession = async (doctorId: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, doctorId, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });
};

const ensureEmailFree = (email: string): void => {
  if (db.doctors.some((doctor) => doctor.email.toLowerCase() === email))
    throw new RequestError("Ky email është i regjistruar tashmë.");
};

/** Register a new hospital + its managing admin doctor, then sign them in. */
export const registerHospital = withContext(
  async (
    _environment,
    data: { hospital: string; name: string; email: string; password: string },
  ) => {
    const email = data.email.trim().toLowerCase();
    ensureEmailFree(email);
    const stamp = Date.now();
    const organizationId = `org_${stamp}`;
    const doctorId = `doc_${stamp}`;
    await repository(db.organizations).create({
      id: organizationId,
      name: data.hospital.trim(),
      slug: slugify(data.hospital) || organizationId,
      type: "public",
    });
    await repository(db.doctors).create({
      id: doctorId,
      name: data.name.trim(),
      email: data.email.trim(),
      role: "hospital_admin",
      organizationId,
      status: "active",
      specialty: null,
      avatarUrl: null,
    });
    await repository(db.credentials).create({
      id: doctorId,
      password: data.password,
    });
    await setSession(doctorId);
    return { success: true as const };
  },
  "Authentication.registerHospital",
);

/** Register a new pharmacy + its pharmacist, then sign them in. */
export const registerPharmacist = withContext(
  async (
    _environment,
    data: { pharmacy: string; name: string; email: string; password: string },
  ) => {
    const email = data.email.trim().toLowerCase();
    ensureEmailFree(email);
    const stamp = Date.now();
    const organizationId = `org_${stamp}`;
    const doctorId = `doc_${stamp}`;
    await repository(db.organizations).create({
      id: organizationId,
      name: data.pharmacy.trim(),
      slug: slugify(data.pharmacy) || organizationId,
      type: "pharmacy",
    });
    await repository(db.doctors).create({
      id: doctorId,
      name: data.name.trim(),
      email: data.email.trim(),
      role: "pharmacist",
      organizationId,
      status: "active",
      specialty: "Farmaci",
      avatarUrl: null,
    });
    await repository(db.credentials).create({
      id: doctorId,
      password: data.password,
    });
    await setSession(doctorId);
    return { success: true as const };
  },
  "Authentication.registerPharmacist",
);

export const signOut = withContext(async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return { success: true as const };
}, "Authentication.signOut");
