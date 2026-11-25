"use client";

import Link from "next/link";
import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import { turfPortalPath } from "@/lib/turf-portal-path";

interface PortalContext {
  slug?: string;
  timezone?: string;
  homePath: string;
}

const PortalScope = createContext<PortalContext | undefined>(undefined);

export function TurfPortalScope({ slug, timezone, homePath, children }: PortalContext & { children: ReactNode }) {
  return <PortalScope.Provider value={{ slug, timezone, homePath }}>{children}</PortalScope.Provider>;
}

export const useTurfPortal = () => useContext(PortalScope);

export function PortalLink({ href, ...props }: ComponentProps<typeof Link>) {
  const portal = useTurfPortal();
  if (typeof href !== "string") return <Link {...props} href={href} />;
  const target = portal && (href === "/" || href.startsWith("/#"))
    ? `${portal.homePath}${href.slice(1)}`
    : turfPortalPath(portal?.slug, href);
  return <Link {...props} href={target} />;
}
