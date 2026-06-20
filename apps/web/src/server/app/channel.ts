"use server";

import type { ChannelMessage } from "@/server/database/schema";
import { db } from "@/server/database/store";
import { withAuthentication } from "@/server/utils/context";
import { repository } from "@/server/utils/repository";

export type Type = ChannelMessage;

const channel = repository(db.channelMessages);

const byCreated = (a: ChannelMessage, b: ChannelMessage) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

/** The hospital's team channel — org-scoped, oldest first. */
export const list = withAuthentication(async (_environment, session) => {
  const messages = await channel.find(
    (message) => message.organizationId === session.organizationId,
  );
  return messages.sort(byCreated);
}, "Channel.list");

export const post = withAuthentication(
  async (_environment, session, { body }: { body: string }) =>
    channel.create({
      id: `chan_${Date.now()}`,
      organizationId: session.organizationId,
      authorId: session.user.id,
      authorName: session.user.name,
      body,
      createdAt: new Date().toISOString(),
    }),
  "Channel.post",
);
