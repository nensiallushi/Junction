"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@zenncore/web/components/alert-dialog";
import { Button } from "@zenncore/web/components/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrashIcon } from "@/components/medical-icons";
import * as Doctor from "@/server/app/doctor";

export const DeleteDoctorButton = ({
  doctor,
  name,
}: {
  doctor: string;
  name: string;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [remove, removing] = useAsyncAction(async () => {
    const result = await Doctor.destroy({ doctor });
    if (result.success) {
      setOpen(false);
      router.refresh();
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Fshi mjekun ${name}`}
        className="flex size-8 items-center justify-center rounded-full text-foreground-dimmed transition-colors hover:bg-error/15 hover:text-error"
      >
        <TrashIcon className="size-4" />
      </button>

      <AlertDialogPopup
        classList={{
          root: "rounded-card border border-accent bg-card p-6 text-foreground outline-none",
          backdrop: "opacity-60",
        }}
      >
        <AlertDialogTitle className="text-foreground">
          Fshi mjekun
        </AlertDialogTitle>
        <AlertDialogDescription className="text-foreground-dimmed text-sm">
          Do të hiqet{" "}
          <span className="font-medium text-foreground">{name}</span> nga ky
          spital. Ky veprim nuk kthehet.
        </AlertDialogDescription>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            color="neutral"
            onClick={() => setOpen(false)}
          >
            Anulo
          </Button>
          <Button color="error" disabled={removing} onClick={() => remove()}>
            {removing ? "Po fshihet…" : "Fshi mjekun"}
          </Button>
        </div>
      </AlertDialogPopup>
    </AlertDialog>
  );
};
