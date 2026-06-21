"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuPositioner,
  MenuSeparator,
  MenuTrigger,
} from "@zenncore/web/components/menu";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { initials, roleLabel } from "@/lib/medical";
import * as Authentication from "@/server/app/authentication";

/**
 * Top-right account chip → dropdown. Clicking the name opens Settings + the
 * sign-out action (the thing the user reaches for there). Styled with dark
 * tokens (the menu primitive defaults to a light palette).
 */
export const UserMenu = ({ user }: { user: Authentication.Type }) => {
  const router = useRouter();
  const [signOut, pending] = useAsyncAction(async () => {
    await Authentication.signOut();
    router.push("/sign-in" as Route);
  });

  return (
    <Menu>
      <MenuTrigger
        render={
          <button
            type="button"
            // Dark mode (base): solid blue chip + white text. Light mode keeps the
            // original translucent look via the [.light_&] overrides.
            className="flex items-center gap-2 rounded-pill border border-transparent bg-primary py-1 pr-4 pl-1 text-white transition-colors hover:bg-primary-rich data-popup-open:bg-primary-rich [.light_&]:border-accent/60 [.light_&]:bg-accent/40 [.light_&]:text-foreground [.light_&]:hover:bg-accent/60 [.light_&]:data-popup-open:bg-accent/60"
          />
        }
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-white/20 font-semibold text-white text-xs [.light_&]:bg-gradient-to-br [.light_&]:from-primary-rich [.light_&]:to-primary">
          {initials(user.name)}
        </span>
        <div className="hidden text-left sm:block">
          <p className="font-medium text-white text-xs [.light_&]:text-foreground">
            {user.name}
          </p>
          <p className="text-white/70 text-xs [.light_&]:text-caption">
            {roleLabel(user.role)}
          </p>
        </div>
      </MenuTrigger>

      <MenuPositioner align="end" sideOffset={8}>
        <MenuPopup className="min-w-48 rounded-card border border-accent bg-card py-1.5 text-foreground shadow-card outline-none">
          <div className="border-accent/60 border-b px-4 pb-2">
            <p className="truncate font-medium text-foreground text-sm">
              {user.name}
            </p>
            <p className="truncate text-caption text-xs">{user.email}</p>
          </div>
          <MenuItem
            className="mt-1 cursor-pointer text-foreground data-highlighted:text-foreground data-highlighted:before:bg-accent"
            render={<Link href={"/dashboard/settings" as Route} />}
          >
            Cilësimet
          </MenuItem>
          <MenuSeparator className="bg-accent/60" />
          <MenuItem
            disabled={pending}
            onClick={() => signOut()}
            className="cursor-pointer text-error data-highlighted:text-error data-highlighted:before:bg-error/15"
          >
            {pending ? "Po dilet…" : "Dil"}
          </MenuItem>
        </MenuPopup>
      </MenuPositioner>
    </Menu>
  );
};
