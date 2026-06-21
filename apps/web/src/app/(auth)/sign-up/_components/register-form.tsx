"use client";

import { cn } from "@zenncore/utils";
import { useAsyncAction } from "@zenncore/utils/hooks";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import * as Authentication from "@/server/app/authentication";

type Mode = "hospital" | "pharmacist";

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <span className="font-medium text-sm text-white/80">{label}</span>
    {children}
  </div>
);

const inputClass =
  "h-10 w-full rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/40";

export const RegisterForm = () => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("hospital");
  const [org, setOrg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const valid =
    org.trim() !== "" &&
    name.trim() !== "" &&
    email.trim() !== "" &&
    password.length >= 4;

  const [submit, pending] = useAsyncAction(async () => {
    setError(null);
    const result =
      mode === "hospital"
        ? await Authentication.registerHospital({
            hospital: org,
            name,
            email,
            password,
          })
        : await Authentication.registerPharmacist({
            pharmacy: org,
            name,
            email,
            password,
          });
    if (result.success)
      router.push(
        (mode === "hospital" ? "/dashboard" : "/dashboard/pharmacy") as Route,
      );
    else setError(result.error);
  });

  return (
    <div className="w-full max-w-sm animate-fade-up rounded-3xl border border-white/12 bg-black/50 p-6 text-left shadow-2xl backdrop-blur-xl sm:p-8">
      <h2 className="font-semibold text-lg text-white">Regjistrohu</h2>
      <p className="mt-1 text-white/50 text-xs">
        Krijo një llogari të re — spital ose farmaci.
      </p>

      <div className="mt-4 flex gap-1 rounded-pill bg-white/5 p-1">
        {(["hospital", "pharmacist"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            className={cn(
              "flex-1 rounded-pill px-3 py-1.5 font-medium text-sm transition-colors",
              mode === option
                ? "bg-white text-black"
                : "text-white/60 hover:text-white",
            )}
          >
            {option === "hospital" ? "Spital" : "Farmaci"}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="mt-4 space-y-3"
      >
        <Field
          label={mode === "hospital" ? "Emri i spitalit" : "Emri i farmacisë"}
        >
          <input
            value={org}
            onChange={(event) => setOrg(event.target.value)}
            placeholder={
              mode === "hospital"
                ? "p.sh. Spitali Nënë Tereza"
                : "p.sh. Farmacia Qendrore"
            }
            className={inputClass}
          />
        </Field>

        <Field
          label={mode === "hospital" ? "Emri i administratorit" : "Emri yt"}
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="p.sh. Dr. Arben Hoxha"
            className={inputClass}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ju@shembull.al"
            className={inputClass}
          />
        </Field>

        <Field label="Fjalëkalimi">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </Field>

        {error && <p className="text-error text-sm">{error}</p>}

        <button
          type="submit"
          disabled={pending || !valid}
          className="w-full rounded-pill bg-white py-2.5 font-medium text-black text-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Po regjistrohet…" : "Krijo llogari"}
        </button>
      </form>

      <Link
        href={"/sign-in" as Route}
        className="mt-4 block text-white/45 text-xs transition-colors hover:text-white"
      >
        ← Ke llogari? Hyr
      </Link>
    </div>
  );
};
