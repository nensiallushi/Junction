"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@zenncore/web/components/select";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrashIcon } from "@/components/medical-icons";
import * as Prescription from "@/server/app/prescription";
import * as Report from "@/server/app/report";

type Line = { id: string; text: string };

const NONE = "none";
const OTHER = "__other__";

/**
 * The finalize page in one flow: the doctor edits / deletes the AI conclusions,
 * optionally writes a prescription (sent to the pharmacy), then a single
 * "Finalizo raportin" saves the report AND the prescription to the database.
 */
const toTexts = (body: string, fallback: string[]): string[] => {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length > 0) return lines;
  if (fallback.length > 0) return fallback;
  return [""];
};

export const ReportForm = ({
  study,
  patient,
  initialBody,
  aiSummary,
}: {
  study: string;
  patient: string;
  initialBody: string;
  aiSummary: string[];
}) => {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>(() =>
    toTexts(initialBody, aiSummary).map((text, index) => ({
      id: `seed-${index}`,
      text,
    })),
  );

  const [medChoice, setMedChoice] = useState<string>(NONE);
  const [customMed, setCustomMed] = useState("");
  const [note, setNote] = useState("");

  const body = lines
    .map((line) => line.text.trim())
    .filter(Boolean)
    .join("\n");
  const medication = medChoice === OTHER ? customMed.trim() : "";

  const update = (id: string, text: string) =>
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, text } : line)),
    );
  const remove = (id: string) =>
    setLines((current) => current.filter((line) => line.id !== id));
  const add = () =>
    setLines((current) => [...current, { id: crypto.randomUUID(), text: "" }]);

  const [saveDraft, saving] = useAsyncAction(async () => {
    await Report.save({ study, body });
    router.refresh();
  });
  const [finalize, finalizing] = useAsyncAction(async () => {
    // Send the prescription first (if any), then finalize — one commit.
    if (medication !== "")
      await Prescription.create({ patient, medication, note, study });
    const report = await Report.finalize({ study, body });
    if (report.success) router.push(`/dashboard/studies/${study}` as Route);
  });

  return (
    <div className="space-y-4">
      {/* 1. Editable AI conclusions */}
      <div className="rounded-card border border-accent bg-card/60 p-4">
        <p className="font-medium text-caption text-xs uppercase tracking-wide">
          Konkluzionet — redaktoji ose fshiji ato të AI lirisht
        </p>
        <div className="mt-3 space-y-2">
          {lines.map((line) => (
            <div key={line.id} className="flex items-start gap-2">
              <span className="mt-3 size-1.5 shrink-0 rounded-full bg-primary" />
              <textarea
                value={line.text}
                onChange={(event) => update(line.id, event.target.value)}
                rows={2}
                placeholder="Konkluzion…"
                className="w-full resize-y rounded-row border border-accent bg-card/60 p-2.5 text-foreground text-sm leading-relaxed outline-none transition-colors placeholder:text-caption focus:border-primary"
              />
              <button
                type="button"
                onClick={() => remove(line.id)}
                aria-label="Hiq rreshtin"
                className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-foreground-dimmed transition-colors hover:bg-error/15 hover:text-error"
              >
                <TrashIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={add}
          className="mt-3 text-primary-rich text-sm underline-offset-4 hover:underline"
        >
          + Shto rresht
        </button>
      </div>

      {/* 2. Optional prescription — sent to the pharmacy on finalize */}
      <div className="rounded-card border border-accent bg-card/60 p-4">
        <p className="font-medium text-caption text-xs uppercase tracking-wide">
          Receta (opsionale) — i dërgohet farmacisë
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select
            value={medChoice}
            onValueChange={(value: string | null) =>
              setMedChoice(value ?? NONE)
            }
          >
            <SelectTrigger className="border border-accent text-foreground">
              <SelectValue>
                {(value: string | null) =>
                  value === OTHER ? "Specifiko" : "Pa recetë"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectPositioner>
              <SelectPopup>
                <SelectItem value={NONE}>Pa recetë</SelectItem>
                <SelectItem value={OTHER}>Specifiko</SelectItem>
              </SelectPopup>
            </SelectPositioner>
          </Select>

          {medChoice === OTHER && (
            <input
              value={customMed}
              onChange={(event) => setCustomMed(event.target.value)}
              placeholder="Shkruaj recetën, p.sh. Kortikosteroid"
              className="h-10 w-full rounded-md border border-accent bg-transparent px-3 text-foreground text-sm outline-none placeholder:text-caption focus-visible:border-primary"
            />
          )}

          {medChoice !== NONE && (
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Udhëzime (opsionale), p.sh. 2x në ditë për 5 ditë"
              className="h-10 w-full rounded-md border border-accent bg-transparent px-3 text-foreground text-sm outline-none placeholder:text-caption focus-visible:border-primary"
            />
          )}
        </div>
      </div>

      <p className="text-caption text-xs">
        Ndrysho ose fshij konkluzionet sipas nevojës dhe shto një recetë nëse
        duhet. Kur gjithçka është në rregull, kliko Finalizo — raporti dhe
        receta ruhen në bazën e të dhënave.
      </p>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          color="neutral"
          disabled={saving}
          onClick={() => saveDraft()}
        >
          Ruaj draftin
        </Button>
        <Button
          color="primary"
          disabled={finalizing}
          onClick={() => finalize()}
        >
          Finalizo raportin
        </Button>
      </div>
    </div>
  );
};
