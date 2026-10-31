"use client";

import { useMe } from "@/hooks/useMe";
import { SettingsPageHeader } from "@/components/features/settings/settings-page-header";
import { StaffAccessList } from "@/components/features/settings/access/staff-access-list";
import { RolesTable } from "@/components/features/settings/access/roles-table";
import { AccessFacts } from "@/components/features/settings/access/access-facts";

// Read-only: staff and roles are changed on the Staff page.
export default function AccessSettingsPage() {
  const { data: me } = useMe();

  return (
    <div className="space-y-5">
      <SettingsPageHeader title="Access" description="Staff accounts, roles and what each role can do" />
      {me && <StaffAccessList isAdmin={me.role === "admin"} />}
      <RolesTable />
      <AccessFacts />
    </div>
  );
}
