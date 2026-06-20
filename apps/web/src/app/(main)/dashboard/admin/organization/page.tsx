import { unwrapResult } from "@zenncore/utils";
import { redirect } from "next/navigation";
import { HospitalIcon } from "@/components/medical-icons";
import { orgTypeLabel } from "@/lib/medical";
import * as Authentication from "@/server/app/authentication";
import * as Organization from "@/server/app/organization";
import { Environment } from "@/server/utils/environment";

export default async () => {
  const user = await unwrapResult(
    Authentication.getCurrentUser(Environment.SERVER),
  );
  if (user.role !== "hospital_admin") redirect("/dashboard");

  const [organization, directory] = await Promise.all([
    unwrapResult(Organization.current(Environment.SERVER)),
    unwrapResult(Organization.listPublic(Environment.SERVER)),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="font-semibold text-2xl text-foreground">Organizata</h1>
        <p className="text-foreground-dimmed text-sm">
          Spitali yt dhe rrjeti ndër-institucional ku merr pjesë.
        </p>
      </header>

      <section className="flex items-center gap-4 rounded-card border border-accent bg-card/70 p-6 shadow-card">
        <span className="flex size-12 items-center justify-center rounded-icon bg-primary/15">
          <HospitalIcon className="size-6 text-primary" />
        </span>
        <div>
          <p className="font-semibold text-foreground">
            {organization?.name ?? "—"}
          </p>
          <p className="text-caption text-sm">
            {organization ? orgTypeLabel(organization.type) : ""} ·{" "}
            {organization?.slug}
          </p>
        </div>
      </section>

      <section className="space-y-3 rounded-card border border-accent bg-card/70 p-6 shadow-card">
        <h2 className="font-semibold text-foreground">
          Spitalet publike pjesëmarrëse
        </h2>
        {directory.length === 0 ? (
          <p className="text-foreground-dimmed text-sm">
            Asnjë institucion tjetër pjesëmarrës.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {directory.map((facility) => (
              <li
                key={facility.id}
                className="flex items-center gap-2 rounded-row border border-accent bg-card/60 p-3"
              >
                <HospitalIcon className="size-4 text-primary" />
                <span className="font-medium text-foreground text-sm">
                  {facility.name}
                </span>
                <span className="ml-auto text-caption text-xs">
                  {orgTypeLabel(facility.type)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
