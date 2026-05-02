"use client";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateBookingStatus, type BookingRow } from "@/hooks/useBookings";
import { toast } from "sonner";
import { bookingStatusVariant } from "./booking-status-helpers";

export function StatusCell({ booking }: { booking: BookingRow }) {
  const update = useUpdateBookingStatus();

  if (booking.status === "cancelled" || booking.status === "completed") {
    return <Badge variant={bookingStatusVariant(booking.status)}>{booking.status}</Badge>;
  }

  return (
    <Select
      value={booking.status}
      onValueChange={(value) => {
        update.mutate(
          { id: booking.id, status: value },
          {
            onSuccess: () => toast.success(`Booking ${booking.id} marked as ${value}`),
            onError: () => toast.error("Failed to update status"),
          }
        );
      }}
    >
      <SelectTrigger className="h-7 w-32 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="confirmed">Confirmed</SelectItem>
      </SelectContent>
    </Select>
  );
}
