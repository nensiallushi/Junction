"use server";

import type { DirectMessage } from "@/server/database/schema";
import { db } from "@/server/database/store";
import { withAuthentication } from "@/server/utils/context";
import { repository } from "@/server/utils/repository";

export type Type = DirectMessage;

/** Normalized chat shape shared by the group channel and direct messages. */
export type ChatMessage = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

const direct = repository(db.directMessages);

const nameOf = (id: string) =>
  db.doctors.find((doctor) => doctor.id === id)?.name ?? "Mjek";

const enrich = (message: DirectMessage): ChatMessage => ({
  id: message.id,
  authorId: message.fromId,
  authorName: nameOf(message.fromId),
  body: message.body,
  createdAt: message.createdAt,
});

/** The private conversation between the signed-in clinician and a colleague. */
export const conversation = withAuthentication(
  async (
    _environment,
    session,
    { with: other }: { with: string },
  ): Promise<ChatMessage[]> => {
    const messages = await direct.find(
      (message) =>
        message.organizationId === session.organizationId &&
        ((message.fromId === session.user.id && message.toId === other) ||
          (message.fromId === other && message.toId === session.user.id)),
    );
    return messages
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .map(enrich);
  },
  "Direct.conversation",
);

export const send = withAuthentication(
  async (
    _environment,
    session,
    { to, body }: { to: string; body: string },
  ): Promise<ChatMessage> => {
    const message = await direct.create({
      id: `dm_${Date.now()}`,
      organizationId: session.organizationId,
      fromId: session.user.id,
      toId: to,
      body,
      createdAt: new Date().toISOString(),
    });
    return enrich(message);
  },
  "Direct.send",
);
