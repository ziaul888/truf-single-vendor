"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, History, Layers, Mail, MapPin, Users, XCircle } from "lucide-react";
import { toast } from "sonner";

function timelineIcon(event: string) {
  if (event.includes("created")) return <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />;
  if (event.includes("email")) return <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />;
  if (event.includes("Payment")) return <div className="h-2.5 w-2.5 rounded-full bg-green-500" />;
  if (event.includes("confirmed")) return <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />;
  if (event.includes("cancelled") || event.includes("refund")) return <div className="h-2.5 w-2.5 rounded-full bg-red-500" />;
  return <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />;
}

interface BookingDetailSidebarProps {
  groundName: string;
  groundType: string;
  groundCapacity: number;
  groundIsActive: boolean;
  groundOpeningTime: string;
  groundClosingTime: string;
  timeline: Array<{ event: string; timestamp: string }>;
  status: string;
  customerId: string;
  isCancellable: boolean;
  onCancelClick: () => void;
}

export function BookingDetailSidebar({
  groundName, groundType, groundCapacity, groundIsActive,
  groundOpeningTime, groundClosingTime, timeline,
  status, customerId, isCancellable, onCancelClick,
}: BookingDetailSidebarProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-muted-foreground" />Ground
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{groundName}</span>
            <Badge variant={groundIsActive ? "default" : "secondary"}>
              {groundIsActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Type</span>
            <span className="capitalize">{groundType}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Capacity</span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />{groundCapacity} players
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Hours</span>
            <span>{groundOpeningTime} – {groundClosingTime}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-muted-foreground" />Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {timeline.map((item, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                    {timelineIcon(item.event)}
                  </div>
                  {i < timeline.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium leading-none">{item.event}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-muted-foreground" />Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => toast.info("Receipt download coming soon")}>
            <Download className="h-4 w-4" />Download Receipt
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => toast.success("Confirmation email resent")}>
            <Mail className="h-4 w-4" />Resend Confirmation Email
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => router.push(`/dashboard/customers?id=${customerId}`)}>
            <ExternalLink className="h-4 w-4" />View Customer History
          </Button>
          {isCancellable && (
            <Button variant="destructive" className="w-full justify-start gap-2" onClick={onCancelClick}>
              <XCircle className="h-4 w-4" />Cancel &amp; Refund
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
