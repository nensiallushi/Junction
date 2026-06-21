import { unwrapResult } from "@zenncore/utils";
import { formatDateTime } from "@/lib/medical";
import * as Prescription from "@/server/app/prescription";
import { Environment } from "@/server/utils/environment";

/** Read-only list of prescriptions already sent to the pharmacy for a patient. */
export const PrescriptionSection = async ({ patient }: { patient: string }) => {
  const list = await unwrapResult(
    Prescription.forPatient(Environment.SERVER, { patient }),
  );
  if (list.length === 0) return null;

  return (
    <section className="space-y-3 border-accent border-t pt-6">
      <h2 className="font-semibold text-foreground text-lg">
        Recetat e dërguara
      </h2>
      <ul className="space-y-2">
        {list.map((rx) => (
          <li
            key={rx.id}
            className="flex items-start justify-between gap-3 rounded-row border border-accent bg-card/60 p-3"
          >
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm">
                {rx.medication}
              </p>
              {rx.note && <p className="text-caption text-xs">{rx.note}</p>}
              <p className="mt-1 text-caption text-xs">
                {rx.doctorName} · {formatDateTime(rx.createdAt)}
              </p>
            </div>
            <span className="shrink-0 rounded-pill bg-success/15 px-2 py-1 font-medium text-success text-xs">
              Te farmacia
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};
