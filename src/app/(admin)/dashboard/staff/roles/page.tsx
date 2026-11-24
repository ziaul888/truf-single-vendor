"use client";

import { DashboardBackLink, DashboardPageHeader } from "@/components/features/dashboard/page-header";
import { ShieldCheck } from "lucide-react";
import { useDashboardAudience } from "@/components/dashboard-audience";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_META } from "@/components/features/users/role-meta";
import { USER_ROLES } from "@/validations/user";

const ROLE_PERMISSIONS: Record<(typeof USER_ROLES)[number], string[]> = {
  admin: [
    "Everything a manager can do",
    "Add, edit and deactivate staff accounts",
    "Reset staff passwords",
    "Manage grounds and pricing",
    "Sales reports and CSV export",
  ],
  manager: [
    "View the dashboard",
    "Manage bookings and refunds",
    "Block and unblock slots",
    "Change their own password",
  ],
};

const TENANT_PERMISSIONS: typeof ROLE_PERMISSIONS = {
  admin: [
    "Everything a manager can do",
    "Add, edit and deactivate staff accounts",
    "Reset staff passwords",
    "Manage grounds, pricing and slot generation",
    "Schedule and lift turf closures",
    "Edit turf settings",
  ],
  manager: [
    "View the dashboard, grounds, slots and turf settings",
    "Manage bookings, customer records and refunds",
    "Block and unblock slots",
    "View sales reports and export data",
    "Change their own password",
  ],
};

export default function StaffRolesPage() {
  const tenant = useDashboardAudience() === "owner";
  const permissions = tenant ? TENANT_PERMISSIONS : ROLE_PERMISSIONS;
  return (
    <div className="space-y-5">
      <DashboardPageHeader
        title="Roles"
        description="Review what each role can do. Assign roles from Staff."
        back={<DashboardBackLink href="/dashboard/staff">Back to staff</DashboardBackLink>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {USER_ROLES.map((role) => (
          <Card key={role}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" /> {ROLE_META[role].label}
              </CardTitle>
              {!tenant && <CardDescription>{ROLE_META[role].summary}</CardDescription>}
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm">
                {permissions[role].map((p) => (
                  <li key={p} className="flex gap-2"><span className="text-success">✓</span>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
