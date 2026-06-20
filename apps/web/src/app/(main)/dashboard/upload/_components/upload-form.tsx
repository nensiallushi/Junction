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
import { TextField, TextFieldInput } from "@zenncore/web/components/text-field";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  MODALITY,
  type Modality,
  mediaTypeFor,
  modalityLabel,
} from "@/lib/medical";
import type * as Patient from "@/server/app/patient";
import * as Storage from "@/server/app/storage";

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
  const [patient, setPatient] = useState<string | null>(
    patients[0]?.id ?? null,
  );
  const [modality, setModality] = useState<Modality>("mri");
  const [bodyPart, setBodyPart] = useState("Toraks");
  const [file, setFile] = useState<File | null>(null);

  const [submit, submitting] = useAsyncAction(async () => {
    if (!patient) return;
    const media = file
      ? {
          imageUrl: await readDataUrl(file),
          mediaType: mediaTypeFor(file.type),
          fileName: file.name,
        }
      : {};
    const registration = await Storage.register({
      patient,
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
        <Field label="Pacienti">
          <Select
            value={patient}
            onValueChange={(value: string | null) => setPatient(value)}
          >
            <SelectTrigger className="border border-accent">
              <SelectValue>
                {(value: string | null) =>
                  patients.find((candidate) => candidate.id === value)?.name ??
                  "Zgjidh pacientin"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectPositioner>
              <SelectPopup>
                {patients.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.name} · {candidate.mrn}
                  </SelectItem>
                ))}
              </SelectPopup>
            </SelectPositioner>
          </Select>
        </Field>

        <Field label="Pjesa e trupit">
          <TextField
            value={bodyPart}
            onValueChange={setBodyPart}
            className="border border-accent"
          >
            <TextFieldInput placeholder="p.sh. Toraks" />
          </TextField>
        </Field>
      </div>

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
          disabled={submitting || !patient}
          onClick={() => submit()}
        >
          {submitting ? "Po analizohet…" : "Ngarko & analizo"}
        </Button>
      </div>
    </div>
  );
};
