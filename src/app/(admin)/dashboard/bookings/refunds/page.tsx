"use client";

import { DashboardPageHeader } from "@/components/features/dashboard/page-header";
import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Search, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterMenu } from "@/components/features/filter-menu";
import { BookingsPagination } from "@/components/features/bookings/bookings-pagination";
import { RefundBookingCard } from "@/components/features/bookings/refund-booking-card";
import { PAYMENT_METHOD_LABEL } from "@/components/features/bookings/booking-status-helpers";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { hasGroundChoice, useGrounds } from "@/hooks/useGrounds";
import { useRefundBookings } from "@/hooks/useRefundBookings";
import { PAYMENT_METHODS, type PaymentMethod } from "@/types/booking";
import { REFUND_STATUSES, type RefundStatus } from "@/types/refund-booking";

const PAGE_SIZE = 20;
const STATUS_LABEL: Record<RefundStatus, string> = {
  all: "All refunds",
  due: "To send",
  recorded: "Recorded",
};

function RefundsLoading() {
  return (
    <div aria-label="Loading refund bookings" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-muted h-72 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

export default function RefundBookingsPage() {
  return (
    <Suspense fallback={<RefundsLoading />}>
      <RefundBookingsView />
    </Suspense>
  );
}

function RefundBookingsView() {
  const pathname = usePathname();
  const params = useSearchParams();
  const status = REFUND_STATUSES.find((value) => value === params.get("status")) ?? "all";
  const [search, setSearch] = useState("");
  const [groundId, setGroundId] = useState("all");
  const [method, setMethod] = useState<PaymentMethod | "all">("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const { data: grounds } = useGrounds();
  const refunds = useRefundBookings({
    status,
    search: debouncedSearch || undefined,
    groundId: groundId === "all" ? undefined : groundId,
    method: method === "all" ? undefined : method,
    page,
    limit: PAGE_SIZE,
  });
  const filtered = search !== "" || groundId !== "all" || method !== "all";
  const clearFilters = () => {
    setSearch("");
    setGroundId("all");
    setMethod("all");
    setPage(1);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <DashboardPageHeader title="Refund bookings" description="Track refunds and wallet payments still to send back.">
        <Button variant="outline" asChild>
          <Link href="/dashboard/bookings"><ArrowLeft /> All bookings</Link>
        </Button>
      </DashboardPageHeader>

      <div aria-label="Refund status" className="grid grid-cols-3 gap-2 sm:flex">
        {REFUND_STATUSES.map((value) => (
          <Button
            key={value}
            variant={status === value ? "default" : "outline"}
            className="h-auto min-h-11 whitespace-normal px-2 py-2 text-center sm:px-4"
            asChild
          >
            <Link
              href={value === "all" ? pathname : `${pathname}?status=${value}`}
              aria-current={status === value ? "page" : undefined}
              onClick={() => setPage(1)}
            >
              {STATUS_LABEL[value]}
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 md:max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            aria-label="Search refund bookings"
            placeholder="Booking #, name or phone"
            value={search}
            className="min-h-11 pl-9"
            maxLength={100}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <FilterMenu activeCount={Number(groundId !== "all") + Number(method !== "all")}>
          <Select
            value={method}
            onValueChange={(value) => {
              setMethod(PAYMENT_METHODS.find((item) => item === value) ?? "all");
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Refund payment method" className="min-h-11 w-full md:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payment methods</SelectItem>
              {PAYMENT_METHODS.map((value) => (
                <SelectItem key={value} value={value}>
                  {PAYMENT_METHOD_LABEL[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasGroundChoice(grounds) && (
            <Select
              value={groundId}
              onValueChange={(value) => {
                setGroundId(value);
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Refund ground" className="min-h-11 w-full md:w-44">
                <SelectValue placeholder="All grounds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All grounds</SelectItem>
                {grounds?.map((ground) => (
                  <SelectItem key={ground.id} value={ground.id}>
                    {ground.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FilterMenu>
        {filtered && (
          <Button variant="ghost" className="min-h-11" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <p className="text-muted-foreground text-xs">
        Send bKash/Nagad refunds from your own app, then record them on the booking. Other methods
        show the recorded refund.
      </p>

      {refunds.isLoading || refunds.isPlaceholderData ? (
        <RefundsLoading />
      ) : refunds.isError ? (
        <div
          role="alert"
          className="border-destructive/30 space-y-3 rounded-lg border p-6 text-center"
        >
          <AlertCircle className="text-destructive mx-auto h-7 w-7" />
          <p className="text-sm">Refund bookings couldn&apos;t be loaded.</p>
          <Button
            variant="outline"
            disabled={refunds.isFetching}
            onClick={() => void refunds.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : refunds.data?.data.length ? (
        <>
          <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {refunds.data.data.map((booking) => (
              <RefundBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
          <BookingsPagination
            page={page}
            limit={PAGE_SIZE}
            total={refunds.data.total}
            onPageChange={setPage}
            noun="refund bookings"
          />
        </>
      ) : (
        <div className="rounded-lg border border-dashed px-4 py-10 text-center">
          <Undo2 className="text-muted-foreground mx-auto mb-3 h-8 w-8" />
          <p className="font-medium">
            {filtered
              ? "No matching refund bookings"
              : status === "due"
                ? "No wallet refunds waiting to be sent"
                : "No refund bookings found"}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {filtered
              ? "Try a different search or clear the filters."
              : "Bookings with refunded payments will appear here."}
          </p>
          {filtered && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
