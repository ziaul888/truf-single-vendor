"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { CalendarSlot, CalendarGround } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, User, Banknote, Wrench } from "lucide-react";

const LEGEND = [
  { status: "booked",    label: "Booked",          color: "bg-green-500",  text: "Confirmed & paid" },
  { status: "partial",   label: "Partial Payment",  color: "bg-amber-400",  text: "Advance paid, balance due" },
  { status: "blocked",   label: "Blocked",          color: "bg-gray-400",   text: "Maintenance / cleaning" },
  { status: "available", label: "Available",        color: "bg-blue-400",   text: "Free to book" },
] as const;

const GROUND_COLOR_CLASSES: Record<CalendarGround["color"], string> = {
  emerald: "bg-emerald-500",
  sky:     "bg-sky-500",
  violet:  "bg-violet-500",
  rose:    "bg-rose-500",
};

const STATUS_BADGE: Record<CalendarSlot["status"], string> = {
  booked:  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  blocked: "bg-gray-100  text-gray-600  dark:bg-gray-800     dark:text-gray-400",
};

const STATUS_ICON = {
  booked:  User,
  partial: Banknote,
  blocked: Wrench,
};

interface DayPanelProps {
  slots: CalendarSlot[];
  selectedDate: string;
  grounds: CalendarGround[];
  groundFilter: string;
  totalDailySlots: number;
  onGroundFilter: (id: string) => void;
}

function formatDay(dateStr: string) {
  if (!dateStr) return "No day selected";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function DayPanel({ slots, selectedDate, grounds, groundFilter, totalDailySlots, onGroundFilter }: DayPanelProps) {
  const daySlots = slots
    .filter((s) => s.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const availCount = Math.max(0, totalDailySlots - daySlots.length);

  return (
    <div className="flex flex-col gap-4">
      {/* Legend */}
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Legend</p>
        <div className="space-y-2">
          {LEGEND.map(({ status, label, color, text }) => (
            <div key={status} className="flex items-center gap-2.5">
              <div className={cn("h-3 w-3 shrink-0 rounded-sm", color)} />
              <div className="min-w-0">
                <span className="text-sm font-medium">{label}</span>
                <span className="ml-1.5 text-xs text-muted-foreground hidden xl:inline">{text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ground color filter */}
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Grounds</p>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onGroundFilter("all")}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
              groundFilter === "all" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/60 text-muted-foreground"
            )}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50 shrink-0" />
            All Grounds
          </button>
          {grounds.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onGroundFilter(g.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                groundFilter === g.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/60 text-muted-foreground"
              )}
            >
              <div className={cn("h-2.5 w-2.5 shrink-0 rounded-full", GROUND_COLOR_CLASSES[g.color])} />
              <span className="truncate">{g.name}</span>
              <span className="ml-auto text-[10px] capitalize opacity-60">{g.type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Day detail */}
      <div className="rounded-xl border bg-card p-4 flex-1">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {selectedDate ? formatDay(selectedDate) : "Select a day"}
          </p>
        </div>

        {!selectedDate ? (
          <p className="text-sm text-muted-foreground">Click any date on the calendar to see its slots.</p>
        ) : daySlots.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm font-medium">No bookings</p>
            <p className="text-xs text-muted-foreground mt-0.5">{availCount} slots available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {daySlots.map((s) => {
              const Icon = STATUS_ICON[s.status];
              return (
                <div key={s.id} className={cn("rounded-lg px-3 py-2.5 text-sm", STATUS_BADGE[s.status])}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Clock className="h-3 w-3 opacity-70" />
                      {s.startTime} – {s.endTime}
                    </div>
                    <span className="text-[10px] font-bold uppercase opacity-60">{s.status}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs opacity-80">
                    <Icon className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {s.status === "blocked"
                        ? (s.note ?? "Blocked")
                        : s.customerName}
                    </span>
                  </div>
                  {s.status !== "blocked" && s.amount && (
                    <div className="mt-1 text-[11px] opacity-70">
                      {s.groundName} · {formatCurrency(s.amount)}
                      {s.status === "partial" && s.advancePaid
                        ? ` (${formatCurrency(s.advancePaid)} paid)`
                        : ""}
                    </div>
                  )}
                  {s.status === "blocked" && (
                    <div className="mt-0.5 text-[11px] opacity-70">{s.groundName}</div>
                  )}
                </div>
              );
            })}

            <Separator />
            <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-400" />
              {availCount} slots still available
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
