"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import {
  Dialog,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from "@zenncore/web/components/dialog";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@zenncore/web/components/select";
import { TextField, TextFieldInput } from "@zenncore/web/components/text-field";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { PlusIcon } from "@/components/medical-icons";
import { SEX, type Sex, sexLabel } from "@/lib/medical";
import * as Patient from "@/server/app/patient";

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2">
    <span className="font-medium text-foreground text-sm">{label}</span>
    {children}
  </div>
);

export const AddPatientDialog = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mrn, setMrn] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState<Sex>("male");

  const valid = name.trim() !== "" && mrn.trim() !== "" && dateOfBirth !== "";

  const reset = () => {
    setName("");
    setMrn("");
    setDateOfBirth("");
    setSex("male");
  };

  const [submit, submitting] = useAsyncAction(async () => {
    if (!valid) return;
    const result = await Patient.create({
      name: name.trim(),
      mrn: mrn.trim(),
      dateOfBirth,
      sex,
    });
    if (result.success) {
      reset();
      setOpen(false);
      router.refresh();
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button color="primary" className="gap-2" onClick={() => setOpen(true)}>
        <PlusIcon className="size-4" />
        Shto pacient
      </Button>

      <DialogPopup
        classList={{
          root: "w-[28rem] rounded-card border border-accent bg-card p-6 text-foreground outline-none",
          backdrop: "opacity-60",
        }}
      >
        <DialogTitle className="text-foreground">Shto pacient</DialogTitle>
        <DialogDescription className="text-foreground-dimmed text-sm">
          Krijo një kartelë të re pacienti për spitalin.
        </DialogDescription>

        <div className="space-y-4">
          <Field label="Emri i plotë">
            <TextField
              value={name}
              onValueChange={setName}
              className="border border-accent"
            >
              <TextFieldInput placeholder="p.sh. Arben Hoxha" />
            </TextField>
          </Field>

          <Field label="MRN">
            <TextField
              value={mrn}
              onValueChange={setMrn}
              className="border border-accent"
            >
              <TextFieldInput placeholder="p.sh. MNT-1042" />
            </TextField>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Datëlindja">
              <input
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                className="h-10 rounded-md border border-accent bg-transparent px-3 text-foreground text-sm outline-none focus-visible:border-primary"
              />
            </Field>

            <Field label="Gjinia">
              <Select
                value={sex}
                onValueChange={(value: string | null) =>
                  value && setSex(value as Sex)
                }
              >
                <SelectTrigger className="border border-accent text-foreground">
                  <SelectValue>
                    {(value: string | null) =>
                      value ? sexLabel(value as Sex) : "Zgjidh"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectPositioner>
                  <SelectPopup>
                    {SEX.map((option) => (
                      <SelectItem key={option} value={option}>
                        {sexLabel(option)}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </SelectPositioner>
              </Select>
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            color="neutral"
            onClick={() => setOpen(false)}
          >
            Anulo
          </Button>
          <Button
            color="primary"
            disabled={!valid || submitting}
            onClick={() => submit()}
          >
            {submitting ? "Po ruhet…" : "Ruaj pacientin"}
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
};
