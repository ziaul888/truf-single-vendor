"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBookingDetail, useUpdateBookingStatus } from "@/hooks/useBookings";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { ArrowLeft, CalendarDays, Clock, CreditCard, Mail, Phone, Users, Timer } from "lucide-react";
import { toast } from "sonner";
import { bookingStatusVariant, paymentStatusVariant } from "@/components/features/bookings/booking-status-helpers";
import { BookingDetailSidebar } from "@/components/features/bookings/booking-detail-sidebar";
import { BookingDetailCancelDialog } from "@/components/features/bookings/booking-detail-cancel-dialog";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: booking, isLoading, isError } = useBookingDetail(id);
  const update = useUpdateBookingStatus();
  const [cancelOpen, setCancelOpen] = useState(false);

  function handleCancel(refund: boolean) {
    if (!booking) return;
    update.mutate(
      { id: booking.id, status: "cancelled", refund },
      {
        onSuccess: () => {
          toast.success(`Booking ${booking.id} cancelled${refund ? " with full refund" : ""}`);
          setCancelOpen(false);
        },
        onError: () => toast.error("Failed to cancel booking"),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <SkeletonBlock className="h-52" /><SkeletonBlock className="h-48" /><SkeletonBlock className="h-44" />
          </div>
          <div className="space-y-6">
            <SkeletonBlock className="h-48" /><SkeletonBlock className="h-56" /><SkeletonBlock className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-lg font-medium text-destructive">Booking not found.</p>
        <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Go back</Button>
      </div>
    );
  }

  const isCancellable = booking.status !== "cancelled" && booking.status !== "completed";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />Back
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Booking <span className="font-mono text-muted-foreground">{booking.id}</span>
          </h1>
        </div>
        <Badge variant={bookingStatusVariant(booking.status)} className="ml-auto capitalize">{booking.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Ground"><span className="font-medium">{booking.groundName}</span></Row>
              <Row label="Date"><span>{formatDate(booking.date, "long")}</span></Row>
              <Row label="Time slot">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />{booking.startTime} – {booking.endTime}
                </span>
              </Row>
              <Row label="Duration">
                <span className="flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5 text-muted-foreground" />{booking.duration} {booking.duration === 1 ? "hour" : "hours"}
                </span>
              </Row>
              <Row label="Booked on"><span className="text-muted-foreground">{new Date(booking.createdAt).toLocaleString()}</span></Row>
              {booking.notes && <Row label="Notes"><span className="italic text-muted-foreground">{booking.notes}</span></Row>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-muted-foreground" />Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-xs font-semibold">{getInitials(booking.customerName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{booking.customerName}</p>
                  <p className="text-xs text-muted-foreground">{booking.customerTotalBookings} total bookings</p>
                </div>
              </div>
              <Separator />
              <Row label="Phone">
                <a href={`tel:${booking.customerPhone}`} className="flex items-center gap-1 hover:underline">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />{booking.customerPhone}
                </a>
              </Row>
              <Row label="Email">
                <a href={`mailto:${booking.customerEmail}`} className="flex items-center gap-1 hover:underline">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />{booking.customerEmail}
                </a>
              </Row>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-muted-foreground" />Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Status">
                <Badge variant={paymentStatusVariant(booking.paymentStatus)} className="capitalize">{booking.paymentStatus}</Badge>
              </Row>
              <Row label="Method"><span className="capitalize">{booking.paymentMethod.replace("_", " ")}</span></Row>
              {booking.cardLast4 && <Row label="Card"><span className="font-mono">•••• •••• •••• {booking.cardLast4}</span></Row>}
              {booking.stripeTransactionId && (
                <Row label="Transaction ID"><span className="font-mono text-xs text-muted-foreground">{booking.stripeTransactionId}</span></Row>
              )}
              <Separator />
              <Row label={`${booking.duration}h × ${formatCurrency(booking.pricePerHour)}/hr`}>
                <span>{formatCurrency(booking.pricePerHour * booking.duration)}</span>
              </Row>
              <Row label="Total"><span className="text-base font-bold">{formatCurrency(booking.amount)}</span></Row>
            </CardContent>
          </Card>
        </div>

        <BookingDetailSidebar
          groundName={booking.groundName}
          groundType={booking.groundType}
          groundCapacity={booking.groundCapacity}
          groundIsActive={booking.groundIsActive}
          groundOpeningTime={booking.groundOpeningTime}
          groundClosingTime={booking.groundClosingTime}
          timeline={booking.timeline}
          status={booking.status}
          customerId={booking.customerId}
          isCancellable={isCancellable}
          onCancelClick={() => setCancelOpen(true)}
        />
      </div>

      <BookingDetailCancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        bookingId={booking.id}
        customerName={booking.customerName}
        groundName={booking.groundName}
        date={booking.date}
        startTime={booking.startTime}
        endTime={booking.endTime}
        amount={booking.amount}
        paymentStatus={booking.paymentStatus}
        isPending={update.isPending}
        onConfirm={handleCancel}
      />
    </div>
  );
}
