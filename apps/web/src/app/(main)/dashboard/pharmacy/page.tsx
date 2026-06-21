import { unwrapResult } from "@zenncore/utils";
import { redirect } from "next/navigation";
import { PharmacyIcon } from "@/components/medical-icons";
import * as Authentication from "@/server/app/authentication";
import * as Prescription from "@/server/app/prescription";
import { Environment } from "@/server/utils/environment";
import { PharmacyBoard } from "./_components/pharmacy-board";

type Group = { name: string; items: Prescription.Type[] };

export default async () => {
  const user = await unwrapResult(
    Authentication.getCurrentUser(Environment.SERVER),
  );
  if (user.role !== "pharmacist") redirect("/dashboard");

  const prescriptions = await unwrapResult(
    Prescription.forPharmacy(Environment.SERVER),
  );

  const groups = new Map<string, Group>();
  for (const rx of prescriptions) {
    const group = groups.get(rx.patientId) ?? {
      name: rx.patientName,
      items: [],
    };
    group.items.push(rx);
    groups.set(rx.patientId, group);
  }
  // Order by most recent prescription first (items already newest-first).
  const latest = (group: Group) => group.items[0]?.createdAt ?? "";
  const patients = [...groups.values()].sort((a, b) =>
    latest(b).localeCompare(latest(a)),
  );

  return (
    <div className="space-y-6 p-6 md:p-8">
      <header className="relative overflow-hidden rounded-card border border-accent/60 bg-gradient-to-br from-card/80 via-card/40 to-transparent p-5 md:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-icon bg-primary/15 text-primary-rich">
            <PharmacyIcon className="size-6" />
          </span>
          <div>
            <h1 className="font-semibold text-2xl text-foreground">Farmacia</h1>
            <p className="text-foreground-dimmed text-sm">
              Kërko pacientin, shiko barin dhe mjekun, dhe shëno kur ilaçi është
              dhënë.
            </p>
          </div>
        </div>
      </header>

      <PharmacyBoard patients={patients} />
    </div>
  );
};
