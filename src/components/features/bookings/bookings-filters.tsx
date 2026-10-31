"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGrounds } from "@/hooks/useGrounds";
import { DUE_FILTERS, type DueFilter } from "@/hooks/useBookings";
import { BOOKING_STATUSES, PAYMENT_STATUSES, type BookingStatus, type PaymentStatus } from "@/types/booking";
import { FilterX, Search } from "lucide-react";
import { BOOKING_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "./booking-status-helpers";

export interface BookingListFilters {
  search: string;
  status: BookingStatus | "all";
  paymentStatus: PaymentStatus | "all";
  groundId: string;
  due: DueFilter | "all";
}

export const EMPTY_BOOKING_FILTERS: BookingListFilters = { search: "", status: "all", paymentStatus: "all", groundId: "all", due: "all" };

export const DUE_LABEL: Record<DueFilter, string> = { any: "Money due", overdue: "Overdue", today: "Due today" };

interface BookingsFiltersProps {
  value: BookingListFilters;
  onChange: (next: BookingListFilters) => void;
}

export function BookingsFilters({ value, onChange }: BookingsFiltersProps) {
  const { data: grounds } = useGrounds();
  const set = (patch: Partial<BookingListFilters>) => onChange({ ...value, ...patch });
  const isFiltered = value.search !== "" || value.status !== "all" || value.paymentStatus !== "all" || value.groundId !== "all" || value.due !== "all";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:w-80">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search booking #, name or phone…" className="pl-8"
          value={value.search} onChange={(e) => set({ search: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap lg:gap-1">
        <Select value={value.status} onValueChange={(v) => set({ status: v as BookingListFilters["status"] })}>
          <SelectTrigger className="w-full lg:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {BOOKING_STATUSES.map((s) => <SelectItem key={s} value={s}>{BOOKING_STATUS_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={value.paymentStatus} onValueChange={(v) => set({ paymentStatus: v as BookingListFilters["paymentStatus"] })}>
          <SelectTrigger className="w-full lg:w-36"><SelectValue placeholder="Payment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            {PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{PAYMENT_STATUS_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={value.groundId} onValueChange={(v) => set({ groundId: v })}>
          <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Ground" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grounds</SelectItem>
            {grounds?.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={value.due} onValueChange={(v) => set({ due: v as BookingListFilters["due"] })}>
          <SelectTrigger className="w-full lg:w-36"><SelectValue placeholder="Due" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any balance</SelectItem>
            {DUE_FILTERS.map((d) => <SelectItem key={d} value={d}>{DUE_LABEL[d]}</SelectItem>)}
          </SelectContent>
        </Select>
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_BOOKING_FILTERS)}
            className="col-span-2 gap-1.5 text-muted-foreground sm:col-span-4 lg:col-span-1">
            <FilterX className="h-4 w-4" />Clear
          </Button>
        )}
      </div>
    </div>
  );
}
