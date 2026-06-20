import { ChevronLeftIcon } from "@zenncore/icons";
import { Button } from "@zenncore/web/components/button";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const BackLink = ({
  href,
  children,
}: {
  href: Route;
  children: ReactNode;
}) => (
  <Button variant="ghost" color="neutral" render={<Link href={href} />}>
    <ChevronLeftIcon className="size-4" />
    {children}
  </Button>
);
