"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useBookingDetail } from "@/hooks/useBookings";
import { CollectPaymentDialog } from "@/components/features/bookings/collect-payment-dialog";

/** "Collect" for a booking known only by id (the dashboard's next-up booking): loads it, then opens the usual dialog. */
export function CollectByIdDialog({ bookingId, onClose }: { bookingId: string | null; onClose: () => void }) {
  const { data: booking, isError } = useBookingDetail(bookingId ?? undefined);
  if (!bookingId) return null;

  if (!booking) {
    return (
      <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only">Loading booking</DialogTitle>
          {isError
            ? <p className="text-sm text-destructive">Couldn&apos;t load this booking. Try again from the booking page.</p>
            : <div className="h-40 animate-pulse rounded bg-muted" />}
        </DialogContent>
      </Dialog>
    );
  }
  return <CollectPaymentDialog booking={booking} open onOpenChange={(v) => { if (!v) onClose(); }} />;
}
