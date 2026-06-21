"use client";

import { CheckBadgeIcon } from "@zenncore/icons";
import { cn } from "@zenncore/utils";
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
import { SearchIcon, TrashIcon } from "@/components/medical-icons";
import { formatDateTime, initials } from "@/lib/medical";
import * as Prescription from "@/server/app/prescription";

type Group = { name: string; items: Prescription.Type[] };

const RemovePrescriptionButton = ({
  prescription,
  label,
}: {
  prescription: string;
  label: string;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [remove, pending] = useAsyncAction(async () => {
    const result = await Prescription.remove({ prescription });
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
        aria-label="Hiq recetën"
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-foreground-dimmed transition-colors hover:bg-error/15 hover:text-error"
      >
        <TrashIcon className="size-3.5" />
      </button>

      <AlertDialogPopup
        classList={{
          root: "rounded-card border border-accent bg-card p-6 text-foreground outline-none",
          backdrop: "opacity-60",
        }}
      >
        <AlertDialogTitle className="text-foreground">
          Hiq recetën
        </AlertDialogTitle>
        <AlertDialogDescription className="text-foreground-dimmed text-sm">
          Do të hiqet receta{" "}
          <span className="font-medium text-foreground">{label}</span>. Ky
          veprim nuk kthehet.
        </AlertDialogDescription>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            color="neutral"
            onClick={() => setOpen(false)}
          >
            Anulo
          </Button>
          <Button color="error" disabled={pending} onClick={() => remove()}>
            {pending ? "Po hiqet…" : "Hiq"}
          </Button>
        </div>
      </AlertDialogPopup>
    </AlertDialog>
  );
};

const DispenseToggle = ({
  prescription,
  dispensed,
}: {
  prescription: string;
  dispensed: boolean;
}) => {
  const router = useRouter();
  const [toggle, pending] = useAsyncAction(async () => {
    const result = await Prescription.setDispensed({
      prescription,
      dispensed: !dispensed,
    });
    if (result.success) router.refresh();
  });

  return (
    <button
      type="button"
      onClick={() => toggle()}
      disabled={pending}
      aria-pressed={dispensed}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-pill px-2 py-0.5 font-medium text-xs transition-colors",
        dispensed
          ? "bg-success/15 text-success"
          : "border border-accent text-foreground-dimmed hover:bg-card-hover hover:text-foreground",
      )}
    >
      {dispensed ? (
        <CheckBadgeIcon className="size-3.5" />
      ) : (
        <span className="size-3 rounded-full border border-current" />
      )}
      {dispensed ? "Dhënë" : "Shëno si dhënë"}
    </button>
  );
};

export const PharmacyBoard = ({ patients }: { patients: Group[] }) => {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const filtered =
    term === ""
      ? patients
      : patients.filter((patient) => patient.name.toLowerCase().includes(term));

  const showEmpty = filtered.length === 0;
  const emptyMessage =
    patients.length === 0
      ? "Ende asnjë recetë e dërguar."
      : "Asnjë pacient me këtë emër.";

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground-dimmed" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Kërko pacientin sipas emrit…"
          className="h-10 w-full rounded-pill border border-accent bg-card/60 pr-3 pl-9 text-foreground text-sm outline-none placeholder:text-caption focus-visible:border-primary"
        />
      </div>

      {showEmpty ? (
        <div className="rounded-card border border-accent border-dashed bg-card/40 p-12 text-center text-foreground-dimmed text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((patient) => (
            <section
              key={patient.name}
              className="flex animate-fade-up flex-col rounded-card border border-accent bg-card/70 p-4 shadow-card"
            >
              <header className="flex items-center gap-3 pb-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-foreground-dimmed text-xs">
                  {initials(patient.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground text-sm">
                    {patient.name}
                  </p>
                  <p className="text-caption text-xs">
                    {patient.items.length} recetë(a)
                  </p>
                </div>
              </header>

              <ul className="flex flex-col gap-2 border-accent border-t pt-3">
                {patient.items.map((rx) => (
                  <li
                    key={rx.id}
                    className="rounded-row border border-accent bg-card/60 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground text-sm">
                        {rx.medication}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        <DispenseToggle
                          prescription={rx.id}
                          dispensed={Boolean(rx.dispensed)}
                        />
                        <RemovePrescriptionButton
                          prescription={rx.id}
                          label={`${rx.medication} · ${patient.name}`}
                        />
                      </div>
                    </div>
                    {rx.note && (
                      <p className="mt-1 text-caption text-xs">{rx.note}</p>
                    )}
                    <p className="mt-1.5 text-caption text-xs">
                      {rx.doctorName} · {formatDateTime(rx.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
