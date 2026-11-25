import type { UserRole } from "@/validations/user";

// v1 has exactly two roles; turf-api enforces what each can do.
export const ROLE_META: Record<UserRole, { label: string; summary: string; badge: string }> = {
  admin: {
    label: "Admin",
    summary: "Full access, including staff accounts, grounds and pricing.",
    badge: "bg-warning/10 text-warning-foreground border-warning/30",
  },
  manager: {
    label: "Manager",
    summary: "Day-to-day operations: bookings, refunds and blocking slots.",
    badge: "bg-info/10 text-info border-info/30",
  },
};
