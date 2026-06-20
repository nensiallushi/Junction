import { PlusIcon } from "@zenncore/icons";
import { unwrapResult } from "@zenncore/utils";
import { Button } from "@zenncore/web/components/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { initials, roleLabel } from "@/lib/medical";
import * as Authentication from "@/server/app/authentication";
import * as Organization from "@/server/app/organization";
import { Environment } from "@/server/utils/environment";
import { AppNav } from "./_components/app-nav";

export default async ({ children }: PropsWithChildren) => {
  // gate: no session cookie → straight to the sign-in account picker.
  if (!(await unwrapResult(Authentication.isAuthenticated(Environment.SERVER))))
    redirect("/sign-in");

  const [user, organization] = await Promise.all([
    unwrapResult(Authentication.getCurrentUser(Environment.SERVER)),
    unwrapResult(Organization.current(Environment.SERVER)),
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background-dimmed">
      {/* ambient stage glow — DESIGN.md §9 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[18%] -left-40 size-[36rem] rounded-full bg-glow blur-3xl" />
        <div className="absolute -right-40 bottom-[12%] size-[36rem] rounded-full bg-glow blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen p-0 md:p-4">
        <div className="flex min-h-screen w-full overflow-hidden rounded-device border border-emphasis-dimmed bg-background shadow-card md:min-h-[calc(100vh-2rem)]">
          <AppNav user={user} />

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center justify-between gap-4 border-accent border-b bg-background-rich/40 px-6 py-4 backdrop-blur-xl">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground text-sm">
                  {organization?.name ?? "Mediscan"}
                </p>
                <p className="text-caption text-xs">
                  Imazheri diagnostike me AI
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="soft"
                  color="primary"
                  render={<Link href="/dashboard/upload" />}
                >
                  <PlusIcon className="size-4" />
                  Studim i ri
                </Button>
                <div className="flex items-center gap-2 rounded-pill bg-accent/60 py-1 pr-4 pl-1">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary font-semibold text-white text-xs">
                    {initials(user.name)}
                  </span>
                  <div className="hidden sm:block">
                    <p className="font-medium text-foreground text-xs">
                      {user.name}
                    </p>
                    <p className="text-caption text-xs">
                      {roleLabel(user.role)}
                    </p>
                  </div>
                </div>
              </div>
            </header>

            <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};
