import { Ban, Smartphone } from "lucide-react";
import { slotPriceLabel } from "@/lib/slot-format";
import type { WalletPayment } from "@/types/booking";
import { PAYMENT_METHOD_LABEL } from "./booking-status-helpers";

const STATUS_LABEL: Record<WalletPayment["status"], string> = {
  pending: "Waiting for you to verify",
  succeeded: "Verified",
  failed: "Rejected",
  refunded: "Refunded",
};

/** The portal customer paid by bKash / Nagad. */
export function WalletBadge({ payment }: { payment: WalletPayment }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-semibold text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
      <Smartphone className="h-3 w-3" />{PAYMENT_METHOD_LABEL[payment.method]}
    </span>
  );
}

/** Method, TrxID and sender of a bKash / Nagad payment, for staff to match in their own app. */
export function WalletPaymentRows({ payment }: { payment: WalletPayment }) {
  const rows: [string, string][] = [
    ["Paid by", `${PAYMENT_METHOD_LABEL[payment.method]} · ${slotPriceLabel(payment.amount)}`],
    ["TrxID", payment.reference ?? "—"],
    ["Sent from", payment.payerNumber],
    ["Status", STATUS_LABEL[payment.status]],
  ];
  return (
    <>
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{label}</span>
          <span className={`text-right font-medium ${label === "TrxID" ? "font-mono" : ""}`}>{value}</span>
        </div>
      ))}
    </>
  );
}

/** A short box on the review card and booking detail: what the customer sent. */
export function WalletPaymentNotice({ payment }: { payment: WalletPayment }) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-pink-50 px-3 py-2 text-xs text-pink-800 dark:bg-pink-950/30 dark:text-pink-200">
      <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        {PAYMENT_METHOD_LABEL[payment.method]} {slotPriceLabel(payment.amount)} · TrxID{" "}
        <span className="font-mono font-semibold">{payment.reference ?? "—"}</span> · from {payment.payerNumber}
        {" · "}{STATUS_LABEL[payment.status]}
        {payment.status === "pending" && ". Check your app, then Verify or Reject."}
      </span>
    </div>
  );
}

/** The customer asked to cancel while their payment was under review: verify and cancel with a refund, or reject. */
export function CancelRequestedBadge() {
  return (
    <span title="Verify and cancel with a refund, or reject the payment"
      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
      <Ban className="h-3 w-3" />Cancel requested
    </span>
  );
}
