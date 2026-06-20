"use client";

import { SendMessageIcon } from "@zenncore/icons";
import { cn } from "@zenncore/utils";
import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { TextField, TextFieldInput } from "@zenncore/web/components/text-field";
import { useState } from "react";
import { formatDateTime, initials } from "@/lib/medical";
import * as Channel from "@/server/app/channel";
import type { ChatMessage } from "@/server/app/direct";
import * as Direct from "@/server/app/direct";

export type MessageTarget =
  | { kind: "group" }
  | { kind: "direct"; with: string };

export const MessageThread = ({
  target,
  initialMessages,
  currentUserId,
}: {
  target: MessageTarget;
  initialMessages: ChatMessage[];
  currentUserId: string;
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [body, setBody] = useState("");

  const [send, sending] = useAsyncAction(async () => {
    if (body.trim().length === 0) return;
    const result =
      target.kind === "group"
        ? await Channel.post({ body })
        : await Direct.send({ to: target.with, body });
    if (result.success && result.data) {
      const created = result.data;
      setMessages((current) => [...current, created]);
      setBody("");
    }
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="py-6 text-foreground-dimmed text-sm">
            Asnjë mesazh ende. Nis bisedën më poshtë.
          </p>
        )}
        {messages.map((message) => {
          const own = message.authorId === currentUserId;
          return (
            <div
              key={message.id}
              className={cn("flex gap-2", own && "flex-row-reverse")}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-foreground-dimmed text-xs">
                {initials(message.authorName)}
              </span>
              <div
                className={cn(
                  "max-w-[80%] rounded-card border p-3",
                  own
                    ? "border-primary/40 bg-primary/10"
                    : "border-accent bg-card/60",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2",
                    own && "flex-row-reverse",
                  )}
                >
                  <p className="font-medium text-foreground text-xs">
                    {own ? "Ti" : message.authorName}
                  </p>
                  <p className="text-caption text-xs">
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>
                <p className="mt-1 text-foreground-dimmed text-sm leading-relaxed">
                  {message.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-accent border-t pt-3">
        <TextField value={body} onValueChange={setBody} className="flex-1">
          <TextFieldInput
            placeholder="Shkruaj një mesazh…"
            onKeyDown={(event) => {
              if (event.key === "Enter") send();
            }}
          />
        </TextField>
        <Button
          color="primary"
          disabled={sending || body.trim().length === 0}
          onClick={() => send()}
        >
          <SendMessageIcon className="size-4" />
          Dërgo
        </Button>
      </div>
    </div>
  );
};
