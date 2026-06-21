"use client";

import { cn } from "@zenncore/utils";
import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import {
  FileUpload,
  FileUploadInput,
  FileUploadPreview,
} from "@zenncore/web/components/file-upload";
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
import { type ReactNode, useState } from "react";
import {
  MODALITY,
  type Modality,
  mediaTypeFor,
  modalityLabel,
} from "@/lib/medical";
import type * as Patient from "@/server/app/patient";
import * as Storage from "@/server/app/storage";

const BODY_PARTS = [
  "Toraks",
  "Kafka",
  "Qafa",
  "Shtylla kurrizore",
  "Shpatulla",
  "Krahu",
  "Bërryli",
  "Parakrahu",
  "Kyçi i dorës",
  "Dora",
  "Legeni",
  "Kofsha",
  "Gjuri",
  "Këmba",
  "Kyçi i këmbës",
  "Barku",
];
const OTHER = "__other__";

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2">
    <span className="font-medium text-foreground text-sm">{label}</span>
    {children}
  </div>
);

const readDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const UploadForm = ({ patients }: { patients: Patient.Type[] }) => {
  const router = useRouter();

  const [patientId, setPatientId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const [modality, setModality] = useState<Modality>("xray");

  const [partChoice, setPartChoice] = useState<string>("Toraks");
  const [customPart, setCustomPart] = useState("");

  const [file, setFile] = useState<File | null>(null);

  const bodyPart = partChoice === OTHER ? customPart.trim() : partChoice;

  // Names starting with what the doctor typed (patients arrive sorted A–Z).
  const suggestions = patients.filter((candidate) =>
    candidate.name.toLowerCase().startsWith(query.trim().toLowerCase()),
  );

  const select = (candidate: Patient.Type) => {
    setPatientId(candidate.id);
    setQuery(candidate.name);
    setFocused(false);
  };

  const valid = patientId !== null && bodyPart !== "";

  const [submit, submitting] = useAsyncAction(async () => {
    if (!patientId || bodyPart === "") return;
    const media = file
      ? {
          imageUrl: await readDataUrl(file),
          mediaType: mediaTypeFor(file.type),
          fileName: file.name,
        }
      : {};
    const registration = await Storage.register({
      patient: patientId,
      modality,
      bodyPart,
      ...media,
    });
    if (registration.success)
      router.push(`/dashboard/studies/${registration.data.study}` as Route);
  });

  return (
    <div className="space-y-6">
      <FileUpload
        mode="single"
        accept={["image/*", "video/*", "application/pdf"]}
        value={file}
        onValueChange={setFile}
      >
        <FileUploadInput />
        <FileUploadPreview />
      </FileUpload>
      <p className="text-caption text-xs">
        Formate të lejuara: imazhe (PNG, JPEG), video (MP4), PDF dhe skanime
        MRI/CT. Skedari ngarkohet dhe shfaqet drejtpërdrejt në shikues.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* patient — type-ahead autocomplete */}
        <Field label="Pacienti">
          <div className="relative">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPatientId(null);
                setFocused(true);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => window.setTimeout(() => setFocused(false), 150)}
              placeholder="Shkruaj emrin e pacientit…"
              className="h-10 w-full rounded-md border border-accent bg-transparent px-3 text-foreground text-sm outline-none placeholder:text-caption focus-visible:border-primary"
            />
            {focused && suggestions.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-accent bg-card p-1 shadow-card">
                {suggestions.map((candidate) => (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        select(candidate);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-card-hover",
                        patientId === candidate.id && "bg-card-hover",
                      )}
                    >
                      <span className="text-foreground">{candidate.name}</span>
                      <span className="text-caption text-xs">
                        {candidate.mrn}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Field>

        {/* body part — sliding dropdown + manual "Other" */}
        <Field label="Pjesa e trupit">
          <Select
            value={partChoice}
            onValueChange={(value: string | null) =>
              value && setPartChoice(value)
            }
          >
            <SelectTrigger className="border border-accent text-foreground">
              <SelectValue>
                {(value: string | null) =>
                  value === OTHER
                    ? "Tjetër (specifiko)"
                    : (value ?? "Zgjidh pjesën")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectPositioner>
              <SelectPopup>
                {BODY_PARTS.map((part) => (
                  <SelectItem key={part} value={part}>
                    {part}
                  </SelectItem>
                ))}
                <SelectItem value={OTHER}>Tjetër (specifiko)</SelectItem>
              </SelectPopup>
            </SelectPositioner>
          </Select>
          {partChoice === OTHER && (
            <input
              value={customPart}
              onChange={(event) => setCustomPart(event.target.value)}
              placeholder="p.sh. Klavikula e majtë"
              className="h-10 w-full rounded-md border border-accent bg-transparent px-3 text-foreground text-sm outline-none placeholder:text-caption focus-visible:border-primary"
            />
          )}
        </Field>
      </div>

      {/* modality */}
      <div className="flex flex-col gap-2">
        <span className="font-medium text-foreground text-sm">Modaliteti</span>
        <div className="flex flex-wrap gap-2">
          {MODALITY.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setModality(option)}
              className={cn(
                "rounded-pill border px-3 py-1 font-medium text-sm transition-colors",
                modality === option
                  ? "border-primary bg-primary/15 text-primary-rich"
                  : "border-accent text-foreground-dimmed hover:text-foreground",
              )}
            >
              {modalityLabel(option)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          color="primary"
          disabled={submitting || !valid}
          onClick={() => submit()}
        >
          {submitting ? "Po analizohet…" : "Ngarko & analizo"}
        </Button>
      </div>
    </div>
  );
};
