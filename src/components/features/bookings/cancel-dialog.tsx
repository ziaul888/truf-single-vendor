"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useUpdateBookingStatus, type BookingRow } from "@/hooks/useBookings";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export function CancelDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: BookingRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [refund, setRefund] = useState(false);
  const update = useUpdateBookingStatus();

  function handleCancel() {
    if (!booking) return;
    update.mutate(
      { id: booking.id, status: "cancelled", refund },
      {
        onSuccess: () => {
          toast.success(`Booking ${booking.id} cancelled${refund ? " with full refund" : ""}`);
          onOpenChange(false);
          setRefund(false);
        },
        onError: () => toast.error("Failed to cancel booking"),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Cancel booking <span className="font-mono font-medium">{booking?.id}</span> for{" "}
            <span className="font-medium">{booking?.customerName}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-md border p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ground</span>
              <span className="font-medium">{booking?.groundName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date &amp; Time</span>
              <span className="font-medium">
                {booking ? new Date(booking.date).toLocaleDateString() : ""}{" "}
                {booking?.startTime}–{booking?.endTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{booking ? formatCurrency(booking.amount) : ""}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-md border p-3">
            <Checkbox id="refund" checked={refund} onCheckedChange={(v) => setRefund(Boolean(v))}
              disabled={booking?.paymentStatus !== "paid"} />
            <div>
              <Label htmlFor="refund" className="cursor-pointer font-medium">Issue full refund</Label>
              {booking?.paymentStatus !== "paid" && (
                <p className="text-xs text-muted-foreground">Only available for paid bookings</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Keep Booking</Button>
          <Button variant="destructive" onClick={handleCancel} disabled={update.isPending}>
            {update.isPending ? "Cancelling…" : "Cancel Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
