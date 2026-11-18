"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  SettingsLoadError,
  SettingsLoading,
} from "@/components/features/settings/settings-load-state";
import { sectionTitle } from "@/components/section-title";
import { useMe } from "@/hooks/useMe";

const GENERAL = "/dashboard/settings/general";
const GROUND_PAGES = /^\/dashboard\/grounds(?:\/[^/]+(?:\/edit)?)?$/;
const LIVE_PAGES = new Set(["/dashboard", "/dashboard/slots", GENERAL]);

export function TenantDashboardContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const owner = useMe("owner");
  const tenant = owner.data?.tenant;
  const needsSetup = tenant && tenant.status !== "suspended" && !tenant.setupComplete;

  useEffect(() => {
    if (needsSetup && pathname !== GENERAL) router.replace(GENERAL);
  }, [needsSetup, pathname, router]);

  if (owner.isError)
    return <SettingsLoadError what="turf account" onRetry={() => owner.refetch()} />;
  if (!tenant || (needsSetup && pathname !== GENERAL)) return <SettingsLoading />;
  if (tenant.status === "suspended") {
    return (
      <ModuleNotice
        title="Turf suspended"
        message="Contact your platform administrator to restore access."
      />
    );
  }
  if (LIVE_PAGES.has(pathname) || GROUND_PAGES.test(pathname)) return children;
  return (
    <ModuleNotice
      title={sectionTitle(pathname)}
      message="This section is not available for tenant accounts yet."
    />
  );
}

function ModuleNotice({ title, message }: { title: string; message: string }) {
  return (
    <section className="bg-card space-y-2 rounded-xl border p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground text-sm">{message}</p>
    </section>
  );
}
