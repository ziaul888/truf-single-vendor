"use client";
import Link from "next/link";
import { usePlatformMe } from "@/hooks/usePlatform";
import { usePlatformInvoice } from "@/hooks/usePlatformBilling";
import { displayBillingDate, formatBdt } from "@/lib/platform-billing";
import { PlatformBack, BillingStatus } from "./billing-parts";
import { BillingDialog } from "./platform-billing-dialog";
import { PlatformReceiptForm, receiptMethods } from "./platform-receipt-form";
import { PlatformLoading, PlatformReadError } from "./platform-states";
export function PlatformInvoiceDetail({ id }: { id: string }) {
  const me = usePlatformMe(),
    query = usePlatformInvoice(me.data?.id, id),
    invoice = query.data;
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PlatformBack href="/platform/invoices">Invoices</PlatformBack>
      {query.isError ? (
        <PlatformReadError error={query.error} onRetry={() => query.refetch()} />
      ) : !invoice ? (
        <PlatformLoading label="Loading invoice" />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-primary text-xs font-semibold tracking-widest uppercase">
                Subscription invoice
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight break-all sm:text-3xl">
                {invoice.number}
              </h1>
              <Link
                className="text-primary mt-3 inline-flex min-h-11 items-center text-sm break-words underline underline-offset-4"
                href={`/platform/tenants/${invoice.tenantId}`}
              >
                {invoice.tenant.name}
              </Link>
            </div>
            <BillingStatus status={invoice.status} />
          </div>
          <section className="bg-card space-y-6 rounded-2xl border p-5 sm:p-7">
            <div>
              <p className="text-muted-foreground text-sm">Invoice amount</p>
              <p className="mt-2 text-4xl font-bold break-words tabular-nums">
                {formatBdt(invoice.amount)}
              </p>
            </div>
            <dl className="grid gap-6 text-sm sm:grid-cols-2">
              {[
                ["Plan", invoice.planName],
                ["Frequency", invoice.interval === "monthly" ? "Monthly" : "Yearly"],
                ["Period starts", displayBillingDate(invoice.periodStart)],
                ["Period ends", displayBillingDate(invoice.periodEnd)],
                ["Payment due", displayBillingDate(invoice.dueOn)],
                ["Created", displayBillingDate(invoice.createdAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-medium break-words">{value}</dd>
                </div>
              ))}
            </dl>
            {["issued", "overdue"].includes(invoice.status) && (
              <div className="space-y-3 border-t pt-5">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Verify the full payment in your bKash, Nagad or bank account before recording it.
                </p>
                <BillingDialog
                  label="Record payment"
                  title="Record a verified payment"
                  description="This records a payment you have already received."
                  variant="default"
                >
                  {(close, setBusy) => (
                    <PlatformReceiptForm
                      userId={me.data?.id}
                      invoice={invoice}
                      close={close}
                      setBusy={setBusy}
                    />
                  )}
                </BillingDialog>
              </div>
            )}
            {invoice.status === "void" && (
              <p className="bg-muted rounded-xl p-3 text-sm">
                This invoice was voided. No payment is required.
              </p>
            )}
          </section>
          {invoice.receipt && (
            <section className="bg-card rounded-2xl border p-5 sm:p-7">
              <h2 className="text-lg font-semibold">Payment receipt</h2>
              <dl className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
                {[
                  ["Received", formatBdt(invoice.receipt.amount)],
                  ["Method", receiptMethods[invoice.receipt.method]],
                  ["Reference", invoice.receipt.reference],
                  ["Received on", displayBillingDate(invoice.receipt.receivedOn)],
                  ["Recorded by", invoice.receipt.recordedBy.name],
                  ["Recorded on", displayBillingDate(invoice.receipt.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-medium break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </>
      )}
    </div>
  );
}
