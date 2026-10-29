"use client";

import { Controller, type Control, type Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AddGroundFormData } from "@/schemas/ground";

/** "18:45" → "18:00". turf-api stores whole hours, so minutes snap to :00 as they're picked. */
const toWholeHour = (value: string) =>
  /^\d{2}:\d{2}$/.test(value) ? `${value.slice(0, 2)}:00` : value;

interface HourSelectProps {
  control: Control<AddGroundFormData>;
  name: Path<AddGroundFormData>;
  id?: string;
  invalid?: boolean;
  className?: string;
}

/** The browser's time picker, limited to whole hours. A closing time of 00:00 means midnight. */
export function HourSelect({ control, name, id, invalid, className }: HourSelectProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          id={id}
          type="time"
          step={3600}
          ref={field.ref}
          name={field.name}
          value={typeof field.value === "string" ? field.value : ""}
          onChange={(e) => field.onChange(toWholeHour(e.target.value))}
          onBlur={field.onBlur}
          className={cn(invalid && "border-destructive", className)}
        />
      )}
    />
  );
}
