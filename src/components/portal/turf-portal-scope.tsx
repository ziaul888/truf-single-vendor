"use client";

import Link from "next/link";
import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import { turfPortalPath } from "@/lib/turf-portal-path";

const PortalScope = createContext<{ slug: string; timezone: string } | undefined>(undefined);

export function TurfPortalScope({ slug, timezone, children }: { slug: string; timezone: string; children: ReactNode }) {
  return <PortalScope.Provider value={{ slug, timezone }}>{children}</PortalScope.Provider>;
}

export const useTurfPortal = () => useContext(PortalScope);

export function PortalLink({ href, ...props }: ComponentProps<typeof Link>) {
  const portal = useTurfPortal();
  const target = typeof href === "string" ? turfPortalPath(portal?.slug, href) : href;
  return <Link {...props} href={target} />;
}
