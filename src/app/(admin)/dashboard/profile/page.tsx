"use client";

import { Loader2, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/features/users/change-password-form";
import { ROLE_META } from "@/components/features/users/role-meta";
import { useMe } from "@/hooks/useMe";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { data: me, isLoading } = useMe();

  if (isLoading || !me) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const role = ROLE_META[me.role];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your name, email and role are managed by an admin from Staff Management.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-5 p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {me.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="flex items-center gap-2 text-lg font-semibold">
              <UserRound className="h-4 w-4 text-muted-foreground" /> {me.name}
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" /> {me.email}
            </p>
            <p className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold", role.badge)}>
                {role.label}
              </span>
              <span className="text-muted-foreground">{role.summary}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordForm />
    </div>
  );
}
