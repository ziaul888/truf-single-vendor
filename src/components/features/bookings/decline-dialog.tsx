"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useUpdateBookingStatus, type BookingRow } from "@/hooks/useBookings";
import { XCircle } from "lucide-react";
import { toast } from "sonner";

export function DeclineDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: BookingRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [refund, setRefund] = useState(false);
  const update = useUpdateBookingStatus();

  function handleDecline() {
    if (!booking) return;
    update.mutate(
      { id: booking.id, status: "cancelled", refund },
      {
        onSuccess: () => {
          toast.success(`Booking ${booking.id} declined${refund ? " with refund" : ""}${notifyCustomer ? " — customer notified" : ""}`);
          onOpenChange(false);
          setReason("");
          setNotifyCustomer(true);
          setRefund(false);
        },
        onError: () => toast.error("Failed to decline booking"),
      }
    );
  }

  const hasPaid = booking?.paymentStatus === "paid" || booking?.paymentStatus === "partial";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />Decline Booking
          </DialogTitle>
          <DialogDescription>
            Decline booking <span className="font-mono font-medium">{booking?.id}</span> from{" "}
            <span className="font-medium">{booking?.customerName}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g. Ground maintenance scheduled, slot no longer available…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <Separator />

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox id="notifyCustomer" checked={notifyCustomer} onCheckedChange={(v) => setNotifyCustomer(Boolean(v))} className="mt-0.5" />
              <div>
                <Label htmlFor="notifyCustomer" className="cursor-pointer font-medium">Notify customer via email</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Send a decline notification with reason</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox id="refundDecline" checked={refund} onCheckedChange={(v) => setRefund(Boolean(v))} disabled={!hasPaid} className="mt-0.5" />
              <div>
                <Label htmlFor="refundDecline" className="cursor-pointer font-medium">Issue refund</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {hasPaid ? "Refund to original payment method" : "No payment on record"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Keep Pending</Button>
          <Button variant="destructive" onClick={handleDecline} disabled={update.isPending}>
            <XCircle className="mr-1.5 h-4 w-4" />
            {update.isPending ? "Declining…" : "Decline Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
