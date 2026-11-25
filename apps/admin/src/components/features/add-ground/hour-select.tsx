"use client";

import { Controller, type Control } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { hourToTime } from "@/lib/ground-format";
import type { AddGroundFormData } from "@/schemas/ground";

type HourField =
  | "openingTime"
  | "closingTime"
  | `peakRanges.${number}.from`
  | `peakRanges.${number}.to`;

interface HourSelectProps {
  control: Control<AddGroundFormData>;
  name: HourField;
  id?: string;
  invalid?: boolean;
  className?: string;
}

/** Fixed hourly choices using the existing form values; an end time of 00:00 means midnight. */
export function HourSelect({ control, name, id, invalid, className }: HourSelectProps) {
  const isEndTime = name === "closingTime" || name.endsWith(".to");
  const hours = Array.from({ length: 24 }, (_, index) => index + (isEndTime ? 1 : 0));

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          name={field.name}
          value={field.value ?? ""}
          onValueChange={(value) => field.onChange(value === "clear" ? "" : value)}
        >
          <SelectTrigger
            id={id}
            ref={field.ref}
            onBlur={field.onBlur}
            aria-invalid={invalid || undefined}
            className={cn(
              "min-w-0 gap-2 px-3 text-left [&>svg]:shrink-0",
              invalid && "border-destructive",
              className
            )}
          >
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">Clear time</SelectItem>
            <SelectSeparator />
            {hours.map((hour) => (
              <SelectItem key={hour} value={hour === 24 ? "00:00" : hourToTime(hour)}>
                {hourToTime(hour)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
