"use client";

import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportSummary } from "@/hooks/useReports";
import { slotPriceLabel, venueToday } from "@/lib/slot-format";
import { PAYMENT_METHODS } from "@/types/booking";
import { PAYMENT_METHOD_LABEL } from "@/components/features/bookings/booking-status-helpers";

/** Today's money by payment method, net of refunds: what should be in the cash drawer. */
export function TodayMoney() {
  const today = venueToday();
  const { data, isLoading } = useReportSummary({ from: today, to: today });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" />Today&apos;s Money</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isLoading || !data ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-6 animate-pulse rounded bg-muted" />)}</div>
        ) : (
          <>
            {PAYMENT_METHODS.map((m) => (
              <div key={m} className="flex justify-between">
                <span className="text-muted-foreground">{PAYMENT_METHOD_LABEL[m]}</span>
                <span className="font-medium tabular-nums">{slotPriceLabel(data.revenueByMethod[m])}</span>
              </div>
            ))}
            {data.refunds > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Refunded today</span>
                <span className="tabular-nums text-red-500">− {slotPriceLabel(data.refunds)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-3 text-base font-bold">
              <span>Net today</span>
              <span className="tabular-nums">{slotPriceLabel(data.revenue)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Cash is what should be in the drawer from today&apos;s payments.</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
