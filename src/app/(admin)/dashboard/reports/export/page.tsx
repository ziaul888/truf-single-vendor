"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, CalendarDays, Download, FileSpreadsheet, FileText, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { venueToday } from "@/lib/slot-format";
import { downloadReport, type ExportFormat } from "@/lib/report-export";
import type { ExportType } from "@/types/report";

type Grouping = "day" | "week";

const DATA_OPTIONS = [
  { value: "revenue",   label: "Revenue",   description: "Daily or weekly money received, refunds and net, by payment method", icon: Banknote },
  { value: "bookings",  label: "Bookings",  description: "Every booking with its slot, amounts and statuses",                     icon: CalendarDays },
  { value: "customers", label: "Customers", description: "Customer profiles with bookings, spending and dues",                   icon: Users },
] as const;

const FORMAT_OPTIONS = [
  { value: "csv",  label: "CSV",   description: "Opens in any spreadsheet app", icon: FileText },
  { value: "xlsx", label: "Excel", description: "Microsoft Excel workbook",     icon: FileSpreadsheet },
] as const;

const INCLUDED: Record<ExportType, string[]> = {
  revenue: ["Period start and end", "Received, refunds and net revenue", "Card, cash and bank transfer", "Bookings played in the period"],
  bookings: ["Booking number, ground, date and time", "Customer name and phone", "Amount, fee, total, paid and due", "Booking and payment status, source"],
  customers: ["Name, phone and email", "Customer since and last booking", "Bookings and total spent", "Due amount and tag"],
};

const RANGE_HINT: Record<ExportType, string> = {
  revenue: "Dated by when money was received or refunded.",
  bookings: "Filters by the day each slot is played.",
  customers: "Optional: only customers who joined in this range.",
};

function OptionCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={cn("rounded-lg border p-4 text-left transition-colors", selected ? "border-primary bg-primary/5" : "hover:bg-muted/50")}>
      {children}
    </button>
  );
}

export default function ExportPage() {
  const [type, setType] = useState<ExportType>("revenue");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [grouping, setGrouping] = useState<Grouping>("day");
  const [from, setFrom] = useState(venueToday(-29));
  const [to, setTo] = useState(venueToday());
  const [busy, setBusy] = useState(false);

  const rangeOptional = type === "customers";
  const oneMissing = !!from !== !!to;
  const rangeError =
    oneMissing || (!rangeOptional && (!from || !to))
      ? "Pick both a start and an end date."
      : from && to && from > to ? "The start date must be on or before the end date." : null;

  async function handleExport() {
    setBusy(true);
    try {
      await downloadReport({ type, format, from: from || undefined, to: to || undefined, groupBy: type === "revenue" ? grouping : undefined });
      toast.success("Download started");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The export failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Export Data</h1>
        <p className="text-sm text-muted-foreground sm:text-base">Download your business data as CSV or Excel</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
            <CardDescription>Choose what to export, the dates, and the file format.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Data</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {DATA_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                  <OptionCard key={value} selected={type === value} onClick={() => setType(value)}>
                    <Icon className="mb-2 h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">{label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                  </OptionCard>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-from">
                Date range {rangeOptional && <span className="font-normal text-muted-foreground">(optional)</span>}
              </Label>
              <div className="flex items-center gap-2">
                <Input id="export-from" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="h-9" />
                <span className="shrink-0 text-sm text-muted-foreground">to</span>
                <Input id="export-to" aria-label="End date" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="h-9" />
                {rangeOptional && (from || to) && (
                  <Button variant="ghost" size="sm" onClick={() => { setFrom(""); setTo(""); }}>Clear</Button>
                )}
              </div>
              <p className={cn("text-xs", rangeError ? "text-destructive" : "text-muted-foreground")}>
                {rangeError ?? `${RANGE_HINT[type]} Up to 366 days.`}
              </p>
            </div>

            {type === "revenue" && (
              <div className="space-y-2">
                <Label>One row per</Label>
                <div className="flex w-fit gap-1 rounded-lg border p-1">
                  {(["day", "week"] as const).map((g) => (
                    <Button key={g} size="sm" className="h-7 text-xs" variant={grouping === g ? "default" : "ghost"} onClick={() => setGrouping(g)}>
                      {g === "day" ? "Day" : "Week (Sat–Fri)"}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>File format</Label>
              <div className="flex gap-3">
                {FORMAT_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                  <OptionCard key={value} selected={format === value} onClick={() => setFormat(value)}>
                    <Icon className="mb-1.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </OptionCard>
                ))}
              </div>
            </div>

            <Button onClick={handleExport} disabled={busy || !!rangeError} className="w-full">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Download {format === "csv" ? "CSV" : "Excel"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What&apos;s included?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="font-medium">{DATA_OPTIONS.find((o) => o.value === type)?.label} export</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              {INCLUDED[type].map((line) => <li key={line}>{line}</li>)}
            </ul>
            <p className="text-xs text-muted-foreground">Every matching row is included. Money is in taka with two decimals.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
