"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, Phone, Mail, Calendar, MapPin, Edit, Trash2, PlusCircle, DollarSign, AlertCircle, CheckCircle2, Clock, XCircle, Star } from "lucide-react";
import type { Customer } from "@/hooks/useCustomers";
import type { TimelineEvent, DuePayment } from "@/app/api/customers/[id]/route";
import type { BookingRecord } from "@/app/api/customers/[id]/route";
import { avatarBg, initials, formatSince, formatDate, TAG_CLS } from "@/components/features/customers/customer-display";
import { CustomerBookingHistory } from "@/components/features/customers/customer-booking-history";
import { CustomerDuePayments } from "@/components/features/customers/customer-due-payments";

interface CustomerDetail extends Customer {
  bookingsList: BookingRecord[];
  timeline: TimelineEvent[];
  duePayments: DuePayment[];
  favoriteGround: string;
  adminNote: string;
}

const TIMELINE_ICONS: Record<string, React.ReactNode> = {
  amber: <Clock className="h-3.5 w-3.5 text-amber-500" />,
  green: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
  red:   <XCircle className="h-3.5 w-3.5 text-red-500" />,
  blue:  <Star className="h-3.5 w-3.5 text-blue-500" />,
};

const TIMELINE_DOT: Record<string, string> = {
  amber: "bg-amber-400",
  green: "bg-green-500",
  red:   "bg-red-500",
  blue:  "bg-blue-500",
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [collectingId, setCollectingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<CustomerDetail>({
    queryKey: ["customer", id],
    queryFn: async () => {
      const res  = await fetch(`/api/customers/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Not found");
      return json.data;
    },
  });

  const collectMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const res  = await fetch(`/api/customers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dueAmount: 0 }) });
      const json = await res.json();
      if (!json.success) throw new Error("Failed");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setCollectingId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="grid grid-cols-5 gap-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5">{[1,2,3].map((i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />)}</div>
          <div className="space-y-5">{[1,2].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />)}</div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="font-semibold text-lg">Customer not found</p>
        <Link href="/dashboard/customers" className="text-sm text-primary underline">Back to customers</Link>
      </div>
    );
  }

  const bookingsList: BookingRecord[] = Array.isArray(data.bookingsList) ? data.bookingsList : [];

  return (
    <div className="space-y-5">
      <Link href="/dashboard/customers" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ChevronLeft className="h-4 w-4" /> Back to customers
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-md" style={{ backgroundColor: avatarBg(data.name) }}>
                {initials(data.name)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">{data.name}</h1>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", TAG_CLS[data.tag])}>{data.tag}</span>
                  {data.dueAmount > 0 && (
                    <span className="rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-0.5 text-xs font-semibold border border-red-200 dark:border-red-800">
                      Due ৳{data.dueAmount.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{data.id} · Customer since {formatSince(data.since)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/bookings/new?customer=${data.id}`}><PlusCircle className="mr-1.5 h-4 w-4" /> New booking</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/customers/${id}/edit`}><Edit className="mr-1.5 h-4 w-4" /> Edit profile</Link>
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5">
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Total bookings",   value: data.bookings,                                               color: "text-foreground" },
          { label: "Total spent",      value: `৳\u00a0${data.totalSpent.toLocaleString("en-IN")}`,        color: "text-blue-600 dark:text-blue-400" },
          { label: "Due amount",       value: data.dueAmount > 0 ? `৳\u00a0${data.dueAmount.toLocaleString("en-IN")}` : "—", color: data.dueAmount > 0 ? "text-amber-500" : "text-muted-foreground" },
          { label: "Last booking",     value: formatDate(data.lastBooking),                               color: "text-foreground" },
          { label: "Favourite ground", value: data.favoriteGround,                                         color: "text-green-600 dark:text-green-400" },
        ].map(({ label, value, color }) => (
          <Card key={label}><CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={cn("text-lg font-bold leading-tight", color)}>{value}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] items-start">
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Contact information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { icon: Phone,    label: "Phone",            value: data.phone          },
                  { icon: Mail,     label: "Email",            value: data.email          },
                  { icon: Calendar, label: "Member since",     value: formatDate(data.since) },
                  { icon: MapPin,   label: "Favourite ground", value: data.favoriteGround },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div><p className="text-[11px] text-muted-foreground">{label}</p><p className="text-sm font-medium truncate">{value}</p></div>
                  </div>
                ))}
              </div>
              {data.adminNote && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-3">
                  <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mb-1">Admin note</p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">{data.adminNote}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <CustomerDuePayments
            duePayments={data.duePayments ?? []}
            collectingId={collectingId}
            isPending={collectMutation.isPending}
            onCollect={(bookingId) => { setCollectingId(bookingId); collectMutation.mutate(bookingId); }}
          />

          <CustomerBookingHistory customerId={id} bookings={bookingsList} />
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Activity timeline</CardTitle></CardHeader>
            <CardContent>
              {data.timeline && data.timeline.length > 0 ? (
                <ol className="relative space-y-4 border-l border-muted-foreground/20 pl-4">
                  {data.timeline.map((ev: TimelineEvent, i: number) => (
                    <li key={i} className="relative">
                      <span className={cn("absolute -left-[21px] flex h-3.5 w-3.5 items-center justify-center rounded-full ring-2 ring-background", TIMELINE_DOT[ev.color])} />
                      <div className="flex items-start gap-2">
                        {TIMELINE_ICONS[ev.color]}
                        <div>
                          <p className="text-sm font-medium leading-tight">{ev.title}</p>
                          <p className="text-xs text-muted-foreground">{ev.desc}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : <p className="text-sm text-muted-foreground">No activity yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" size="sm" asChild>
                <Link href={`/dashboard/bookings/new?customer=${data.id}`}><PlusCircle className="mr-2 h-4 w-4 text-blue-500" /> New booking</Link>
              </Button>
              {data.dueAmount > 0 && (
                <Button className="w-full justify-start" variant="outline" size="sm" disabled={collectMutation.isPending}
                  onClick={() => collectMutation.mutate("quick-collect")}>
                  <DollarSign className="mr-2 h-4 w-4 text-amber-500" />Collect due payment
                </Button>
              )}
              <Button className="w-full justify-start" variant="outline" size="sm" asChild>
                <Link href={`/dashboard/customers/${id}/edit`}><Edit className="mr-2 h-4 w-4 text-green-500" /> Edit profile</Link>
              </Button>
              <Button className="w-full justify-start text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                variant="outline" size="sm" onClick={() => router.push("/dashboard/customers")}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete customer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
