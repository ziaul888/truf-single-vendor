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
    <div className="flex gap-1 rounded-lg border p-1">
      {RANGES.map((r) => (
        <Button key={r.value} variant={value === r.value ? "default" : "ghost"} size="sm" className="h-7 text-xs" onClick={() => onChange(r.value)}>
          {r.label}
        </Button>
      ))}
    </div>
  );
}
