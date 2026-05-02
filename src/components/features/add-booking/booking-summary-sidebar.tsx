"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { CalendarDays, Clock, ReceiptText, TrendingDown, TrendingUp } from "lucide-react";
import type { Ground } from "@/hooks/useGrounds";
import type { TimeSlot } from "@/hooks/useAddBooking";
import { cn } from "@/lib/utils";

interface BookingSummarySidebarProps {
  ground?: Ground;
  slot?: TimeSlot;
  date: string;
  bookingType: "online" | "offline";
  paymentType: "full" | "partial";
  advanceAmount: number;
}

const TYPE_LABEL: Record<string, string> = {
  football: "⚽ Football", cricket: "🏏 Cricket", badminton: "🏸 Badminton",
  tennis: "🎾 Tennis", basketball: "🏀 Basketball", hockey: "🏑 Hockey",
};

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium tabular-nums", highlight && "text-primary font-semibold")}>{value}</span>
    </div>
  );
}

export function BookingSummarySidebar({
  ground, slot, date, bookingType, paymentType, advanceAmount,
}: BookingSummarySidebarProps) {
  const pricePerHour = ground?.pricePerHour ?? 0;
  const totalAmount = pricePerHour;
  const dueAmount = Math.max(0, totalAmount - advanceAmount);
  const isPartial = bookingType === "offline" && paymentType === "partial";

  const formattedDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "short", day: "numeric",
      })
    : null;

  return (
    <Card className="overflow-hidden">
      {/* Gradient header */}
      <div className={cn(
        "px-5 py-5 text-primary-foreground",
        "bg-gradient-to-br from-primary via-primary to-primary/80"
      )}>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-70 mb-2">
          Booking Summary
        </p>
        {ground ? (
          <>
            <h3 className="text-xl font-bold leading-tight">{ground.name}</h3>
            <p className="mt-1 text-sm opacity-80">
              {TYPE_LABEL[ground.type] ?? ground.type} · {ground.size}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs opacity-70">
              <span>Capacity {ground.capacity}</span>
              <span>·</span>
              <span>{ground.openingTime} – {ground.closingTime}</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-1 opacity-60">
            <div className="h-5 w-32 rounded bg-white/20" />
            <div className="h-3.5 w-24 rounded bg-white/15 mt-1" />
          </div>
        )}
      </div>

      {/* Date & Slot */}
      <div className="px-5 py-4 space-y-2.5 border-b">
        <div className="flex items-center gap-2.5 text-sm">
          <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
          {formattedDate ? (
            <span className="font-medium">{formattedDate}</span>
          ) : (
            <span className="text-muted-foreground italic">No date selected</span>
          )}
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          {slot ? (
            <span className="font-medium">
              {slot.startTime} – {slot.endTime}
              <span className="ml-2 text-xs font-normal text-muted-foreground">1 hour</span>
            </span>
          ) : (
            <span className="text-muted-foreground italic">No slot selected</span>
          )}
        </div>
      </div>

      {/* Amount breakdown */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <ReceiptText className="h-3.5 w-3.5" />
          Amount Breakdown
        </div>
        <Row label="Price / hour" value={ground ? formatCurrency(pricePerHour) : "—"} />
        <Row label="Duration" value={slot ? "1 hour" : "—"} />
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Total</span>
          <span className={cn(
            "text-2xl font-bold transition-all",
            ground ? "text-primary" : "text-muted-foreground"
          )}>
            {ground ? formatCurrency(totalAmount) : "—"}
          </span>
        </div>
      </div>

      {/* Partial payment breakdown */}
      {isPartial && advanceAmount > 0 && (
        <div className="border-t bg-amber-50/80 dark:bg-amber-950/20 px-5 py-4 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Payment Split
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              Advance paid
            </span>
            <span className="font-semibold text-green-600">{formatCurrency(advanceAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingDown className="h-3.5 w-3.5 text-amber-600" />
              Balance due
            </span>
            <span className="font-semibold text-amber-600">{formatCurrency(dueAmount)}</span>
          </div>
        </div>
      )}

      {/* Booking type chip */}
      <div className="border-t px-5 py-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Booking via</span>
        <span className={cn(
          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
          bookingType === "offline"
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary/10 text-primary"
        )}>
          {bookingType === "offline" ? "Offline / Admin" : "Online · Stripe"}
        </span>
      </div>
    </Card>
  );
}
