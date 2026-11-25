"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlobalSearch } from "@/components/global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { sectionTitle } from "@/components/section-title";
import { useMe } from "@/hooks/useMe";
import type { DashboardAudience } from "@/hooks/useMe";

export function Topbar({
  title,
  audience = "staff",
}: {
  title?: string;
  audience?: DashboardAudience;
}) {
  const { data: me } = useMe(audience);
  const pathname = usePathname();

  // Below lg the header clears the iOS status bar (full-screen app) and names the current section;
  // the Menu tab in the bottom bar opens the drawer.
  return (
    <header className="bg-card flex h-[calc(3.5rem+env(safe-area-inset-top))] shrink-0 items-center gap-2 border-b px-4 pt-[env(safe-area-inset-top)] max-lg:pl-[max(1rem,env(safe-area-inset-left))] max-lg:pr-[max(1rem,env(safe-area-inset-right))] sm:gap-4 md:px-6 lg:h-[calc(4rem+env(safe-area-inset-top))]">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none sm:shrink-0">
        <p className="text-foreground truncate text-base font-semibold lg:hidden">
          {sectionTitle(pathname)}
        </p>
        <p className="text-foreground hidden text-base font-semibold lg:block">
          {title ?? sectionTitle(pathname)}
        </p>
      </div>

      {/* Phones: the search trigger shrinks to an icon button; it opens the same palette. */}
      <div className="flex justify-center sm:flex-1 max-sm:[&>button]:w-11 max-sm:[&>button]:justify-center max-sm:[&>button]:px-0 max-sm:[&>button>span]:hidden">
        <GlobalSearch />
      </div>

      <div className="flex shrink-0 items-center gap-2 lg:gap-1">
        <ThemeToggle />
        <Link
          href="/dashboard/profile"
          aria-label="Profile"
          title={me ? `${me.name} (${me.role})` : undefined}
          className="focus-visible:ring-ring grid size-11 place-items-center rounded-full text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 lg:ml-1 lg:size-8"
        >
          <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full" aria-hidden>
            {me?.name.charAt(0).toUpperCase()}
          </span>
        </Link>
      </div>
    </header>
  );
}
