"use client";

import { useState } from "react";
import { History, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEmailLog } from "@/hooks/useSettings";
import { formatEventTime } from "@/lib/slot-format";
import { BookingsPagination } from "@/components/features/bookings/bookings-pagination";
import { SettingsSection } from "@/components/features/settings/settings-section";
import type { EmailKind, EmailLogEntry } from "@/types/settings";

const PAGE_SIZE = 10;

const EMAIL_KIND_LABEL: Record<EmailKind, string> = {
  booking_confirmed: "Booking confirmed",
  booking_received: "Booking received",
  booking_cancelled: "Booking cancelled",
  refund_issued: "Refund issued",
  payment_due: "Payment due",
  staff_new_booking: "Staff: new booking",
  staff_customer_cancelled: "Staff: customer cancelled",
  staff_due_digest: "Staff: due digest",
  test: "Test email",
};

function LogRow({ entry }: { entry: EmailLogEntry }) {
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatEventTime(entry.createdAt)}</TableCell>
      <TableCell className="text-sm">{entry.to}</TableCell>
      <TableCell className="whitespace-nowrap text-sm">{EMAIL_KIND_LABEL[entry.kind] ?? entry.kind}</TableCell>
      <TableCell className="max-w-[240px] truncate text-sm" title={entry.subject}>{entry.subject}</TableCell>
      <TableCell>
        {entry.ok ? (
          <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400">Sent</Badge>
        ) : (
          <div className="space-y-0.5">
            <Badge variant="outline" className="border-destructive/50 text-destructive">Failed</Badge>
            {entry.error && <p className="max-w-[220px] text-[11px] text-muted-foreground">{entry.error}</p>}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

function LogBody({ entries }: { entries: EmailLogEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Kind</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => <LogRow key={e.id} entry={e} />)}
        </TableBody>
      </Table>
    </div>
  );
}

/** Every email attempt, newest first, including failed and "not configured" ones. */
export function EmailLogTable() {
  const [page, setPage] = useState(1);
  const log = useEmailLog(page, PAGE_SIZE);

  return (
    <SettingsSection title="Email log" icon={History} description="Every email attempt, newest first. Addresses are partly hidden.">
      {log.isLoading && (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      )}
      {log.isError && <p className="py-6 text-center text-sm text-destructive">Couldn&apos;t load the email log.</p>}
      {log.data && log.data.total === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">No emails yet. They show up here as soon as one is sent or attempted.</p>
      )}
      {log.data && log.data.total > 0 && (
        <>
          <LogBody entries={log.data.data} />
          <BookingsPagination page={log.data.page} limit={log.data.limit} total={log.data.total} onPageChange={setPage} noun="emails" />
        </>
      )}
    </SettingsSection>
  );
}
