"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlobalSearch } from "@/components/global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { sectionTitle } from "@/components/section-title";
import { useMe } from "@/hooks/useMe";

export function Topbar({ title }: { title?: string }) {
  const { data: me } = useMe();
  const pathname = usePathname();

  // Below lg the header clears the iOS status bar (full-screen app) and names the current section;
  // the Menu tab in the bottom bar opens the drawer.
  return (
    <header className="flex h-[calc(3.5rem_+_env(safe-area-inset-top))] shrink-0 items-center gap-4 border-b bg-card px-4 pt-[env(safe-area-inset-top)] md:px-6 lg:h-[calc(4rem_+_env(safe-area-inset-top))]">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none sm:shrink-0">
        <h2 className="truncate text-base font-semibold text-foreground lg:hidden">
          {sectionTitle(pathname)}
        </h2>
        <h2 className="hidden text-base font-semibold text-foreground lg:block">
          {title ?? "Dashboard"}
        </h2>
      </div>

      {/* Phones: the search trigger shrinks to an icon button; it opens the same palette. */}
      <div className="flex justify-center sm:flex-1 max-sm:[&>button]:w-9 max-sm:[&>button]:justify-center max-sm:[&>button]:px-0 max-sm:pointer-coarse:[&>button]:w-10 max-sm:[&>button>span]:hidden">
        <GlobalSearch />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        <Link
          href="/dashboard/profile"
          aria-label="Profile"
          title={me ? `${me.name} (${me.role})` : undefined}
          className="ml-1 flex h-8 w-8 pointer-coarse:h-10 pointer-coarse:w-10 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {me?.name.charAt(0).toUpperCase()}
        </Link>
      </div>
    </header>
  );
}
