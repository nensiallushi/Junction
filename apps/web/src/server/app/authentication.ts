"use server";

import { cookies } from "next/headers";
import type { Doctor } from "@/server/database/schema";
import { CREDENTIALS, db } from "@/server/database/store";
import {
  SESSION_COOKIE,
  withAuthentication,
  withContext,
} from "@/server/utils/context";
import { InvalidCredentialsError } from "@/server/utils/errors";

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
    if (
      !doctor ||
      doctor.status !== "active" ||
      CREDENTIALS[doctor.id] !== password
    )
      throw new InvalidCredentialsError("Email ose fjalëkalim i pasaktë.");

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, doctor.id, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });
    return { success: true as const };
  },
  "Authentication.signIn",
);

export const signOut = withContext(async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return { success: true as const };
}, "Authentication.signOut");
