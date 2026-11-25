"use client";

import { useMe } from "@/hooks/useMe";
import { useDashboardAudience } from "@/components/dashboard-audience";
import { SettingsPageHeader } from "@/components/features/settings/settings-page-header";
import { StaffAccessList } from "@/components/features/settings/access/staff-access-list";
import { RolesTable } from "@/components/features/settings/access/roles-table";
import { AccessFacts } from "@/components/features/settings/access/access-facts";

// Read-only: staff and roles are changed on the Staff page.
export default function AccessSettingsPage() {
  const { data: me } = useMe(useDashboardAudience());
  const waitingForSetup = me?.role === "owner" && !me.tenant.setupComplete;

  return (
    <div className="space-y-5">
      <SettingsPageHeader title="Access" description="Staff accounts, roles and what each role can do" />
      {waitingForSetup && <p className="text-muted-foreground text-sm">Save General settings to manage your staff.</p>}
      {me && !waitingForSetup && <StaffAccessList isAdmin={me.role === "admin" || me.role === "owner"} />}
      <RolesTable />
      <AccessFacts />
    </div>
  );
}
