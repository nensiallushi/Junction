"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { SignInForm } from "./sign-in-form";

export const SignInCta = () => {
  const [open, setOpen] = useState(false);

  if (open)
    return (
      <div className="w-full max-w-sm animate-fade-up rounded-3xl border border-white/12 bg-black/50 p-6 text-left shadow-2xl backdrop-blur-xl sm:p-8">
        <SignInForm />
        <div className="mt-5 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-white/45 transition-colors hover:text-white"
          >
            ← Kthehu
          </button>
          <Link
            href={"/sign-up" as Route}
            className="text-white/60 transition-colors hover:text-white"
          >
            Regjistrohu
          </Link>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-pill bg-white px-7 py-3 font-medium text-black text-sm shadow-black/20 shadow-lg transition-all hover:shadow-xl"
      >
        Hyr në llogari
      </button>
      <Link
        href={"/sign-up" as Route}
        className="text-sm text-white/60 transition-colors hover:text-white"
      >
        Nuk ke llogari?{" "}
        <span className="font-medium text-white underline underline-offset-4">
          Regjistrohu
        </span>
      </Link>
    </div>
  );
};
