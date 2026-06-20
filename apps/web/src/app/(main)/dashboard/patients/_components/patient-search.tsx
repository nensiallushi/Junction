"use client";

import { useDebounceCallback } from "@zenncore/utils/hooks";
import { TextField, TextFieldInput } from "@zenncore/web/components/text-field";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const PatientSearch = ({ initial }: { initial: string }) => {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  const push = useDebounceCallback((query: string) => {
    router.replace(
      (query
        ? `/dashboard/patients?query=${encodeURIComponent(query)}`
        : "/dashboard/patients") as Route,
    );
  }, 300);

  return (
    <TextField
      value={value}
      onValueChange={(next: string) => {
        setValue(next);
        push(next);
      }}
      className="max-w-sm border border-accent"
    >
      <TextFieldInput placeholder="Kërko sipas emrit ose MRN…" />
    </TextField>
  );
};
