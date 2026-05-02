"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BookingRow } from "@/hooks/useBookings";
import { formatCurrency } from "@/lib/utils";
import { Phone, MapPin, CalendarDays, Banknote, Clock, StickyNote, CheckCircle2, XCircle } from "lucide-react";
import { paymentBadgeVariant, timeAgo } from "./booking-status-helpers";

export function PendingBookingCard({
  booking,
  onConfirm,
  onDecline,
}: {
  booking: BookingRow;
  onConfirm: (b: BookingRow) => void;
  onDecline: (b: BookingRow) => void;
}) {
  const hasPaid = booking.paymentStatus === "paid" || booking.paymentStatus === "partial";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-base">{booking.customerName}</span>
                  <span className="font-mono text-xs text-muted-foreground">{booking.id}</span>
                </div>
                <a href={`tel:${booking.customerPhone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-0.5">
                  <Phone className="h-3 w-3" />{booking.customerPhone}
                </a>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant={paymentBadgeVariant(booking.paymentStatus)} className="text-xs">
                  {booking.paymentStatus}
                </Badge>
                {hasPaid && (
                  <div className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                    <Banknote className="h-3 w-3" />paid
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{booking.groundName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" /><span>{new Date(booking.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Banknote className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium text-foreground">{formatCurrency(booking.amount)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" /><span>{booking.startTime} – {booking.endTime}</span>
              </div>
            </div>

            {booking.notes && (
              <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <StickyNote className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span className="italic">{booking.notes}</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
              <Clock className="h-3 w-3" />Requested {timeAgo(booking.createdAt)}
            </div>
          </div>

          <div className="flex gap-2 sm:flex-col sm:items-stretch">
            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white sm:flex-none" onClick={() => onConfirm(booking)}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" />Confirm
            </Button>
            <Button size="sm" variant="outline" className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none" onClick={() => onDecline(booking)}>
              <XCircle className="mr-1.5 h-4 w-4" />Decline
            </Button>
            <Button size="sm" variant="ghost" className="flex-1 sm:flex-none text-xs" asChild>
              <Link href={`/dashboard/bookings/${booking.id}`}>View</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
