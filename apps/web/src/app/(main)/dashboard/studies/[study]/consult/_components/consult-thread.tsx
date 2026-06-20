"use client";

import { SendMessageIcon } from "@zenncore/icons";
import { cn } from "@zenncore/utils";
import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { TextField, TextFieldInput } from "@zenncore/web/components/text-field";
import { useState } from "react";
import { formatDateTime, initials } from "@/lib/medical";
import * as Collaboration from "@/server/app/collaboration";
import type { Finding, Message } from "@/server/database/schema";

/**
 * Collaboration thread (#8). A message can cite a `finding.id`; cited messages get
 * the rust link treatment — reusing the same hover join key as the viewer.
 */
export const ConsultThread = ({
  study,
  initialMessages,
  findings,
}: {
  study: string;
  initialMessages: Message[];
  findings: Finding[];
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [cited, setCited] = useState<string | null>(null);

  const labelFor = (id: string) =>
    findings.find((finding) => finding.id === id)?.label ?? "a finding";

  const [post, posting] = useAsyncAction(async () => {
    if (body.trim().length === 0) return;
    const message = await Collaboration.post({ study, body, finding: cited });
    if (message.success && message.data) {
      const created = message.data;
      setMessages((current) => [...current, created]);
      setBody("");
      setCited(null);
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-foreground-dimmed text-sm">
            Asnjë mesazh ende. Nis konsultën më poshtë.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className="flex gap-3 rounded-card border border-accent bg-card/60 p-4"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-foreground-dimmed text-xs">
              {initials(message.authorName)}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground text-sm">
                  {message.authorName}
                </p>
                <p className="text-caption text-xs">
                  {formatDateTime(message.createdAt)}
                </p>
              </div>
              {message.findingId != null && (
                <p className="text-xs">
                  <span className="text-caption">Re: </span>
                  <span className="text-link underline decoration-link/40 underline-offset-2">
                    {labelFor(message.findingId)}
                  </span>
                </p>
              )}
              <p className="text-foreground-dimmed text-sm leading-relaxed">
                {message.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-card border border-accent bg-card/60 p-3">
        {findings.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption text-xs">Cito një gjetje:</span>
            {findings.map((finding) => (
              <button
                key={finding.id}
                type="button"
                onClick={() =>
                  setCited((current) =>
                    current === finding.id ? null : finding.id,
                  )
                }
                className={cn(
                  "rounded-pill border px-2 py-1 text-xs transition-colors",
                  cited === finding.id
                    ? "border-link bg-link/15 text-link"
                    : "border-accent text-foreground-dimmed hover:text-foreground",
                )}
              >
                {finding.region}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <TextField value={body} onValueChange={setBody} className="flex-1">
            <TextFieldInput
              placeholder="Shto një mendim të dytë…"
              onKeyDown={(event) => {
                if (event.key === "Enter") post();
              }}
            />
          </TextField>
          <Button
            color="primary"
            disabled={posting || body.trim().length === 0}
            onClick={() => post()}
          >
            <SendMessageIcon className="size-4" />
            Dërgo
          </Button>
        </div>
      </div>
    </div>
  );
};
