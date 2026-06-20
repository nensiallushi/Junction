"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import {
  TextField,
  TextFieldInput,
  TextFieldMaskToggle,
} from "@zenncore/web/components/text-field";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as Authentication from "@/server/app/authentication";

export const SignInForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [signIn, pending] = useAsyncAction(async () => {
    setError(null);
    const session = await Authentication.signIn({ email, password });
    if (session.success) router.push("/dashboard" as Route);
    else setError(session.error);
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        signIn();
      }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-2">
        <span className="font-medium text-foreground text-sm">Email</span>
        <TextField
          value={email}
          onValueChange={setEmail}
          className="border border-accent"
        >
          <TextFieldInput placeholder="ju@spitalint.al" />
        </TextField>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-medium text-foreground text-sm">Fjalëkalimi</span>
        <TextField
          type="password"
          value={password}
          onValueChange={setPassword}
          className="border border-accent"
        >
          <TextFieldInput placeholder="••••••••" />
          <TextFieldMaskToggle />
        </TextField>
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      <Button type="submit" color="primary" disabled={pending}>
        Hyr
      </Button>
    </form>
  );
};
