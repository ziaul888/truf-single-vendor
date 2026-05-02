"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useUpdateBookingStatus, type BookingRow } from "@/hooks/useBookings";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { paymentBadgeVariant } from "./booking-status-helpers";

export function ConfirmDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: BookingRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [markPaid, setMarkPaid] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const update = useUpdateBookingStatus();

  function handleConfirm() {
    if (!booking) return;
    update.mutate(
      { id: booking.id, status: "confirmed", paymentStatus: markPaid ? "paid" : undefined },
      {
        onSuccess: () => {
          toast.success(`Booking ${booking.id} confirmed${markPaid ? " & payment marked received" : ""}${sendEmail ? " — confirmation email queued" : ""}`);
          onOpenChange(false);
          setMarkPaid(false);
          setSendEmail(true);
        },
        onError: () => toast.error("Failed to confirm booking"),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />Confirm Booking
          </DialogTitle>
          <DialogDescription>
            Confirm booking <span className="font-mono font-medium">{booking?.id}</span> for{" "}
            <span className="font-medium">{booking?.customerName}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1.5">
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <Badge variant={paymentBadgeVariant(booking?.paymentStatus ?? "")} className="text-xs">
                {booking?.paymentStatus}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox id="markPaid" checked={markPaid} onCheckedChange={(v) => setMarkPaid(Boolean(v))}
                disabled={booking?.paymentStatus === "paid"} className="mt-0.5" />
              <div>
                <Label htmlFor="markPaid" className="cursor-pointer font-medium">Mark payment as received</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {booking?.paymentStatus === "paid" ? "Payment already recorded as paid" : "Record that cash/bank payment has been collected"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox id="sendEmail" checked={sendEmail} onCheckedChange={(v) => setSendEmail(Boolean(v))} className="mt-0.5" />
              <div>
                <Label htmlFor="sendEmail" className="cursor-pointer font-medium">Send confirmation email</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Notify the customer with booking details</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleConfirm} disabled={update.isPending}>
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            {update.isPending ? "Confirming…" : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
