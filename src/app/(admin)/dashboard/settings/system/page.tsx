"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, AlertTriangle, Download, FileText, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function DangerAction({ icon: Icon, label, desc, buttonLabel, variant = "destructive", onClick }: {
  icon: React.ElementType; label: string; desc: string; buttonLabel: string;
  variant?: "destructive" | "outline"; onClick: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-destructive">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      {confirming ? (
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" onClick={() => { setConfirming(false); onClick(); }}>Confirm</Button>
          <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>Cancel</Button>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirming(true)}>
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}

export default function SystemSettingsPage() {
  const [exporting, setExporting] = useState(false);

  function exportCsv(type: string) {
    setExporting(true);
    setTimeout(() => { setExporting(false); toast.success(`${type} exported`); }, 700);
  }

  function downloadBackup() {
    toast.success("Backup download started");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">System</h2>
        <p className="text-sm text-muted-foreground">Data management, backups and danger zone</p>
      </div>

      {/* Data & backup */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base"><Database className="h-4 w-4 text-muted-foreground" />Data &amp; backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Status */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Last backup",  value: "22 Apr 2026, 2:00 AM", color: "text-green-600 dark:text-green-400" },
              { label: "Database size", value: "42.3 MB",              color: "text-foreground" },
              { label: "Total records", value: "1,284",                color: "text-foreground" },
              { label: "Backup status", value: "Healthy",              color: "text-green-600 dark:text-green-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn("text-sm font-semibold mt-0.5", color)}>{value}</p>
              </div>
            ))}
          </div>

          {/* Export CSV */}
          <div>
            <p className="mb-2 text-sm font-medium">Export data as CSV</p>
            <div className="flex flex-wrap gap-2">
              {["Bookings", "Customers", "Payments", "Slots"].map((type) => (
                <Button key={type} variant="outline" size="sm" disabled={exporting} onClick={() => exportCsv(type)}>
                  <FileText className="mr-1.5 h-3.5 w-3.5" />Export {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Full backup */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Full database backup</p>
              <p className="text-xs text-muted-foreground">Downloads a complete SQL dump of all data</p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadBackup}>
              <Download className="mr-1.5 h-4 w-4" />Download backup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/40">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertTriangle className="h-4 w-4" />Danger zone
          </CardTitle>
          <p className="text-xs text-muted-foreground">These actions are irreversible. Proceed with extreme caution.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <DangerAction
            icon={Trash2}
            label="Clear all unbooked slots"
            desc="Deletes every available and blocked slot across all grounds. Booked and partial slots are preserved."
            buttonLabel="Clear slots"
            onClick={() => toast.success("Unbooked slots cleared")}
          />
          <DangerAction
            icon={RefreshCw}
            label="Reset all settings to defaults"
            desc="Reverts every setting on this page to factory defaults. Your data (bookings, customers) is not affected."
            buttonLabel="Reset settings"
            onClick={() => toast.success("Settings reset to defaults")}
          />
          <DangerAction
            icon={Trash2}
            label="Wipe all data"
            desc="Permanently deletes ALL data — bookings, customers, payments, slots, and grounds. This cannot be undone."
            buttonLabel="Wipe everything"
            onClick={() => toast.error("Action blocked in demo mode")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
