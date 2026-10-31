"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGround } from "@/hooks/useGrounds";
import { useResendConfirmation } from "@/hooks/useBookings";
import { toApiFailure } from "@/lib/api-error";
import { formatEventTime } from "@/lib/slot-format";
import type { BookingDetail } from "@/types/booking";
import { Banknote, ExternalLink, History, Layers, Mail, MapPin, Users, XCircle } from "lucide-react";
import { toast } from "sonner";
import { EVENT_DOT_CLASS, EVENT_LABEL, eventDetailLabel, isCancellable } from "./booking-status-helpers";

interface BookingDetailSidebarProps {
  booking: BookingDetail;
  onCancelClick: () => void;
  onCollectClick: () => void;
}

function GroundCard({ groundId, fallbackName }: { groundId: string; fallbackName: string }) {
  const { data: ground } = useGround(groundId);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4 text-muted-foreground" />Ground
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{ground?.name ?? fallbackName}</span>
          {ground && <Badge variant={ground.isActive ? "default" : "secondary"}>{ground.isActive ? "Active" : "Inactive"}</Badge>}
        </div>
        {ground && (
          <>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Type</span>
              <span className="capitalize">{[ground.sport, ground.format].filter(Boolean).join(" · ")}</span>
            </div>
            {ground.capacity != null && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Capacity</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-muted-foreground" />{ground.capacity} players</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Hours</span>
              <span>{ground.openingTime} – {ground.closingTime}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityCard({ events }: { events: BookingDetail["events"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-muted-foreground" />Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ol className="space-y-4">
            {events.map((item, i) => (
              <li key={item.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${EVENT_DOT_CLASS[item.type] ?? "bg-gray-400"}`} />
                  </div>
                  {i < events.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium leading-none">{EVENT_LABEL[item.type] ?? item.type}</p>
                  {item.detail && <p className="mt-1 text-xs text-muted-foreground">{eventDetailLabel(item.detail)}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatEventTime(item.createdAt)}{item.user ? ` · ${item.user.name}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export function BookingDetailSidebar({ booking, onCancelClick, onCollectClick }: BookingDetailSidebarProps) {
  const resend = useResendConfirmation();
  const canCollect = booking.due > 0 && booking.status !== "cancelled";

  function handleResend() {
    resend.mutate(booking.id, {
      onSuccess: ({ sent }) => {
        if (sent) toast.success(`Confirmation email sent to ${booking.contact.email}`);
        else toast.warning("Email isn't configured on the server, so nothing was sent");
      },
      onError: (err) => toast.error(toApiFailure(err).error),
    });
  }

  return (
    <div className="space-y-6">
      <GroundCard groundId={booking.ground.id} fallbackName={booking.ground.name} />
      <ActivityCard events={booking.events} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-muted-foreground" />Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {canCollect && (
            <Button variant="outline" className="w-full justify-start gap-2" onClick={onCollectClick}>
              <Banknote className="h-4 w-4" />Collect Payment
            </Button>
          )}
          {booking.status === "confirmed" && (
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleResend} disabled={resend.isPending}>
              <Mail className="h-4 w-4" />{resend.isPending ? "Sending…" : "Resend Confirmation Email"}
            </Button>
          )}
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <Link href={`/dashboard/customers/${booking.customer.id}`}>
              <ExternalLink className="h-4 w-4" />View Customer History
            </Link>
          </Button>
          {isCancellable(booking) && (
            <Button variant="destructive" className="w-full justify-start gap-2" onClick={onCancelClick}>
              <XCircle className="h-4 w-4" />{booking.paid > 0 ? "Cancel & Refund" : "Cancel Booking"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
