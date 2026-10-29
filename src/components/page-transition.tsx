"use client";

import { usePathname } from "next/navigation";

/**
 * Replays the enter animation on every pathname change. A template alone only
 * remounts when its direct child segment changes (/grounds → /grounds/[id] would
 * not animate), so the wrapper is keyed by the full path. Search-param changes
 * (filters, tabs) keep the same key and don't animate.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div key={pathname} className="page-enter">{children}</div>;
}
