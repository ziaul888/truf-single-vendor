"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, FileSpreadsheet, Download, CheckCircle2, CalendarDays, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookings, type BookingRow } from "@/hooks/useBookings";
import { useCustomers, type Customer } from "@/hooks/useCustomers";
import * as XLSX from "xlsx";

type DataType     = "bookings" | "customers";
type ExportFormat = "csv" | "xlsx";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

function exportBookingsCSV(rows: BookingRow[]): string {
  const header = "ID,Customer,Ground,Date,Start,End,Duration,Amount,Status,Payment Status,Created";
  const lines  = rows.map((b) =>
    `${b.id},"${b.customerName}","${b.groundName}",${b.date},${b.startTime},${b.endTime},${b.duration},${b.amount},${b.status},${b.paymentStatus},${b.createdAt}`
  );
  return [header, ...lines].join("\n");
}

function exportCustomersCSV(rows: Customer[]): string {
  const header = "ID,Name,Phone,Email,Since,Bookings,Total Spent,Last Booking,Due Amount,Tag";
  const lines  = rows.map((c) =>
    `${c.id},"${c.name}",${c.phone},${c.email},${c.since},${c.bookings},${c.totalSpent},${c.lastBooking},${c.dueAmount},${c.tag}`
  );
  return [header, ...lines].join("\n");
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

  const bookings  = useBookings();
  const customers = useCustomers();

  const isLoading = dataType === "bookings" ? bookings.isLoading : customers.isLoading;

  function handleExport() {
    const slug     = `${dataType}-${new Date().toISOString().split("T")[0]}`;

    if (dataType === "bookings") {
      let rows = bookings.data ?? [];
      if (startDate) rows = rows.filter((b) => b.date >= startDate);
      if (endDate)   rows = rows.filter((b) => b.date <= endDate);

      if (format === "csv") {
        downloadBlob(new Blob([exportBookingsCSV(rows)], { type: "text/csv" }), `${slug}.csv`);
      } else {
        const ws = XLSX.utils.json_to_sheet(rows.map((b) => ({
          ID: b.id, Customer: b.customerName, Ground: b.groundName, Date: b.date,
          Start: b.startTime, End: b.endTime, "Duration (h)": b.duration, Amount: b.amount,
          Status: b.status, "Payment Status": b.paymentStatus,
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bookings");
        XLSX.writeFile(wb, `${slug}.xlsx`);
      }
    } else {
      const rows = customers.data?.customers ?? [];
      if (format === "csv") {
        downloadBlob(new Blob([exportCustomersCSV(rows)], { type: "text/csv" }), `${slug}.csv`);
      } else {
        const ws = XLSX.utils.json_to_sheet(rows.map((c) => ({
          ID: c.id, Name: c.name, Phone: c.phone, Email: c.email, Since: c.since,
          Bookings: c.bookings, "Total Spent": c.totalSpent, "Last Booking": c.lastBooking,
          "Due Amount": c.dueAmount, Tag: c.tag,
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Customers");
        XLSX.writeFile(wb, `${slug}.xlsx`);
      }
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

            <Button onClick={handleExport} disabled={isLoading || downloaded} className="w-full">
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
                <li>Booking ID and date</li>
                <li>Customer name and ground</li>
                <li>Duration and amount</li>
                <li>Booking and payment status</li>
              </ul>
            </div>
            <div>
              <p className="mb-1.5 font-medium">Customers export</p>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                <li>Customer ID, name, and contacts</li>
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
