"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import * as Authentication from "@/server/app/authentication";

export const SignOutButton = () => {
  const router = useRouter();
  const [signOut, pending] = useAsyncAction(async () => {
    await Authentication.signOut();
    router.push("/sign-in" as Route);
  });

  return (
    <Button
      variant="outline"
      color="neutral"
      disabled={pending}
      onClick={() => signOut()}
    >
      Dil
    </Button>
  );
};
