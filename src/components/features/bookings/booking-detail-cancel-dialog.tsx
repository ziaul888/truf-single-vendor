"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bookingId: string;
  customerName: string;
  groundName: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  paymentStatus: string;
  isPending: boolean;
  onConfirm: (refund: boolean) => void;
}

export function BookingDetailCancelDialog({
  open, onOpenChange, bookingId, customerName, groundName,
  date, startTime, endTime, amount, paymentStatus, isPending, onConfirm,
}: Props) {
  const [refund, setRefund] = useState(false);

  function handleConfirm() {
    onConfirm(refund);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Cancel booking <span className="font-mono font-medium">{bookingId}</span> for{" "}
            <span className="font-medium">{customerName}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-md border p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ground</span>
              <span className="font-medium">{groundName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date &amp; Time</span>
              <span className="font-medium">{formatDate(date)} {startTime}–{endTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{formatCurrency(amount)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-md border p-3">
            <Checkbox id="refund-detail" checked={refund} onCheckedChange={(v) => setRefund(Boolean(v))}
              disabled={paymentStatus !== "paid"} />
            <div>
              <Label htmlFor="refund-detail" className="cursor-pointer font-medium">Issue full refund</Label>
              {paymentStatus !== "paid" && (
                <p className="text-xs text-muted-foreground">Only available for paid bookings</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Keep Booking</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Cancelling…" : "Cancel Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
