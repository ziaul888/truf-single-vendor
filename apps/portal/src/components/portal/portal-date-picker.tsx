"use client";

import { useState, useSyncExternalStore } from "react";
import { format, isValid, parseISO } from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatSlotDate } from "@/lib/slot-format";
import { cn } from "@/lib/utils";

const MONTH_BUTTON =
  "no-press grid size-11 place-items-center rounded-md hover:bg-muted active:bg-muted aria-disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-ring";

const subscribeToHydration = () => () => {};

export function PortalDatePicker({ id, label, caption, defaultValue, min, max, className }: {
  id?: string;
  label: string;
  caption?: string;
  defaultValue: string;
  min: string;
  max?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(() =>
    isValid(parseISO(defaultValue)) && defaultValue >= min && (!max || defaultValue <= max)
      ? defaultValue
      : min,
  );
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const dateLabel = formatSlotDate(value);

  // Keep the native form control available before hydration and when scripts are disabled.
  if (!hydrated) {
    return (
      <input
        id={id}
        name="date"
        type="date"
        aria-label={label}
        min={min}
        max={max}
        defaultValue={value}
        required
        className={cn("min-h-11 min-w-0 text-base sm:text-sm", className)}
      />
    );
  }

  const selected = parseISO(value);
  const earliest = parseISO(min);
  const latest = max ? parseISO(max) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <input type="hidden" name="date" value={value} />
      <PopoverTrigger
        id={id}
        type="button"
        aria-label={`${label}, ${dateLabel}`}
        className={cn(
          "no-press flex min-h-11 min-w-0 items-center gap-2 text-left text-sm font-medium active:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          className,
        )}
      >
        <CalendarDays className="pointer-events-none size-4 shrink-0 text-primary" aria-hidden />
        <span className="min-w-0">
          {caption && <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{caption}</span>}
          <span className="block truncate">{dateLabel}</span>
        </span>
        <ChevronDown className="pointer-events-none ml-auto size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={label}
        collisionPadding={12}
        sideOffset={8}
        className="max-h-(--radix-popover-content-available-height) w-[min(21rem,calc(100vw-1.5rem))] overflow-y-auto rounded-xl p-2 motion-reduce:animate-none"
      >
        <DayPicker
          mode="single"
          required
          autoFocus
          today={earliest}
          selected={selected}
          defaultMonth={selected}
          startMonth={earliest}
          endMonth={latest}
          disabled={latest ? [{ before: earliest }, { after: latest }] : { before: earliest }}
          onSelect={(date) => {
            setValue(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
          navLayout="after"
          classNames={{
            month: "relative",
            month_caption: "flex h-11 items-center pl-2 pr-24 text-sm font-semibold",
            nav: "absolute right-0 top-0 flex",
            button_previous: MONTH_BUTTON,
            button_next: MONTH_BUTTON,
            chevron: "pointer-events-none size-4 fill-current",
            month_grid: "w-full table-fixed border-collapse text-center",
            weekday: "h-8 text-xs font-medium text-muted-foreground",
            day: "p-0 text-sm",
            day_button: "no-press inline-flex h-11 w-full items-center justify-center rounded-md enabled:hover:bg-muted enabled:active:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring disabled:opacity-35",
            selected: "[&>button]:bg-primary [&>button]:font-semibold [&>button]:text-primary-foreground [&>button:hover]:bg-primary/90 [&>button:active]:bg-primary/90",
            today: "font-bold text-primary",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
