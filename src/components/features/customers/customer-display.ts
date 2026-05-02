const AVATAR_COLORS = ["#ef4444","#f97316","#eab308","#16a34a","#0891b2","#2563eb","#7c3aed","#db2777","#0d9488","#9333ea"];

export function avatarBg(name: string): string {
  return AVATAR_COLORS[name.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
}

export function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function formatSince(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function formatTaka(n: number, compact = false): string {
  if (n === 0) return "—";
  if (compact && n >= 100000) return `৳\u00a0${(n / 100000).toFixed(1)}L`;
  return `৳\u00a0${n.toLocaleString("en-IN")}`;
}

export const TAG_CLS: Record<string, string> = {
  VIP:     "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Regular: "bg-blue-100  text-blue-700  dark:bg-blue-900/40  dark:text-blue-400  border-blue-200  dark:border-blue-800",
  New:     "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800",
};

export const PAY_CLS: Record<string, string> = {
  paid:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  partial:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  pending:  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  refunded: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export const BK_CLS: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
