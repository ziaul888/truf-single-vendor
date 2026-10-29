"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomers, type CustomerFilters } from "@/hooks/useCustomers";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { Customer, CustomerSort, CustomerStats, CustomerTag } from "@/types/booking";
import { UserPlus, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { fromMinorUnits } from "@/lib/ground-format";
import { AddCustomerDrawer } from "@/components/features/customers/add-customer-drawer";
import { CustomersPagination } from "@/components/features/customers/customers-pagination";
import { CustomersTable, SORT_COLUMNS } from "@/components/features/customers/customers-table";
import { downloadCsv, formatTaka, TAG_FILTER_OPTIONS, TAG_LABEL } from "@/components/features/customers/customer-display";

const PAGE_SIZE = 10;
type PayFilter = "all" | "has-due" | "paid";

function exportCSV(rows: Customer[]) {
  downloadCsv(
    "customers.csv",
    ["Name", "Phone", "Email", "Customer since", "Bookings", "Total spent", "Last booking", "Due amount", "Tag"],
    rows.map((c) => [
      c.name, c.phone, c.email, c.createdAt.slice(0, 10), c.bookings, fromMinorUnits(c.totalSpent),
      c.lastBooking ?? "", fromMinorUnits(c.dueAmount), TAG_LABEL[c.tag],
    ]),
  );
}

function StatCards({ stats, isLoading }: { stats: CustomerStats | undefined; isLoading: boolean }) {
  const cards = [
    { label: "Total customers",   value: stats?.total ?? "—",                                color: "text-foreground" },
    { label: "New this month",    value: stats?.newThisMonth ?? "—",                         color: "text-green-600 dark:text-green-400" },
    { label: "With due payments", value: stats?.withDuePayments ?? "—",                      color: "text-orange-500" },
    { label: "Total due amount",  value: stats ? formatTaka(stats.totalDueAmount) : "—",     color: "text-amber-500" },
    { label: "Total revenue",     value: stats ? formatTaka(stats.totalRevenue, true) : "—", color: "text-blue-600 dark:text-blue-400" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ label, value, color }) => (
        <Card key={label}><CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className={cn("text-2xl font-bold", color)}>{isLoading ? "—" : value}</p>
        </CardContent></Card>
      ))}
    </div>
  );
}

export default function CustomersPage() {
  const [search,     setSearch]     = useState("");
  const [tagF,       setTagF]       = useState<CustomerTag | "all">("all");
  const [payF,       setPayF]       = useState<PayFilter>("all");
  const [sort,       setSort]       = useState<CustomerSort>("lastBooking");
  const [page,       setPage]       = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const filters: CustomerFilters = {
    search: debouncedSearch || undefined,
    tag: tagF === "all" ? undefined : tagF,
    hasDue: payF === "all" ? undefined : payF === "has-due",
    sort,
    page,
    limit: PAGE_SIZE,
  };
  const { data, isLoading, isError } = useCustomers(filters);
  const customers = data?.data ?? [];

  const update = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };
  const hasFilters = search || tagF !== "all" || payF !== "all";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage all registered customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCSV(customers)} disabled={isLoading || customers.length === 0}
            title="Exports the customers on this page">
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={() => setDrawerOpen(true)}><UserPlus className="mr-1.5 h-4 w-4" /> + Add customer</Button>
        </div>
      </div>

      <StatCards stats={data?.stats} isLoading={isLoading} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search by name, phone or email…" value={search}
            onChange={(e) => update(setSearch)(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={tagF} onValueChange={(v) => update(setTagF)(v as CustomerTag | "all")}>
            <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              {TAG_FILTER_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={payF} onValueChange={(v) => update(setPayF)(v as PayFilter)}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="has-due">Has due</SelectItem>
              <SelectItem value="paid">Fully paid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => update(setSort)(v as CustomerSort)}>
            <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Sort by…" /></SelectTrigger>
            <SelectContent>
              {SORT_COLUMNS.map(({ field, label }) => <SelectItem key={field} value={field}>Sort: {label}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-9 text-muted-foreground"
              onClick={() => { setSearch(""); setTagF("all"); setPayF("all"); setPage(1); }}>Clear</Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-px p-4">{[...Array(7)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : isError ? (
          <div className="py-12 text-center text-sm text-destructive">Failed to load customers.</div>
        ) : (
          <>
            <CustomersTable customers={customers} sort={sort} onSort={update(setSort)} />
            <CustomersPagination page={data?.page ?? page} limit={data?.limit ?? PAGE_SIZE} total={data?.total ?? 0}
              onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          </>
        )}
      </Card>

      <AddCustomerDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
