import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { GROUNDS } from "@/lib/portal-stub-data";
import { FormatBadge } from "@/components/portal/format-badge";
import type { Booking } from "@/types/api";

const TABS = [
  { id: "upcoming", label: "Upcoming", count: 2 },
  { id: "past", label: "Past", count: 8 },
  { id: "cancelled", label: "Cancelled", count: 1 },
] as const;

const STATUS_LABELS: Record<Booking["status"], { label: string; className: string }> = {
  pending: { label: "Pending payment", className: "bg-warning/15 text-warning" },
  confirmed: { label: "Confirmed", className: "bg-success/15 text-success" },
  cancelled: { label: "Cancelled", className: "bg-destructive/15 text-destructive" },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground" },
};

// Stub bookings — replace with `await api.bookings.listMine(tab)`.
const STUB_BOOKINGS: Booking[] = [
  {
    id: "1", bookingNumber: "BK-2026-04830",
    groundId: GROUNDS[0]!.id,
    ground: GROUNDS[0]!,
    slotId: "s-1",
    slot: { date: "2026-05-02", startTime: "18:00", endTime: "19:00" },
    customerName: "—", customerEmail: "—", customerPhone: "—",
    amount: 1500, serviceFee: 50, total: 1550,
    status: "confirmed", createdAt: "2026-04-29T10:00:00Z",
  },
  {
    id: "2", bookingNumber: "BK-2026-04822",
    groundId: GROUNDS[4]!.id,
    ground: GROUNDS[4]!,
    slotId: "s-2",
    slot: { date: "2026-05-04", startTime: "09:00", endTime: "11:00" },
    customerName: "—", customerEmail: "—", customerPhone: "—",
    amount: 2400, serviceFee: 0, total: 2400,
    status: "pending", createdAt: "2026-04-29T11:00:00Z",
  },
];

export default async function MyBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "upcoming" } = await searchParams;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">My bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage upcoming matches and review past games at Champions Turf.
        </p>
      </header>

      <Tabs active={tab} />

      <div className="mt-6 space-y-3">
        {STUB_BOOKINGS.map((b) => (
          <BookingRow key={b.id} booking={b} />
        ))}
      </div>
    </div>
  );
}

function Tabs({ active }: { active: string }) {
  return (
    <nav
      aria-label="Booking status"
      className="flex gap-1 overflow-x-auto border-b"
    >
      {TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <Link
            key={t.id}
            href={`?tab=${t.id}`}
            scroll={false}
            className={`whitespace-nowrap px-4 py-2.5 text-sm transition-colors ${
              isActive
                ? "border-b-2 border-primary font-semibold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} ({t.count})
          </Link>
        );
      })}
    </nav>
  );
}

function BookingRow({ booking: b }: { booking: Booking }) {
  const status = STATUS_LABELS[b.status];
  const isPending = b.status === "pending";
  return (
    <article className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:p-5">
      <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl sm:w-28">
        <Image
          src={b.ground.images[0]!}
          alt={b.ground.name}
          fill
          sizes="112px"
          className="object-cover"
        />
        <FormatBadge format={b.ground.format} className="absolute left-2 top-2 text-[10px]" />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">{b.bookingNumber}</p>
            <h3 className="text-lg font-bold">{b.ground.name}</h3>
            <p className="mt-0.5 text-xs capitalize text-muted-foreground">
              {b.ground.sport} · {b.ground.format.replace("x", "×")}
            </p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.className}`}>
            {status.label}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-primary" /> {b.slot.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-primary" /> {b.slot.startTime} — {b.slot.endTime}
          </span>
          <span className="ml-auto font-bold">৳{b.total.toLocaleString()}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {isPending ? (
            <button className="rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:opacity-90">
              Complete payment
            </button>
          ) : (
            <button className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted">
              View receipt
            </button>
          )}
          <button className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted">
            Get directions
          </button>
          {!isPending && (
            <button className="ml-auto rounded-md border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/5">
              Cancel
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
