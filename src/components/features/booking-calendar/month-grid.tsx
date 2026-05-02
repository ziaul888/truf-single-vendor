"use client";

import { cn } from "@/lib/utils";
import type { CalendarSlot } from "@/types";

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_PILL: Record<CalendarSlot["status"], string> = {
  booked:  "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  partial: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  blocked: "bg-gray-100  text-gray-500  dark:bg-gray-800    dark:text-gray-400 italic",
};

function getCalendarCells(year: number, month: number) {
  const first  = new Date(year, month, 1);
  const last   = new Date(year, month + 1, 0);
  const offset = (first.getDay() + 6) % 7; // Mon = 0
  const cells: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = offset; i > 0; i--)
    cells.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false });
  for (let i = 1; i <= last.getDate(); i++)
    cells.push({ date: new Date(year, month, i), isCurrentMonth: true });
  while (cells.length % 7 !== 0)
    cells.push({ date: new Date(year, month + 1, cells.length - offset - last.getDate() + 1), isCurrentMonth: false });

  return cells;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface MonthGridProps {
  slots: CalendarSlot[];
  selectedDate: string;
  currentMonth: Date;
  totalDailySlots: number;
  onSelectDate: (date: string) => void;
}

export function MonthGrid({ slots, selectedDate, currentMonth, totalDailySlots, onSelectDate }: MonthGridProps) {
  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const cells = getCalendarCells(year, month);
  const todayStr = toDateStr(new Date());

  const slotsByDate = new Map<string, CalendarSlot[]>();
  for (const s of slots) {
    const arr = slotsByDate.get(s.date) ?? [];
    arr.push(s);
    slotsByDate.set(s.date, arr);
  }

  return (
    <div className="rounded-xl border overflow-hidden bg-card">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map(({ date, isCurrentMonth }, i) => {
          const dateStr      = toDateStr(date);
          const daySlots     = slotsByDate.get(dateStr) ?? [];
          const isToday      = dateStr === todayStr;
          const isSelected   = dateStr === selectedDate;
          const occupied     = daySlots.length;
          const availCount   = isCurrentMonth ? Math.max(0, totalDailySlots - occupied) : 0;
          const visible      = daySlots.slice(0, 2);
          const overflow     = daySlots.length - visible.length;
          const hasRightBorder = i % 7 !== 6;
          const hasBottomBorder = i < cells.length - 7;

          return (
            <div
              key={dateStr + i}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "min-h-[96px] cursor-pointer p-1.5 transition-colors hover:bg-muted/30 select-none",
                hasRightBorder  && "border-r",
                hasBottomBorder && "border-b",
                !isCurrentMonth && "bg-muted/10 opacity-50",
                isToday         && "bg-primary/5",
                isSelected      && "ring-2 ring-inset ring-purple-400 bg-purple-50/50 dark:bg-purple-950/20",
              )}
            >
              {/* Date number row */}
              <div className="mb-1 flex items-center justify-between">
                <span className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[13px] leading-none",
                  isToday    ? "bg-primary text-primary-foreground font-bold" : "font-semibold",
                  isSelected && !isToday && "bg-purple-500 text-white",
                  !isCurrentMonth && "text-muted-foreground font-normal",
                )}>
                  {date.getDate()}
                </span>
                {availCount > 0 && isCurrentMonth && (
                  <span className="text-[10px] font-semibold text-blue-500 dark:text-blue-400">
                    {availCount} free
                  </span>
                )}
              </div>

              {/* Slot pills */}
              <div className="space-y-0.5">
                {visible.map((s) => (
                  <div
                    key={s.id}
                    className={cn("truncate rounded px-1.5 py-[2px] text-[11px] font-medium leading-tight", STATUS_PILL[s.status])}
                    title={s.customerName ?? s.note ?? s.status}
                  >
                    {s.startTime}{" "}
                    {s.status === "blocked"
                      ? (s.note ?? "Blocked")
                      : (s.customerName ?? s.status)}
                  </div>
                ))}
                {overflow > 0 && (
                  <div className="px-1.5 text-[10px] text-muted-foreground">+{overflow} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
