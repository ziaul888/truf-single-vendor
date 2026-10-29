"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/utils";
import { formatEventTime, slotPriceLabel, slotTimeLabel, formatSlotDate } from "@/lib/slot-format";
import type { BookingDetail } from "@/types/booking";
import { CalendarDays, Clock, CreditCard, Mail, Pencil, Phone, Timer, Users } from "lucide-react";
import { PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, paymentStatusVariant } from "./booking-status-helpers";
import { PayAtVenueBadge } from "./pay-at-venue-badge";

export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

export function BookingInfoCard({ booking, onEdit }: { booking: BookingDetail; onEdit?: () => void }) {
  const hours = booking.slot.endHour - booking.slot.startHour;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />Booking Information
        </CardTitle>
        {onEdit && (
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <DetailRow label="Ground"><span className="font-medium">{booking.ground.name}</span></DetailRow>
        <DetailRow label="Date"><span>{formatDate(`${booking.slot.date}T00:00:00`, "long")}</span></DetailRow>
        <DetailRow label="Time slot">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{slotTimeLabel(booking.slot)}</span>
        </DetailRow>
        <DetailRow label="Duration">
          <span className="flex items-center gap-1"><Timer className="h-3.5 w-3.5 text-muted-foreground" />{hours} {hours === 1 ? "hour" : "hours"}</span>
        </DetailRow>
        <DetailRow label="Source">
          <span>{booking.source === "portal" ? "Customer portal" : `Staff${booking.createdBy ? ` · ${booking.createdBy.name}` : ""}`}</span>
        </DetailRow>
        <DetailRow label="Booked on"><span className="text-muted-foreground">{formatEventTime(booking.createdAt)}</span></DetailRow>
        {booking.cancelledAt && (
          <DetailRow label="Cancelled">
            <span className="text-muted-foreground">{formatEventTime(booking.cancelledAt)}{booking.cancelReason ? ` · ${booking.cancelReason}` : ""}</span>
          </DetailRow>
        )}
        <DetailRow label="Notes">
          <span className={booking.notes ? "italic text-muted-foreground" : "text-muted-foreground/60"}>{booking.notes ?? "—"}</span>
        </DetailRow>
      </CardContent>
    </Card>
  );
}

export function BookingCustomerCard({ booking }: { booking: BookingDetail }) {
  const { contact, customer } = booking;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-muted-foreground" />Customer
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
          <Link href={`/dashboard/customers/${customer.id}`}>View customer</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-xs font-semibold">{getInitials(contact.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{contact.name}</p>
            <p className="text-xs text-muted-foreground">{customer.totalBookings} total bookings</p>
          </div>
        </div>
        <Separator />
        <DetailRow label="Phone">
          <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:underline">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />{contact.phone}
          </a>
        </DetailRow>
        <DetailRow label="Email">
          <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:underline">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />{contact.email}
          </a>
        </DetailRow>
      </CardContent>
    </Card>
  );
}

export function BookingPaymentCard({ booking }: { booking: BookingDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4 text-muted-foreground" />Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <DetailRow label="Status">
          <span className="flex items-center gap-1.5">
            {booking.payAtVenue && <PayAtVenueBadge />}
            <Badge variant={paymentStatusVariant(booking.paymentStatus)}>{PAYMENT_STATUS_LABEL[booking.paymentStatus]}</Badge>
          </span>
        </DetailRow>
        <Separator />
        <DetailRow label="Slot price"><span>{slotPriceLabel(booking.amount)}</span></DetailRow>
        {booking.serviceFee > 0 && <DetailRow label="Service fee"><span>{slotPriceLabel(booking.serviceFee)}</span></DetailRow>}
        <DetailRow label="Total"><span className="text-base font-bold">{slotPriceLabel(booking.total)}</span></DetailRow>
        <DetailRow label="Paid"><span className="font-medium text-green-600 dark:text-green-400">{slotPriceLabel(booking.paid)}</span></DetailRow>
        {booking.due > 0 && (
          <DetailRow label="Due">
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {slotPriceLabel(booking.due)}{booking.dueDate ? ` by ${formatSlotDate(booking.dueDate)}` : ""}
            </span>
          </DetailRow>
        )}
        {booking.due > 0 && booking.dueNote && (
          <DetailRow label="Due note"><span className="italic text-muted-foreground">{booking.dueNote}</span></DetailRow>
        )}

        <Separator />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payments</p>
        {booking.payments.length === 0 ? (
          <p className="text-muted-foreground">No payments recorded.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {booking.payments.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-4 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="font-medium">
                    {PAYMENT_METHOD_LABEL[p.method]}
                    {p.cardLast4 && <span className="ml-1.5 font-mono text-xs text-muted-foreground">•••• {p.cardLast4}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatEventTime(p.createdAt)}{p.recordedBy ? ` · ${p.recordedBy.name}` : ""}
                    {p.refundedAt ? ` · refunded ${formatEventTime(p.refundedAt)}` : ""}
                  </p>
                  {p.note && <p className="text-xs italic text-muted-foreground">{p.note}</p>}
                  {p.stripePaymentIntentId && <p className="truncate font-mono text-[11px] text-muted-foreground">{p.stripePaymentIntentId}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className={p.refundedAt ? "font-semibold line-through text-muted-foreground" : "font-semibold"}>{slotPriceLabel(p.amount)}</p>
                  <p className="text-[11px] capitalize text-muted-foreground">{p.status.replace("_", " ")}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
