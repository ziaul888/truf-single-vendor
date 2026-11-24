"use client";

import { Button } from "@/components/ui/button";
import type { DateRange } from "@/hooks/useReports";

const RANGES: { label: string; value: DateRange }[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "1 year", value: "1y" },
];

/** The date-range presets shown at the top of every report page. */
export function RangeTabs({ value, onChange }: { value: DateRange; onChange: (v: DateRange) => void }) {
  return (
    <div role="group" aria-label="Report date range" className="grid w-full grid-cols-4 gap-1 rounded-lg border p-1 md:flex md:w-auto">
      {RANGES.map((r) => (
        <Button key={r.value} variant={value === r.value ? "default" : "ghost"} size="sm" aria-pressed={value === r.value}
          className="h-auto whitespace-normal px-1 text-xs md:h-7 md:px-3" onClick={() => onChange(r.value)}>
          {r.label}
        </Button>
      ))}
    </div>
  );
}
