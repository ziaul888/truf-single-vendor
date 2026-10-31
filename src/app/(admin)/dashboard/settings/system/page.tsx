"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/useMe";
import { useSystemStatus } from "@/hooks/useSettings";
import { NoPermission } from "@/components/features/no-permission";
import { SettingsPageHeader } from "@/components/features/settings/settings-page-header";
import { SystemHealth } from "@/components/features/settings/system/system-health";
import { ResetSettings } from "@/components/features/settings/system/reset-settings";

const TITLE = "System";
const DESCRIPTION = "Health of turf-api and resetting settings to defaults";

function Spinner() {
  return (
    <div className="flex justify-center py-24">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

// Admin only: the API refuses system status for managers.
export default function SystemSettingsPage() {
  const { data: me, isLoading: meLoading } = useMe();
  const isAdmin = me?.role === "admin";
  const status = useSystemStatus({ enabled: isAdmin });

  if (meLoading) return <Spinner />;
  if (!isAdmin) return <NoPermission reason="Only admins can see system status and reset settings." />;

  return (
    <div className="space-y-5">
      <SettingsPageHeader title={TITLE} description={DESCRIPTION}>
        <Button type="button" variant="outline" size="sm" onClick={() => status.refetch()} disabled={status.isFetching}>
          <RefreshCw className={`mr-1.5 h-4 w-4 ${status.isFetching ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </SettingsPageHeader>

      {status.isLoading && <Spinner />}
      {status.isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border py-12 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load the system status.</p>
          <Button variant="outline" size="sm" onClick={() => status.refetch()}>Try again</Button>
        </div>
      )}
      {status.data && <SystemHealth status={status.data} />}

      <ResetSettings />
    </div>
  );
}
