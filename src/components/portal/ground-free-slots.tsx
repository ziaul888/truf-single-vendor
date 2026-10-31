import Link from "next/link";
import { slotPriceLabel } from "@/lib/slot-format";
import type { PublicSlot } from "@/types/slot";

const pad = (n: number) => String(n).padStart(2, "0");

/** A ground's free slots on the searched date; each one goes straight to checkout. */
export function GroundFreeSlots({ groundId, date, slots }: { groundId: string; date: string; slots: PublicSlot[] }) {
  const free = slots.filter((s) => s.available);

  if (slots.length === 0) return <p className="text-xs text-muted-foreground">Closed on this day.</p>;
  if (free.length === 0) return <p className="text-xs text-muted-foreground">Fully booked on this day.</p>;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        {free.length} free {free.length === 1 ? "slot" : "slots"} <span className="font-normal">· ★ peak hour</span>
      </p>
      <ul className="flex flex-wrap gap-2">
        {free.map((s) => (
          <li key={s.startHour}>
            <Link
              href={`/checkout?${new URLSearchParams({ groundId, date, hour: String(s.startHour) })}`}
              className="flex flex-col items-center rounded-lg border px-3 py-1.5 text-center transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <span className="text-sm font-semibold tabular-nums">
                {pad(s.startHour)}:00{s.isPeak && <span className="text-accent"> ★</span>}
              </span>
              <span className="text-[10px] opacity-75">{slotPriceLabel(s.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
