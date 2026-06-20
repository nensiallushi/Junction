/**
 * Context wrappers — the spine every model is built on.
 *
 *  - `withContext`         base wrapper: resultifies the handler.
 *  - `withAuthentication`  injects `session = { user, organizationId, role }`.
 *  - `withAuthorization`   the role wall on top of authentication.
 *
 * The org-scoping wall: clinical models pin every query to
 * `row.organizationId === session.organizationId` using the session's org — the
 * caller never passes an org id, so a forged `patientId` from another hospital
 * resolves to nothing. Cross-facility access (#7) is a *separate*, audited path.
 *
 * Auth is mocked until Better Auth is wired: the active clinician is whoever the
 * `mediscan_user` cookie points at (set by the sign-in account picker), falling
 * back to the demo admin. The call conventions and org-scoping are real.
 */

import { type Result, resultify } from "@zenncore/utils";
import { cookies } from "next/headers";
import type { Role } from "@/lib/medical";
import type { Doctor } from "@/server/database/schema";
import { DEMO_USER_ID, db } from "@/server/database/store";
import { Environment, isEnvironment } from "./environment";
import { UnauthenticatedError, UnauthorizedError } from "./errors";

/** Cookie holding the signed-in clinician's id (demo stand-in for a session). */
export const SESSION_COOKIE = "mediscan_user";

export type Session = {
  user: Doctor;
  organizationId: string;
  role: Role;
};

const resolveSession = async (): Promise<Session> => {
  const cookieStore = await cookies();
  const id = cookieStore.get(SESSION_COOKIE)?.value ?? DEMO_USER_ID;
  const user =
    db.doctors.find((doctor) => doctor.id === id) ??
    db.doctors.find((doctor) => doctor.id === DEMO_USER_ID);
  if (!user) throw new UnauthenticatedError("No active session");
  return { user, organizationId: user.organizationId, role: user.role };
};

// Server callers pass `Environment.SERVER` first; client callers omit it.
const parseParams = <Args>(params: unknown[]): [Environment, Args] =>
  isEnvironment(params[0])
    ? [params[0], params[1] as Args]
    : [Environment.CLIENT, params[0] as Args];

// The codebase `Result` carries a string error (what `unwrapResult` re-throws).
const message = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const withContext = <Args, Data>(
  handler: (environment: Environment, args: Args) => Promise<Data>,
  _label: string,
) => {
  return async (...params: unknown[]): Promise<Result<Data>> => {
    const [environment, args] = parseParams<Args>(params);
    const result = await resultify(() => handler(environment, args));
    if (!result.success)
      return { success: false, error: message(result.error) };
    return result;
  };
};

export const withAuthentication = <Args, Data>(
  handler: (
    environment: Environment,
    session: Session,
    args: Args,
  ) => Promise<Data>,
  _label: string,
) => {
  return async (...params: unknown[]): Promise<Result<Data>> => {
    const [environment, args] = parseParams<Args>(params);
    const result = await resultify(async () =>
      handler(environment, await resolveSession(), args),
    );
    if (!result.success)
      return { success: false, error: message(result.error) };
    return result;
  };
};

export const withAuthorization = <Args, Data>(
  handler: (
    environment: Environment,
    session: Session,
    args: Args,
  ) => Promise<Data>,
  { roles, label }: { roles: Role[]; label: string },
) => {
  return async (...params: unknown[]): Promise<Result<Data>> => {
    const [environment, args] = parseParams<Args>(params);
    const result = await resultify(async () => {
      const session = await resolveSession();
      if (!roles.includes(session.role))
        throw new UnauthorizedError(
          `${label}: role "${session.role}" is not permitted`,
        );
      return handler(environment, session, args);
    });
    if (!result.success)
      return { success: false, error: message(result.error) };
    return result;
  };
};
