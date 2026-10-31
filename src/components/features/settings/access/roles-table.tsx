"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePermissions } from "@/hooks/useSettings";
import { describeAccess, groupPermissions, type PermissionArea, type RoleAccess } from "@/lib/permission-groups";
import { cn } from "@/lib/utils";
import { SettingsSection } from "@/components/features/settings/settings-section";

function AccessCell({ access }: { access: RoleAccess }) {
  const none = !access.view && access.change === "none";
  return <span className={cn("text-sm", none && "text-muted-foreground")}>{describeAccess(access)}</span>;
}

function AdminOnlyCell({ area }: { area: PermissionArea }) {
  if (area.adminOnly.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <ul className="flex flex-wrap gap-1">
      {area.adminOnly.map((item) => (
        <li key={`${item.access} ${item.path}`}>
          <Badge variant="outline" className="gap-1 border-amber-300 font-normal text-amber-800 dark:border-amber-700 dark:text-amber-300">
            <span className="font-semibold capitalize">{item.access}</span>
            <code className="font-mono text-[11px]">{item.path}</code>
          </Badge>
        </li>
      ))}
    </ul>
  );
}

/** What each role can do, generated from turf-api's own route guards. */
export function RolesTable() {
  const permissions = usePermissions();

  return (
    <SettingsSection
      title="Roles"
      icon={ShieldCheck}
      description="Generated from the API's own checks, so it always matches what each role can really do. View = read; change = create, edit, delete or run."
    >
      {permissions.isLoading && <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
      {permissions.isError && <p className="text-sm text-destructive">Couldn&apos;t load the roles.</p>}
      {permissions.data && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Admin only</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupPermissions(permissions.data).map((area) => (
                <TableRow key={area.area}>
                  <TableCell className="whitespace-nowrap font-medium">{area.area}</TableCell>
                  <TableCell className="whitespace-nowrap"><AccessCell access={area.admin} /></TableCell>
                  <TableCell className="whitespace-nowrap"><AccessCell access={area.manager} /></TableCell>
                  <TableCell><AdminOnlyCell area={area} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SettingsSection>
  );
}
