"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  SettingsLoadError,
  SettingsLoading,
} from "@/components/features/settings/settings-load-state";
import { useMe } from "@/hooks/useMe";
import { featureForDashboardPath, hasPlanFeature, PLAN_FEATURE_DETAILS } from "@/lib/plan-features";

const GENERAL = "/dashboard/settings/general";
const SETTINGS_PAGES = new Set([
  GENERAL,
  "/dashboard/settings/appearance",
  "/dashboard/settings/booking",
  "/dashboard/settings/payments",
  "/dashboard/settings/website",
  "/dashboard/settings/notifications",
  "/dashboard/settings/access",
  "/dashboard/settings/system",
]);

export function TenantDashboardContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dashboardPath = pathname.replace(/^\/admin(?=\/|$)/, "/dashboard");
  const router = useRouter();
  const owner = useMe("owner");
  const tenant = owner.data?.tenant;
  const needsSetup = tenant && tenant.status !== "suspended" && !tenant.setupComplete;
  const blockedBySetup = needsSetup && !SETTINGS_PAGES.has(dashboardPath);

  useEffect(() => {
    if (blockedBySetup) router.replace(pathname === dashboardPath ? GENERAL : "/admin/settings/general");
  }, [blockedBySetup, dashboardPath, pathname, router]);

  if (owner.isError)
    return <SettingsLoadError what="turf account" onRetry={() => owner.refetch()} />;
  if (!tenant || blockedBySetup) return <SettingsLoading />;
  if (tenant.status === "suspended") {
    return (
      <ModuleNotice
        title="Turf suspended"
        message="Contact your platform administrator to restore access."
      />
    );
  }
  const feature = featureForDashboardPath(dashboardPath);
  if (feature && !hasPlanFeature(tenant.features, feature)) {
    return (
      <ModuleNotice
        title={PLAN_FEATURE_DETAILS[feature].label}
        message="Contact your platform administrator to add this feature to your subscription."
      />
    );
  }
  return children;
}

function ModuleNotice({ title, message }: { title: string; message: string }) {
  return (
    <section className="bg-card space-y-2 rounded-xl border p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground text-sm">{message}</p>
    </section>
  );
}
