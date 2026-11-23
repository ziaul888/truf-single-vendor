export const PLAN_FEATURES = ["staff", "reports", "website", "refunds"] as const;
export type PlanFeature = (typeof PLAN_FEATURES)[number];

export const CORE_PLAN_FEATURES = [
  "Grounds, slots and booking calendar",
  "Manual bookings and customer records",
] as const;

export const PLAN_FEATURE_DETAILS = {
  staff: {
    label: "Staff accounts",
    description: "Add admins and managers to help run the turf.",
  },
  reports: {
    label: "Reports and exports",
    description: "See sales and booking trends and download CSV reports.",
  },
  website: {
    label: "Customer booking website",
    description: "Publish a site where customers can view grounds and book slots.",
  },
  refunds: {
    label: "Refund booking list",
    description: "View cancelled bookings with pending or completed refunds in one place.",
  },
} satisfies Record<PlanFeature, { label: string; description: string }>;

export function hasPlanFeature(features: readonly PlanFeature[] | undefined, feature: PlanFeature) {
  return (features ?? PLAN_FEATURES).includes(feature);
}

const FEATURE_ROUTES = [
  ["/dashboard/staff", "staff"],
  ["/dashboard/settings/access", "staff"],
  ["/dashboard/reports", "reports"],
  ["/dashboard/settings/website", "website"],
  ["/dashboard/bookings/refunds", "refunds"],
] as const;

export function featureForDashboardPath(path: string) {
  return FEATURE_ROUTES.find(([base]) => path === base || path.startsWith(base + "/"))?.[1];
}
