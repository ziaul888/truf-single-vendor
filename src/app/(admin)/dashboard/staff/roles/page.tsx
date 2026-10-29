import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_META } from "@/components/features/users/role-meta";
import { USER_ROLES } from "@/validations/user";

const ROLE_PERMISSIONS: Record<(typeof USER_ROLES)[number], string[]> = {
  admin: [
    "Everything a manager can do",
    "Add, edit and deactivate staff accounts",
    "Reset staff passwords",
    "Manage grounds and pricing",
    "Revenue reports and CSV export",
  ],
  manager: [
    "View the dashboard",
    "Manage bookings and refunds",
    "Block and unblock slots",
    "Change their own password",
  ],
};

export default function StaffRolesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Roles</h1>
        <p className="text-sm text-muted-foreground">
          v1 has two fixed roles. Set a person&apos;s role from Staff Management.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {USER_ROLES.map((role) => (
          <Card key={role}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" /> {ROLE_META[role].label}
              </CardTitle>
              <CardDescription>{ROLE_META[role].summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm">
                {ROLE_PERMISSIONS[role].map((p) => (
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
