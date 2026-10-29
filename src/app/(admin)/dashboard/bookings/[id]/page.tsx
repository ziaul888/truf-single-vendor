"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useBookingDetail } from "@/hooks/useBookings";
import { toApiFailure } from "@/lib/api-error";
import { ArrowLeft, CheckCircle2, SearchX } from "lucide-react";
import {
  BOOKING_STATUS_LABEL, bookingStatusVariant, isAwaitingCardPayment, isCancellable,
} from "@/components/features/bookings/booking-status-helpers";
import { BookingDetailSidebar } from "@/components/features/bookings/booking-detail-sidebar";
import {
  BookingCustomerCard, BookingInfoCard, BookingPaymentCard,
} from "@/components/features/bookings/booking-detail-cards";
import { CancelDialog } from "@/components/features/bookings/cancel-dialog";
import { ConfirmDialog } from "@/components/features/bookings/confirm-dialog";
import { CollectPaymentDialog } from "@/components/features/bookings/collect-payment-dialog";
import { EditBookingDialog } from "@/components/features/bookings/edit-booking-dialog";
import { PayAtVenueBadge } from "@/components/features/bookings/pay-at-venue-badge";

type DialogName = "cancel" | "confirm" | "collect" | "edit" | null;

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

function DetailSkeleton() {
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

function NotFoundState({ notFound, onRetry }: { notFound: boolean; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-semibold">{notFound ? "Booking not found" : "Couldn't load this booking"}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {notFound ? "It may have been removed, or the link is wrong." : "Check your connection and try again."}
        </p>
      </div>
      <div className="flex gap-2">
        {!notFound && <Button variant="outline" onClick={onRetry}>Try again</Button>}
        <Button asChild><Link href="/dashboard/bookings"><ArrowLeft className="mr-2 h-4 w-4" />All bookings</Link></Button>
      </div>
    </div>
  );
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: booking, isLoading, isError, error, refetch } = useBookingDetail(id);
  const [dialog, setDialog] = useState<DialogName>(null);
  const closeDialog = (open: boolean) => { if (!open) setDialog(null); };

  if (isLoading) return <DetailSkeleton />;

  if (isError || !booking) {
    const code = isError ? toApiFailure(error).code : "BOOKING_NOT_FOUND";
    return <NotFoundState notFound={code === "BOOKING_NOT_FOUND" || code === "VALIDATION_FAILED"} onRetry={() => refetch()} />;
  }

  const canConfirm = booking.status === "pending" && !isAwaitingCardPayment(booking);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />Back
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-2xl font-bold tracking-tight">
          Booking <span className="font-mono text-muted-foreground">{booking.bookingNumber}</span>
        </h1>
        <div className="ml-auto flex items-center gap-2">
          {booking.payAtVenue && <PayAtVenueBadge />}
          <Badge variant={bookingStatusVariant(booking.status)}>{BOOKING_STATUS_LABEL[booking.status]}</Badge>
          {canConfirm && (
            <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => setDialog("confirm")}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" />Confirm
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <BookingInfoCard booking={booking} onEdit={booking.status === "cancelled" ? undefined : () => setDialog("edit")} />
          <BookingCustomerCard booking={booking} />
          <BookingPaymentCard booking={booking} />
        </div>

        <BookingDetailSidebar
          booking={booking}
          onCancelClick={() => setDialog("cancel")}
          onCollectClick={() => setDialog("collect")}
        />
      </div>

      {isCancellable(booking) && (
        <CancelDialog booking={booking} open={dialog === "cancel"} onOpenChange={closeDialog} />
      )}
      {canConfirm && <ConfirmDialog booking={booking} open={dialog === "confirm"} onOpenChange={closeDialog} />}
      <CollectPaymentDialog booking={booking} open={dialog === "collect"} onOpenChange={closeDialog} />
      <EditBookingDialog booking={booking} open={dialog === "edit"} onOpenChange={closeDialog} />
    </div>
  );
}
