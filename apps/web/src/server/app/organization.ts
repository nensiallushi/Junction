"use server";

import type { Organization } from "@/server/database/schema";
import { db } from "@/server/database/store";
import { withAuthentication } from "@/server/utils/context";
import { repository } from "@/server/utils/repository";

export type Type = Organization;

const organizations = repository(db.organizations);

export const current = withAuthentication(
  async (_environment, session) => organizations.get(session.organizationId),
  "Organization.current",
);

/** Participating public-hospital directory for cross-facility retrieval (#7). */
export const listPublic = withAuthentication(
  async (_environment, session) =>
    organizations.find(
      (organization) =>
        organization.type === "public" &&
        organization.id !== session.organizationId,
    ),
  "Organization.listPublic",
);
