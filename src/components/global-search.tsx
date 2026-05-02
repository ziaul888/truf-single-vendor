"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  CalendarDays,
  CornerDownLeft,
  MapPin,
  Search,
  Users,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { NAV } from "@/components/sidebar-nav-data";
import { useBookings } from "@/hooks/useBookings";
import { useCustomers } from "@/hooks/useCustomers";
import { useGrounds } from "@/hooks/useGrounds";
import { cn } from "@/lib/utils";

interface PageEntry {
  label: string;
  href: string;
}

const FLAT_PAGES: PageEntry[] = (() => {
  const seen = new Set<string>();
  const out: PageEntry[] = [];
  for (const group of NAV) {
    for (const item of group.items) {
      if (!seen.has(item.href)) {
        seen.add(item.href);
        out.push({ label: item.label, href: item.href });
      }
      item.children?.forEach((c) => {
        if (!seen.has(c.href)) {
          seen.add(c.href);
          out.push({ label: `${item.label} › ${c.label}`, href: c.href });
        }
      });
    }
  }
  return out;
})();

export function GlobalSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className={cn(
          "inline-flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors",
          "hover:border-ring/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden flex-1 truncate text-left sm:inline">
          Search pages, customers, bookings…
        </span>
        <span className="flex-1 sm:hidden" />
        <kbd className="hidden h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Search</DialogTitle>
          {open && <SearchPalette onSelect={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchPalette({ onSelect }: { onSelect: () => void }) {
  const router = useRouter();
  const { data: customers, isLoading: customersLoading } = useCustomers();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { data: grounds, isLoading: groundsLoading } = useGrounds();

  const customerList = customers?.customers ?? [];
  const bookingList = bookings ?? [];
  const groundList = grounds ?? [];

  const isLoading = customersLoading || bookingsLoading || groundsLoading;

  const go = (href: string) => {
    onSelect();
    router.push(href);
  };

  // Limit results per group to keep the palette snappy and scannable.
  const customerResults = useMemo(() => customerList.slice(0, 8), [customerList]);
  const bookingResults = useMemo(() => bookingList.slice(0, 8), [bookingList]);
  const groundResults = useMemo(() => groundList.slice(0, 8), [groundList]);

  return (
    <Command
      label="Global search"
      className="flex max-h-[70vh] flex-col [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground"
    >
      <div className="flex items-center gap-2 border-b px-3.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Command.Input
          placeholder="Search pages, customers, bookings, grounds…"
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <Command.List className="flex-1 overflow-y-auto overflow-x-hidden p-1">
        <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
          {isLoading ? "Loading…" : "No results found."}
        </Command.Empty>

        <Command.Group heading="Pages">
          {FLAT_PAGES.map((p) => (
            <ResultItem
              key={p.href}
              value={`page ${p.label}`}
              onSelect={() => go(p.href)}
              icon={<CornerDownLeft className="h-4 w-4 text-violet-500" />}
              label={p.label}
              hint={p.href}
            />
          ))}
        </Command.Group>

        {customerResults.length > 0 && (
          <Command.Group heading="Customers">
            {customerResults.map((c) => (
              <ResultItem
                key={c.id}
                value={`customer ${c.name} ${c.phone} ${c.email}`}
                onSelect={() => go(`/dashboard/customers/${c.id}`)}
                icon={<Users className="h-4 w-4 text-pink-500" />}
                label={c.name}
                hint={`${c.phone} · ${c.email}`}
              />
            ))}
          </Command.Group>
        )}

        {bookingResults.length > 0 && (
          <Command.Group heading="Bookings">
            {bookingResults.map((b) => (
              <ResultItem
                key={b.id}
                value={`booking ${b.customerName} ${b.groundName} ${b.date}`}
                onSelect={() => go(`/dashboard/bookings/${b.id}`)}
                icon={<CalendarDays className="h-4 w-4 text-blue-500" />}
                label={`${b.customerName} · ${b.groundName}`}
                hint={`${b.date} · ${b.startTime}–${b.endTime}`}
              />
            ))}
          </Command.Group>
        )}

        {groundResults.length > 0 && (
          <Command.Group heading="Grounds">
            {groundResults.map((g) => (
              <ResultItem
                key={g.id}
                value={`ground ${g.name} ${g.type}`}
                onSelect={() => go(`/dashboard/grounds/${g.id}`)}
                icon={<MapPin className="h-4 w-4 text-emerald-500" />}
                label={g.name}
                hint={`${g.type} · ${g.size}`}
              />
            ))}
          </Command.Group>
        )}
      </Command.List>

      <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
        <span>
          <kbd className="mr-1 rounded border bg-muted px-1 font-mono">↑↓</kbd>
          navigate
        </span>
        <span>
          <kbd className="mr-1 rounded border bg-muted px-1 font-mono">↵</kbd>
          open
        </span>
        <span>
          <kbd className="mr-1 rounded border bg-muted px-1 font-mono">esc</kbd>
          close
        </span>
      </div>
    </Command>
  );
}

function ResultItem({
  value,
  onSelect,
  icon,
  label,
  hint,
}: {
  value: string;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{label}</div>
        {hint && (
          <div className="truncate text-xs text-muted-foreground">{hint}</div>
        )}
      </div>
    </Command.Item>
  );
}
