"use client";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export function PlatformBack({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium outline-none focus-visible:ring-2"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  );
}
export function BillingError({ message }: { message: string }) {
  return message ? (
    <p
      role="alert"
      className="bg-destructive/10 text-destructive border-destructive/20 rounded-xl border p-3 text-sm leading-relaxed"
    >
      {message}
    </p>
  ) : null;
}
export function BillingStatus({ status }: { status: string }) {
  const labels: Record<string, string> = {
    pending: "Awaiting payment",
    scheduled: "Scheduled",
    active: "Active",
    past_due: "Past due",
    cancelled: "Cancelled",
    issued: "Unpaid",
    overdue: "Overdue",
    paid: "Paid",
    void: "Voided",
  };
  return (
    <span className="bg-muted/60 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap">
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          ["paid", "active"].includes(status)
            ? "bg-success"
            : ["past_due", "overdue"].includes(status)
              ? "bg-warning"
              : status === "scheduled"
                ? "bg-info"
                : "bg-muted-foreground"
        )}
      />
      {labels[status] ?? status}
    </span>
  );
}
export function BillingEmpty({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <section className="bg-card rounded-2xl border border-dashed px-5 py-12 text-center">
      <FileText className="text-primary mx-auto h-9 w-9" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
        {description}
      </p>
      {href && (
        <Button asChild className="mt-5 h-11">
          <Link href={href}>{action}</Link>
        </Button>
      )}
    </section>
  );
}
export function BillingPagination({
  page,
  total,
  busy,
  onPage,
}: {
  page: number;
  total: number;
  busy: boolean;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / 12));
  return pages > 1 ? (
    <nav
      aria-label="Billing pages"
      className="flex items-center justify-between gap-2 border-t pt-5"
    >
      <Button
        variant="outline"
        className="h-11"
        disabled={page === 1 || busy}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </Button>
      <span className="text-muted-foreground text-sm">
        Page {page} of {pages}
      </span>
      <Button
        variant="outline"
        className="h-11"
        disabled={page === pages || busy}
        onClick={() => onPage(page + 1)}
      >
        Next
      </Button>
    </nav>
  ) : null;
}
