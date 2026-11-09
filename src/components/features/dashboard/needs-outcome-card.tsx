"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardAttention } from "@/hooks/useDashboard";
import { formatSlotDate, slotPriceLabel, slotTimeLabel } from "@/lib/slot-format";
import type { NeedsOutcomeBooking } from "@/types/dashboard";
import { NoShowDialog, type NoShowTarget } from "@/components/features/bookings/no-show-dialog";
import { CollectByIdDialog } from "./collect-by-id-dialog";

const underReview = (b: NeedsOutcomeBooking) => b.walletPayment?.status === "pending";

/**
 * "Needs outcome": bookings still pending after their slot ended. Staff collect (which confirms),
 * verify a bKash / Nagad payment on Confirm Bookings, or mark the booking no-show.
 */
export function NeedsOutcomeCard() {
  const { data, isLoading } = useDashboardAttention();
  const [collectId, setCollectId] = useState<string | null>(null);
  const [noShowTarget, setNoShowTarget] = useState<NoShowTarget | null>(null);

  if (isLoading || !data) return <div className="h-24 animate-pulse rounded-xl bg-muted" />;
  // Older APIs don't send it.
  if (!data.needsOutcome) return null;
  const { count, bookings = [] } = data.needsOutcome;

  return (
    <Card className={count > 0 ? "border-amber-300 dark:border-amber-500/40" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />Needs outcome
        </CardTitle>
        <span className="text-xl font-bold tabular-nums">{count}</span>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        {count === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing right now</p>
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground">Still pending after the slot ended: collect, verify or mark no-show.</p>
            <ul className="divide-y">
              {bookings.map((b) => (
                <OutcomeRow key={b.id} booking={b} onCollect={() => setCollectId(b.id)}
                  onNoShow={() => setNoShowTarget({ id: b.id, bookingNumber: b.bookingNumber, customerName: b.customerName, paid: b.paid, due: b.due })} />
              ))}
            </ul>
            {count > bookings.length && (
              <p className="mt-2 text-xs text-muted-foreground">Showing {bookings.length} of {count}, most recent first.</p>
            )}
          </>
        )}
      </CardContent>
      <CollectByIdDialog bookingId={collectId} onClose={() => setCollectId(null)} />
      <NoShowDialog booking={noShowTarget} open={noShowTarget !== null} onOpenChange={(v) => { if (!v) setNoShowTarget(null); }} />
    </Card>
  );
}

function OutcomeRow({ booking: b, onCollect, onNoShow }: { booking: NeedsOutcomeBooking; onCollect: () => void; onNoShow: () => void }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
      <div className="min-w-0">
        <Link href={`/dashboard/bookings/${b.id}`} className="font-mono text-xs hover:underline">{b.bookingNumber}</Link>
        <span className="ml-2 font-medium">{b.customerName}</span>
        <p className="text-xs text-muted-foreground">
          {b.groundName} · {formatSlotDate(b.slot.date)} {slotTimeLabel(b.slot)}
          {!underReview(b) && b.due > 0 && <> · <span className="text-amber-600 dark:text-amber-400">{slotPriceLabel(b.due)} due</span></>}
          {b.payAtVenue && " · Pay at venue"}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {underReview(b) ? (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
            <Link href="/dashboard/bookings/confirmed">Verify</Link>
          </Button>
        ) : (
          <>
            {b.due > 0 && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onCollect}>Collect</Button>}
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={onNoShow}>
              Mark no-show
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
