"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCustomers, type Customer } from "@/hooks/useCustomers";
import { Users, UserPlus, AlertCircle, Download, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddCustomerDrawer } from "@/components/features/customers/add-customer-drawer";
import { CustomersPagination } from "@/components/features/customers/customers-pagination";
import { avatarBg, initials, formatSince, formatDate, formatTaka, TAG_CLS } from "@/components/features/customers/customer-display";

const PAGE_SIZE = 7;
type SortField = "last-booking" | "total-spent" | "bookings" | "since" | "due-amount";
type SortDir   = "asc" | "desc";

function SortIcon({ field, active, dir }: { field: SortField; active: SortField; dir: SortDir }) {
  if (field !== active) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
  return dir === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />;
}

export default function CustomersPage() {
  const { data, isLoading, isError } = useCustomers();
  const [search,     setSearch]     = useState("");
  const [tagF,       setTagF]       = useState("all");
  const [payF,       setPayF]       = useState("all");
  const [sort,       setSort]       = useState<SortField>("last-booking");
  const [sortDir,    setSortDir]    = useState<SortDir>("desc");
  const [page,       setPage]       = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const customers = data?.customers ?? [];
  const stats     = data?.stats;

  function toggleSort(field: SortField) {
    if (sort === field) { setSortDir((d) => d === "desc" ? "asc" : "desc"); }
    else { setSort(field); setSortDir("desc"); }
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers
      .filter((c) => {
        const matchQ = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
        const matchT = tagF === "all" || c.tag === tagF;
        const matchP = payF === "all" || (payF === "has-due" ? c.dueAmount > 0 : c.dueAmount === 0);
        return matchQ && matchT && matchP;
      })
      .sort((a, b) => {
        let val = 0;
        if (sort === "last-booking") val = new Date(a.lastBooking).getTime() - new Date(b.lastBooking).getTime();
        else if (sort === "total-spent") val = a.totalSpent - b.totalSpent;
        else if (sort === "bookings")    val = a.bookings   - b.bookings;
        else if (sort === "since")       val = new Date(a.since).getTime() - new Date(b.since).getTime();
        else if (sort === "due-amount")  val = a.dueAmount  - b.dueAmount;
        return sortDir === "desc" ? -val : val;
      });
  }, [customers, search, tagF, payF, sort, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function exportCSV() {
    const header = "ID,Name,Phone,Email,Since,Bookings,Total Spent,Last Booking,Due Amount,Tag";
    const rows   = filtered.map((c) => `${c.id},"${c.name}",${c.phone},${c.email},${c.since},${c.bookings},${c.totalSpent},${c.lastBooking},${c.dueAmount},${c.tag}`);
    const blob   = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a"); a.href = url; a.download = "customers.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const sortCols: { field: SortField; label: string }[] = [
    { field: "last-booking", label: "Last booking" },
    { field: "total-spent",  label: "Total spent"  },
    { field: "bookings",     label: "Bookings"      },
    { field: "since",        label: "Since"         },
    { field: "due-amount",   label: "Due amount"    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage all registered customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} disabled={isLoading}><Download className="mr-1.5 h-4 w-4" /> Export CSV</Button>
          <Button onClick={() => setDrawerOpen(true)}><UserPlus className="mr-1.5 h-4 w-4" /> + Add customer</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Total customers",   value: stats?.total ?? "—",                              color: "text-foreground",                       icon: Users     },
          { label: "New this month",    value: stats?.newThisMonth ?? "—",                        color: "text-green-600 dark:text-green-400",    icon: UserPlus  },
          { label: "With due payments", value: stats?.withDuePayments ?? "—",                     color: "text-orange-500",                       icon: AlertCircle },
          { label: "Total due amount",  value: stats ? formatTaka(stats.totalDueAmount)  : "—",   color: "text-amber-500",                        icon: null      },
          { label: "Total revenue",     value: stats ? formatTaka(stats.totalRevenue, true) : "—", color: "text-blue-600 dark:text-blue-400",    icon: null      },
        ].map(({ label, value, color }) => (
          <Card key={label}><CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={cn("text-2xl font-bold", color)}>{isLoading ? "—" : value}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search by name, phone or email…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={tagF} onValueChange={(v) => { setTagF(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              <SelectItem value="VIP">VIP (10+ bookings)</SelectItem>
              <SelectItem value="Regular">Regular (3–9)</SelectItem>
              <SelectItem value="New">New (1–2)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={payF} onValueChange={(v) => { setPayF(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="has-due">Has due</SelectItem>
              <SelectItem value="paid">Fully paid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => { setSort(v as SortField); setPage(1); }}>
            <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Sort by…" /></SelectTrigger>
            <SelectContent>
              {sortCols.map(({ field, label }) => <SelectItem key={field} value={field}>Sort: {label}</SelectItem>)}
            </SelectContent>
          </Select>
          {(search || tagF !== "all" || payF !== "all") && (
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
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[220px]">
                    <button className="flex items-center gap-1 font-medium" onClick={() => toggleSort("bookings")}>
                      Customer <ArrowUpDown className="h-3 w-3 opacity-40" />
                    </button>
                  </TableHead>
                  {sortCols.map(({ field, label }) => (
                    <TableHead key={field}>
                      <button className="flex items-center gap-1 font-medium" onClick={() => toggleSort(field)}>
                        {label} <SortIcon field={field} active={sort} dir={sortDir} />
                      </button>
                    </TableHead>
                  ))}
                  <TableHead>Tag</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">No customers found.</TableCell></TableRow>
                ) : (
                  pageRows.map((c: Customer) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: avatarBg(c.name) }}>
                            {initials(c.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium leading-tight truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatSince(c.since)}</TableCell>
                      <TableCell className="text-sm font-semibold">{c.bookings}</TableCell>
                      <TableCell className="text-sm font-medium">৳&nbsp;{c.totalSpent.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-sm">{formatDate(c.lastBooking)}</TableCell>
                      <TableCell>
                        {c.dueAmount > 0
                          ? <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">৳&nbsp;{c.dueAmount.toLocaleString("en-IN")}</span>
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", TAG_CLS[c.tag])}>{c.tag}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                            <Link href={`/dashboard/customers/${c.id}`}>Profile</Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                            <Link href={`/dashboard/bookings?customer=${c.id}`}>Bookings</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <CustomersPagination page={page} totalPages={totalPages} total={customers.length} filtered={filtered.length}
              onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          </>
        )}
      </Card>

      <AddCustomerDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
