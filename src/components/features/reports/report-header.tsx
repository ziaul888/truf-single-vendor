"use client";

import { formatSlotDate } from "@/lib/slot-format";
import type { DateRange, ReportPeriod } from "@/hooks/useReports";
import { RangeTabs } from "./range-tabs";

interface ReportHeaderProps {
  title: string;
  subtitle: string;
  range: DateRange;
  period: ReportPeriod;
  onRange: (r: DateRange) => void;
}

/** Title, the dates the numbers cover, and the range presets. */
export function ReportHeader({ title, subtitle, range, period, onRange }: ReportHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {subtitle} · {formatSlotDate(period.from)} – {formatSlotDate(period.to)}
        </p>
      </div>
      <RangeTabs value={range} onChange={onRange} />
    </div>
  );
}
