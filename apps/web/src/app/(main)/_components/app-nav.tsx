"use client";

import { cn } from "@zenncore/utils";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  AdminIcon,
  ConsultIcon,
  DashboardIcon,
  HospitalIcon,
  MediscanMark,
  PatientsIcon,
  UploadStudyIcon,
  WorklistIcon,
} from "@/components/medical-icons";
import { initials, roleLabel } from "@/lib/medical";
import type * as Authentication from "@/server/app/authentication";

type Item = {
  href: Route;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  exact?: boolean;
};

const PRIMARY: Item[] = [
  { href: "/dashboard", label: "Paneli", Icon: DashboardIcon, exact: true },
  { href: "/dashboard/worklist", label: "Lista e punës", Icon: WorklistIcon },
  { href: "/dashboard/patients", label: "Pacientët", Icon: PatientsIcon },
  { href: "/dashboard/messages", label: "Mesazhet", Icon: ConsultIcon },
  { href: "/dashboard/upload", label: "Studim i ri", Icon: UploadStudyIcon },
];

const ADMIN: Item[] = [
  { href: "/dashboard/admin/doctors", label: "Mjekët", Icon: AdminIcon },
  {
    href: "/dashboard/admin/organization",
    label: "Organizata",
    Icon: HospitalIcon,
  },
];

const NavLink = ({ item, active }: { item: Item; active: boolean }) => (
  <Link
    href={item.href}
    className={cn(
      "group relative flex items-center gap-2 rounded-row px-4 py-2 font-medium text-sm transition-colors",
      active
        ? "bg-accent text-foreground"
        : "text-foreground-dimmed hover:bg-accent/50 hover:text-foreground",
    )}
  >
    {active && (
      <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-pill bg-primary" />
    )}
    <item.Icon className={cn("size-4", active && "text-primary")} />
    {item.label}
  </Link>
);

export const AppNav = ({ user }: { user: Authentication.Type }) => {
  const pathname = usePathname();
  const isActive = (item: Item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <nav className="hidden w-60 shrink-0 flex-col border-accent border-r bg-background-rich/40 backdrop-blur-xl md:flex">
      <Link href="/dashboard" className="flex items-center gap-2 px-6 py-6">
        <MediscanMark className="size-8" />
        <span className="font-semibold text-foreground text-lg">Mediscan</span>
      </Link>

      <div className="flex flex-1 flex-col gap-1 px-4">
        {PRIMARY.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item)} />
        ))}

        {user.role === "hospital_admin" && (
          <>
            <p className="px-4 pt-6 pb-2 font-medium text-caption text-xs uppercase tracking-wide">
              Administration
            </p>
            {ADMIN.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item)} />
            ))}
          </>
        )}
      </div>

      <Link
        href="/dashboard/settings"
        className="m-4 flex items-center gap-2 rounded-row p-2 transition-colors hover:bg-accent/50"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-white text-xs">
          {initials(user.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground text-sm leading-4">
            {user.name}
          </p>
          <p className="truncate text-caption text-xs">
            {roleLabel(user.role)}
          </p>
        </div>
      </Link>
    </nav>
  );
};
