"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, FileSpreadsheet, Download, CheckCircle2, CalendarDays, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookings, type Booking } from "@/hooks/useBookings";
import { useCustomers, type Customer } from "@/hooks/useCustomers";
import { fromMinorUnits, hourToTime } from "@/lib/ground-format";
import * as XLSX from "xlsx";

type DataType     = "bookings" | "customers";
type ExportFormat = "csv" | "xlsx";
type ExportRow    = Record<string, string | number>;

/** The API returns at most this many rows per request; the export covers the most recent ones. */
const EXPORT_LIMIT = 100;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

const bookingRow = (b: Booking): ExportRow => ({
  "Booking #": b.bookingNumber, Customer: b.contact.name || b.customer.name, Phone: b.contact.phone || b.customer.phone,
  Ground: b.ground.name, Date: b.slot.date, Start: hourToTime(b.slot.startHour), End: hourToTime(b.slot.endHour),
  Amount: fromMinorUnits(b.amount), "Service fee": fromMinorUnits(b.serviceFee), Total: fromMinorUnits(b.total),
  Paid: fromMinorUnits(b.paid), Due: fromMinorUnits(b.due), Status: b.status, "Payment status": b.paymentStatus,
  Source: b.source, Created: b.createdAt,
});

const TAG_LABEL: Record<Customer["tag"], string> = { vip: "VIP", regular: "Regular", new: "New" };

const customerRow = (c: Customer): ExportRow => ({
  Name: c.name, Phone: c.phone, Email: c.email, "Customer since": c.createdAt.slice(0, 10), Bookings: c.bookings,
  "Total spent": fromMinorUnits(c.totalSpent), "Last booking": c.lastBooking ?? "",
  "Due amount": fromMinorUnits(c.dueAmount), Tag: TAG_LABEL[c.tag],
});

const BOOKING_HEADER = [
  "Booking #", "Customer", "Phone", "Ground", "Date", "Start", "End", "Amount", "Service fee", "Total",
  "Paid", "Due", "Status", "Payment status", "Source", "Created",
];
const CUSTOMER_HEADER = [
  "Name", "Phone", "Email", "Customer since", "Bookings", "Total spent", "Last booking", "Due amount", "Tag",
];

function toCSV(rows: ExportRow[], header: string[]): string {
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [header.map(cell).join(","), ...rows.map((r) => header.map((h) => cell(r[h] ?? "")).join(","))].join("\n");
}

function writeFile(rows: ExportRow[], header: string[], format: ExportFormat, sheet: string, slug: string) {
  if (format === "csv") {
    downloadBlob(new Blob([toCSV(rows, header)], { type: "text/csv" }), `${slug}.csv`);
    return;
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows, { header }), sheet);
  XLSX.writeFile(wb, `${slug}.xlsx`);
}

const DATA_OPTIONS = [
  { value: "bookings",  label: "Bookings",  description: "All booking records with status and payment info", icon: CalendarDays },
  { value: "customers", label: "Customers", description: "Customer profiles with booking history",           icon: Users        },
] as const;

const FORMAT_OPTIONS = [
  { value: "csv",  label: "CSV",   description: "Universal plain-text format",  icon: FileText        },
  { value: "xlsx", label: "Excel", description: "Microsoft Excel workbook",      icon: FileSpreadsheet },
] as const;

export default function ExportPage() {
  const [dataType,   setDataType]   = useState<DataType>("bookings");
  const [format,     setFormat]     = useState<ExportFormat>("csv");
  const [startDate,  setStartDate]  = useState("");
  const [endDate,    setEndDate]    = useState("");
  const [downloaded, setDownloaded] = useState(false);

  const hasRange  = !!startDate && !!endDate;
  const badRange  = (!!startDate !== !!endDate) || (hasRange && startDate > endDate);
  const bookings  = useBookings(
    { limit: EXPORT_LIMIT, ...(hasRange && !badRange ? { from: startDate, to: endDate } : {}) },
    { enabled: dataType === "bookings" },
  );
  const customers = useCustomers({ limit: EXPORT_LIMIT }, { enabled: dataType === "customers" });

  const active    = dataType === "bookings" ? bookings : customers;
  const total     = active.data?.total ?? 0;
  const isLoading = active.isLoading || active.isFetching;

  function handleExport() {
    const slug = `${dataType}-${new Date().toISOString().split("T")[0]}`;
    if (dataType === "bookings") {
      const rows = (bookings.data?.data ?? []).map(bookingRow);
      writeFile(rows, BOOKING_HEADER, format, "Bookings", slug);
    } else {
      const rows = (customers.data?.data ?? []).map(customerRow);
      writeFile(rows, CUSTOMER_HEADER, format, "Customers", slug);
    }
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
        <p className="text-muted-foreground">Download your business data as CSV or Excel</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
            <CardDescription>Choose what to export and in which format.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Data Type</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {DATA_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => setDataType(value)}
                    className={cn("rounded-lg border p-4 text-left transition-colors",
                      dataType === value ? "border-primary bg-primary/5" : "hover:bg-muted/50")}>
                    <Icon className="mb-2 h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">{label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                  </button>
                ))}
              </div>
            </div>

            {dataType === "bookings" && (
              <div className="space-y-2">
                <Label>Date Range <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <div className="flex items-center gap-2">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9" />
                  <span className="shrink-0 text-sm text-muted-foreground">to</span>
                  <Input type="date" value={endDate}   onChange={(e) => setEndDate(e.target.value)}   className="h-9" />
                </div>
                {badRange
                  ? <p className="text-xs text-destructive">Pick both a start and an end date, with the start first.</p>
                  : <p className="text-xs text-muted-foreground">Filters by slot date.</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label>File Format</Label>
              <div className="flex gap-3">
                {FORMAT_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => setFormat(value)}
                    className={cn("flex-1 rounded-lg border p-3 text-left transition-colors",
                      format === value ? "border-primary bg-primary/5" : "hover:bg-muted/50")}>
                    <Icon className="mb-1.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Exports up to the {EXPORT_LIMIT} most recent {dataType}
              {!isLoading && total > EXPORT_LIMIT ? ` (${total} match — only the first ${EXPORT_LIMIT} are included)` : ""}.
            </p>

            <Button onClick={handleExport} disabled={isLoading || downloaded || total === 0 || (dataType === "bookings" && badRange)} className="w-full">
              {downloaded
                ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Downloaded!</>
                : <><Download className="mr-2 h-4 w-4" /> Download {format.toUpperCase()}</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What&apos;s included?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div>
              <p className="mb-1.5 font-medium">Bookings export</p>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                <li>Booking number and slot date/time</li>
                <li>Customer name, phone and ground</li>
                <li>Amount, fee, total, paid and due</li>
                <li>Booking and payment status, source</li>
              </ul>
            </div>
            <div>
              <p className="mb-1.5 font-medium">Customers export</p>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                <li>Name, phone and email</li>
                <li>Total bookings and spending</li>
                <li>Last booking date</li>
                <li>Due amounts and tier tag</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
