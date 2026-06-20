import { unwrapResult } from "@zenncore/utils";
import type { ReactNode } from "react";
import { initials, roleLabel } from "@/lib/medical";
import * as Authentication from "@/server/app/authentication";
import { Environment } from "@/server/utils/environment";
import { SignOutButton } from "./_components/sign-out-button";

const Info = ({ label, value }: { label: string; value: ReactNode }) => (
  <div>
    <dt className="text-caption text-xs">{label}</dt>
    <dd className="text-foreground text-sm">{value}</dd>
  </div>
);

export default async () => {
  const user = await unwrapResult(
    Authentication.getCurrentUser(Environment.SERVER),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="font-semibold text-2xl text-foreground">Cilësimet</h1>
        <p className="text-foreground-dimmed text-sm">
          Llogaria dhe preferencat e tua.
        </p>
      </header>

      <section className="rounded-card border border-accent bg-card/70 p-6 shadow-card">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary font-semibold text-lg text-white">
            {initials(user.name)}
          </span>
          <div>
            <p className="font-semibold text-foreground">{user.name}</p>
            <p className="text-caption text-sm">{user.email}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info label="Roli" value={roleLabel(user.role)} />
          <Info label="Specialiteti" value={user.specialty ?? "—"} />
        </dl>
      </section>

      <SignOutButton />
    </div>
  );
};
