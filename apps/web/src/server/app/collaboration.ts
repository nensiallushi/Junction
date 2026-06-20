"use server";

import type { Consult, Message } from "@/server/database/schema";
import { db } from "@/server/database/store";
import { withAuthentication } from "@/server/utils/context";
import { repository } from "@/server/utils/repository";

export type Type = Consult;
export type Thread = { consult: Consult | null; messages: Message[] };

const consults = repository(db.consults);
const messages = repository(db.messages);
const studies = repository(db.studies);

const byCreated = (a: Message, b: Message) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

const scopedStudyId = async (
  id: string,
  organizationId: string,
): Promise<boolean> => {
  const study = await studies.get(id);
  return study?.organizationId === organizationId;
};

export const getForStudy = withAuthentication(
  async (
    _environment,
    session,
    { study: id }: { study: string },
  ): Promise<Thread | null> => {
    if (!(await scopedStudyId(id, session.organizationId))) return null;
    const consult =
      (await consults.find((row) => row.studyId === id))[0] ?? null;
    const list = consult
      ? (await messages.find((row) => row.consultId === consult.id)).sort(
          byCreated,
        )
      : [];
    return { consult, messages: list };
  },
  "Collaboration.getForStudy",
);

/** Post a message; opens the consult lazily. A message may cite a `finding.id`. */
export const post = withAuthentication(
  async (
    _environment,
    session,
    {
      study: id,
      body,
      finding,
    }: { study: string; body: string; finding?: string | null },
  ): Promise<Message | null> => {
    if (!(await scopedStudyId(id, session.organizationId))) return null;
    const consult =
      (await consults.find((row) => row.studyId === id))[0] ??
      (await consults.create({
        id: `con_${Date.now()}`,
        studyId: id,
        status: "open",
        participantIds: [session.user.id],
      }));
    return messages.create({
      id: `msg_${Date.now()}`,
      consultId: consult.id,
      authorId: session.user.id,
      authorName: session.user.name,
      body,
      findingId: finding ?? null,
      createdAt: new Date().toISOString(),
    });
  },
  "Collaboration.post",
);

export const resolve = withAuthentication(
  async (_environment, session, { consult: id }: { consult: string }) => {
    const consult = await consults.get(id);
    if (!consult) return null;
    if (!(await scopedStudyId(consult.studyId, session.organizationId)))
      return null;
    return consults.update(id, { status: "resolved" });
  },
  "Collaboration.resolve",
);
