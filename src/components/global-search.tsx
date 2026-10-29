"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { CalendarDays, CornerDownLeft, MapPin, Search, Users } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { navForRole, type NavGroup } from "@/components/sidebar-nav-data";
import { useMe } from "@/hooks/useMe";
import { useBookings } from "@/hooks/useBookings";
import { useCustomers } from "@/hooks/useCustomers";
import { useGrounds } from "@/hooks/useGrounds";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatSlotDate, slotTimeLabel } from "@/lib/slot-format";
import { cn } from "@/lib/utils";

interface PageEntry {
  label: string;
  href: string;
}

function flatPages(nav: NavGroup[]): PageEntry[] {
  const seen = new Set<string>();
  const out: PageEntry[] = [];
  for (const group of nav) {
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
}

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

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className={cn(
          "border-input bg-background text-muted-foreground inline-flex h-9 w-full max-w-md items-center gap-2 rounded-lg border px-3 text-sm shadow-sm transition-colors",
          "hover:border-ring/60 hover:text-foreground focus-visible:ring-ring/30 focus:outline-none focus-visible:ring-2"
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden flex-1 truncate text-left sm:inline">
          Search pages, customers, bookings…
        </span>
        <span className="flex-1 sm:hidden" />
        <kbd className="bg-muted text-muted-foreground hidden h-5 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium select-none sm:inline-flex">
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

const RESULT_LIMIT = 8;

function SearchPalette({ onSelect }: { onSelect: () => void }) {
  const { data: me } = useMe();
  const pages = useMemo(() => flatPages(navForRole(me?.role)), [me?.role]);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const term = useDebouncedValue(query.trim(), 300);
  const hasTerm = term.length > 0;

  // Customers and bookings are searched on the server, only once there's a query.
  const customers = useCustomers({ search: term, limit: RESULT_LIMIT }, { enabled: hasTerm });
  const bookings = useBookings({ search: term, limit: RESULT_LIMIT }, { enabled: hasTerm });
  const { data: grounds, isLoading: groundsLoading } = useGrounds();

  const isLoading =
    groundsLoading ||
    (hasTerm && (customers.isFetching || bookings.isFetching)) ||
    query.trim() !== term;

  const go = (href: string) => {
    onSelect();
    router.push(href);
  };

  const q = query.trim().toLowerCase();
  const matches = (text: string) => !q || text.toLowerCase().includes(q);
  const pageResults = pages.filter((p) => matches(p.label));
  const groundResults = (grounds ?? [])
    .filter((g) => matches(`${g.name} ${g.sport} ${g.address ?? ""}`))
    .slice(0, RESULT_LIMIT);
  const customerResults = hasTerm ? (customers.data?.data ?? []) : [];
  const bookingResults = hasTerm ? (bookings.data?.data ?? []) : [];

  return (
    <Command
      label="Global search"
      shouldFilter={false}
      className="[&_[cmdk-group-heading]]:text-muted-foreground flex max-h-[70vh] flex-col [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:uppercase"
    >
      <div className="flex items-center gap-2 border-b px-3.5">
        <Search className="text-muted-foreground h-4 w-4 shrink-0" />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search pages, customers, bookings, grounds…"
          className="placeholder:text-muted-foreground/70 flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <Command.List className="flex-1 overflow-x-hidden overflow-y-auto p-1">
        <Command.Empty className="text-muted-foreground py-8 text-center text-sm">
          {isLoading ? "Loading…" : "No results found."}
        </Command.Empty>

        {pageResults.length > 0 && (
          <Command.Group heading="Pages">
            {pageResults.map((p) => (
              <ResultItem
                key={p.href}
                value={`page ${p.href}`}
                onSelect={() => go(p.href)}
                icon={<CornerDownLeft className="h-4 w-4 text-violet-500" />}
                label={p.label}
                hint={p.href}
              />
            ))}
          </Command.Group>
        )}

        {customerResults.length > 0 && (
          <Command.Group heading="Customers">
            {customerResults.map((c) => (
              <ResultItem
                key={c.id}
                value={`customer ${c.id}`}
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
                value={`booking ${b.id}`}
                onSelect={() => go(`/dashboard/bookings/${b.id}`)}
                icon={<CalendarDays className="h-4 w-4 text-blue-500" />}
                label={`${b.bookingNumber} · ${b.contact.name || b.customer.name} · ${b.ground.name}`}
                hint={`${formatSlotDate(b.slot.date)} · ${slotTimeLabel(b.slot)}`}
              />
            ))}
          </Command.Group>
        )}

        {groundResults.length > 0 && (
          <Command.Group heading="Grounds">
            {groundResults.map((g) => (
              <ResultItem
                key={g.id}
                value={`ground ${g.id}`}
                onSelect={() => go(`/dashboard/grounds/${g.id}`)}
                icon={<MapPin className="h-4 w-4 text-emerald-500" />}
                label={g.name}
                hint={[g.sport, g.format?.replace("x", "×"), `${g.openingTime} – ${g.closingTime}`]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ))}
          </Command.Group>
        )}
      </Command.List>

      <div className="text-muted-foreground flex items-center justify-between border-t px-3 py-2 text-xs">
        <span>
          <kbd className="bg-muted mr-1 rounded border px-1 font-mono">↑↓</kbd>
          navigate
        </span>
        <span>
          <kbd className="bg-muted mr-1 rounded border px-1 font-mono">↵</kbd>
          open
        </span>
        <span>
          <kbd className="bg-muted mr-1 rounded border px-1 font-mono">esc</kbd>
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
      className="aria-selected:bg-accent aria-selected:text-accent-foreground flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm outline-none"
    >
      <span className="bg-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{label}</div>
        {hint && <div className="text-muted-foreground truncate text-xs">{hint}</div>}
      </div>
    </Command.Item>
  );
}
