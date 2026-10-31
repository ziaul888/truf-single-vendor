"use client";

import Link from "next/link";
import { ArrowRight, Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUsers, type StaffUser } from "@/hooks/useUsers";
import { SettingsSection } from "@/components/features/settings/settings-section";

const LIST_LIMIT = 100;

function StaffRow({ user }: { user: StaffUser }) {
  return (
    <li className={cn("flex flex-wrap items-center justify-between gap-3 py-2.5", !user.isActive && "opacity-60")}>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">{user.role}</Badge>
        <Badge variant="outline" className={user.isActive ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
    </li>
  );
}

function StaffListBody({ enabled }: { enabled: boolean }) {
  const users = useUsers({ page: 1, limit: LIST_LIMIT, search: "" }, { enabled });

  if (!enabled) {
    return <p className="text-sm text-muted-foreground">Only admins can see the staff list. Ask an admin if your access needs to change.</p>;
  }
  if (users.isLoading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  if (users.isError || !users.data) return <p className="text-sm text-destructive">Couldn&apos;t load the staff list.</p>;
  if (users.data.total === 0) return <p className="text-sm text-muted-foreground">No staff accounts yet.</p>;

  return (
    <>
      <ul className="divide-y">
        {users.data.data.map((u) => <StaffRow key={u.id} user={u} />)}
      </ul>
      {users.data.total > LIST_LIMIT && (
        <p className="text-xs text-muted-foreground">Showing the first {LIST_LIMIT} of {users.data.total} accounts.</p>
      )}
    </>
  );
}

/** Who has an account and with which role. Changes happen on the Staff page. */
export function StaffAccessList({ isAdmin }: { isAdmin: boolean }) {
  return (
    <SettingsSection title="Staff accounts" icon={Users} description="Everyone who can sign in to the admin, and their role">
      <StaffListBody enabled={isAdmin} />
      {isAdmin && (
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/staff">Manage on Staff page <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
        </Button>
      )}
    </SettingsSection>
  );
}
