import { formatSlotDate, slotPriceLabel } from "@/lib/slot-format";
import type { BookingStatus, CustomerTag, PaymentStatus } from "@/types/booking";

const AVATAR_COLORS = ["#ef4444","#f97316","#eab308","#16a34a","#0891b2","#2563eb","#7c3aed","#db2777","#0d9488","#9333ea"];

export function avatarBg(name: string): string {
  return AVATAR_COLORS[name.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
}

export function initials(name: string): string {
  return name.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function formatSince(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** "2 Nov 2026"-style date from a venue-local "YYYY-MM-DD" or an ISO timestamp; "—" when missing. */
export function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return formatSlotDate(d);
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

/** Money in the smallest unit → "৳ 1,500" ("—" for zero). `compact` shows lakhs as "৳ 1.2L". */
export function formatTaka(minor: number, compact = false): string {
  if (minor === 0) return "—";
  const major = minor / 100;
  if (compact && major >= 100000) return `৳ ${(major / 100000).toFixed(1)}L`;
  return slotPriceLabel(minor).replace(" ", " ");
}

export const TAG_LABEL: Record<CustomerTag, string> = { vip: "VIP", regular: "Regular", new: "New" };

export const TAG_FILTER_OPTIONS: { value: CustomerTag; label: string }[] = [
  { value: "vip",     label: "VIP (10+ bookings)" },
  { value: "regular", label: "Regular (3–9)" },
  { value: "new",     label: "New (1–2)" },
];

export const TAG_CLS: Record<CustomerTag, string> = {
  vip:     "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  regular: "bg-blue-100  text-blue-700  dark:bg-blue-900/40  dark:text-blue-400  border-blue-200  dark:border-blue-800",
  new:     "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800",
};

export const PAY_CLS: Record<PaymentStatus, string> = {
  paid:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  partial:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  unpaid:   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  refunded: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  failed:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const BK_CLS: Record<BookingStatus, string> = {
  pending:   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

/** Builds CSV text and downloads it as `filename`. */
export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const text = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
