"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, DollarSign } from "lucide-react";
import { slotPriceLabel } from "@/lib/slot-format";
import type { CustomerDetail } from "@/types/booking";
import { formatDate } from "./customer-display";

export type DuePayment = CustomerDetail["duePayments"][number];

export function CustomerDuePayments({
  duePayments,
  onCollect,
}: {
  duePayments: DuePayment[];
  onCollect: (due: DuePayment) => void;
}) {
  if (!duePayments.length) return null;

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />Due payments
          </CardTitle>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">{duePayments.length} pending</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {duePayments.map((dp) => (
          <div key={dp.bookingId} className="flex items-center justify-between rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{slotPriceLabel(dp.amount)}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                <Link href={`/dashboard/bookings/${dp.bookingId}`} className="font-mono hover:underline">{dp.bookingNumber}</Link>
                {dp.dueDate ? ` · Due ${formatDate(dp.dueDate)}` : ""}
              </p>
            </div>
            <Button size="sm" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white" onClick={() => onCollect(dp)}>
              <DollarSign className="mr-1 h-3.5 w-3.5" /> Collect
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
