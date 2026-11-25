"use client";

import { formatSlotDate } from "@/lib/slot-format";
import type { DateRange, ReportPeriod } from "@/hooks/useReports";
import { RangeTabs } from "./range-tabs";
import { DashboardPageHeader } from "@/components/features/dashboard/page-header";

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
    <DashboardPageHeader
      title={title}
      description={subtitle}
      details={<p className="text-xs text-muted-foreground">{formatSlotDate(period.from)} – {formatSlotDate(period.to)}</p>}
    >
      <RangeTabs value={range} onChange={onRange} />
    </DashboardPageHeader>
  );
}
