"use client";

import { cn } from "@/lib/utils";
import type { CalendarSlot } from "@/types";

const HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);

const STATUS_CELL: Record<CalendarSlot["status"], string> = {
  booked:  "bg-green-100  border-l-2 border-l-green-500  text-green-800  dark:bg-green-900/40  dark:text-green-300",
  partial: "bg-amber-100  border-l-2 border-l-amber-500  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300",
  blocked: "bg-gray-100   border-l-2 border-l-gray-400   text-gray-500   dark:bg-gray-800      dark:text-gray-400",
};

function getWeekDays(anyDate: Date): { date: Date; dateStr: string }[] {
  const d = new Date(anyDate);
  const dow = (d.getDay() + 6) % 7; // Mon = 0
  d.setDate(d.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    return { date: day, dateStr };
  });
}

const DAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeekGridProps {
  slots: CalendarSlot[];
  selectedDate: string;
  currentWeekDate: Date;
  onSelectDate: (date: string) => void;
}

export function WeekGrid({ slots, selectedDate, currentWeekDate, onSelectDate }: WeekGridProps) {
  const weekDays = getWeekDays(currentWeekDate);
  const todayStr = new Date().toISOString().split("T")[0];

  const slotMap = new Map<string, CalendarSlot>();
  for (const s of slots) slotMap.set(`${s.date}|${s.startTime}`, s);

  const COLS = `60px repeat(7, 1fr)`;

  return (
    <div className="rounded-xl border overflow-hidden bg-card">
      {/* Column headers */}
      <div className="grid border-b bg-muted/40 sticky top-0 z-10" style={{ gridTemplateColumns: COLS }}>
        <div className="border-r py-3" />
        {weekDays.map(({ date, dateStr }, i) => {
          const isToday    = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "flex flex-col items-center py-3 text-center transition-colors hover:bg-muted/60 cursor-pointer",
                i < 6 && "border-r",
                isSelected && "bg-purple-50 dark:bg-purple-950/20",
              )}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {DAY_ABBR[i]}
              </span>
              <span className={cn(
                "mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
                isToday    ? "bg-primary text-primary-foreground" : "",
                isSelected && !isToday ? "bg-purple-500 text-white" : "",
              )}>
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time rows */}
      <div className="overflow-y-auto max-h-[520px]">
        {HOURS.map((hour) => (
          <div key={hour} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: COLS }}>
            {/* Time label */}
            <div className="border-r flex items-start justify-end pr-2 pt-1">
              <span className="text-[11px] text-muted-foreground tabular-nums">{hour}</span>
            </div>

            {/* Day cells */}
            {weekDays.map(({ dateStr }, i) => {
              const slot = slotMap.get(`${dateStr}|${hour}`);
              const isSelected = dateStr === selectedDate;
              return (
                <div
                  key={dateStr}
                  onClick={() => onSelectDate(dateStr)}
                  className={cn(
                    "min-h-[38px] cursor-pointer p-0.5 transition-colors hover:bg-muted/20",
                    i < 6 && "border-r",
                    isSelected && "bg-purple-50/30 dark:bg-purple-950/10",
                  )}
                >
                  {slot && (
                    <div className={cn(
                      "h-full min-h-[34px] rounded-md px-2 py-1 text-[11px] font-medium leading-tight",
                      STATUS_CELL[slot.status],
                    )}>
                      <div className="font-semibold truncate">
                        {slot.status === "blocked" ? (slot.note ?? "Blocked") : slot.customerName}
                      </div>
                      <div className="opacity-70 text-[10px]">{slot.groundName}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
