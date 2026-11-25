import { monthLabel } from "@/lib/series-format";
import { slotPriceLabel } from "@/lib/slot-format";
import { cn } from "@/lib/utils";
import type { BookingSeries, SeriesMonth } from "@/types/booking-series";

const bookingsText = (m: Pick<SeriesMonth, "bookings" | "cancelled">) =>
  `${m.bookings} ${m.bookings === 1 ? "booking" : "bookings"}${m.cancelled ? ` · ${m.cancelled} cancelled` : ""}`;

const dueClass = (due: number) => (due > 0 ? "font-semibold text-amber-600 dark:text-amber-400" : "text-muted-foreground");

/** Total, paid and due across the whole series. */
export function SeriesTotals({ totals }: { totals: BookingSeries["totals"] }) {
  const cells = [
    { label: "Total", value: slotPriceLabel(totals.total), className: "" },
    { label: "Paid", value: slotPriceLabel(totals.paid), className: "text-green-600 dark:text-green-400" },
    { label: "Due", value: slotPriceLabel(totals.due), className: dueClass(totals.due) },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {cells.map((c) => (
        <div key={c.label} className="rounded-lg bg-muted/50 px-2.5 py-2">
          <p className="text-[11px] text-muted-foreground">{c.label}</p>
          <p className={cn("text-sm font-semibold tabular-nums", c.className)}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}

/** Money per month: stacked rows on phones, a table from sm up (five columns don't fit 360px). */
export function SeriesMonths({ months }: { months: SeriesMonth[] }) {
  if (months.length === 0) return null;
  return (
    <>
      <ul className="divide-y rounded-lg border sm:hidden">
        {months.map((m) => (
          <li key={m.month} className="space-y-0.5 px-3 py-2.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{monthLabel(m.month)}</span>
              <span className={cn("tabular-nums", dueClass(m.due))}>{m.due > 0 ? `${slotPriceLabel(m.due)} due` : "Paid up"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {bookingsText(m)} · {slotPriceLabel(m.total)} · paid {slotPriceLabel(m.paid)}
            </p>
          </li>
        ))}
      </ul>
      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Month</th>
            <th className="py-2 font-medium">Bookings</th>
            <th className="py-2 text-right font-medium">Total</th>
            <th className="py-2 text-right font-medium">Paid</th>
            <th className="py-2 text-right font-medium">Due</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {months.map((m) => (
            <tr key={m.month}>
              <td className="py-2 font-medium">{monthLabel(m.month)}</td>
              <td className="py-2 text-muted-foreground">{bookingsText(m)}</td>
              <td className="py-2 text-right tabular-nums">{slotPriceLabel(m.total)}</td>
              <td className="py-2 text-right tabular-nums">{slotPriceLabel(m.paid)}</td>
              <td className={cn("py-2 text-right tabular-nums", dueClass(m.due))}>{slotPriceLabel(m.due)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
