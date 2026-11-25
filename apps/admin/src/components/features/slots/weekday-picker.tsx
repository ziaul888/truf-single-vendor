"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { WEEKDAYS, type Weekday } from "@/types/ground";

/** Weekday chips for a recurring block; the whole chip is the tap target. */
export function WeekdayPicker({ value, onToggle }: { value: Weekday[]; onToggle: (day: Weekday, on: boolean) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {WEEKDAYS.map((day) => {
        const checked = value.includes(day);
        return (
          <label key={day} className={cn("flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 pointer-coarse:py-2.5 text-sm font-medium capitalize transition-colors", checked ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted")}>
            <Checkbox checked={checked} onCheckedChange={(v) => onToggle(day, v === true)} className="h-3.5 w-3.5" />
            {day}
          </label>
        );
      })}
    </div>
  );
}
