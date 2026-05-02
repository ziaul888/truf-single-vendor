"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Users, ShieldCheck, UserPlus, Mail, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

const USERS = [
  { id: 1, name: "Nipon",       email: "nipon@6amtech.com",     role: "Super Admin", avatar: "N", joined: "Jan 2024" },
  { id: 2, name: "Rafiq Ahmed", email: "rafiq@turfadmin.com",   role: "Manager",     avatar: "R", joined: "Mar 2024" },
  { id: 3, name: "Sadia Akter", email: "sadia@turfadmin.com",   role: "Attendant",   avatar: "S", joined: "Apr 2024" },
];

const ROLE_COLOR: Record<string, string> = {
  "Super Admin": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  "Manager":     "bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400",
  "Attendant":   "bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400",
};

const ROLES = [
  {
    name: "Super Admin",
    desc: "Full access to all features and settings",
    color: "border-violet-200 dark:border-violet-800",
    permissions: ["Manage grounds", "Manage bookings", "Manage slots", "Manage customers", "Manage staff", "View payments", "Process refunds", "Edit settings", "Danger zone"],
  },
  {
    name: "Manager",
    desc: "Operational access — no settings or danger zone",
    color: "border-blue-200 dark:border-blue-800",
    permissions: ["Manage grounds", "Manage bookings", "Manage slots", "Manage customers", "View payments", "Process refunds"],
  },
  {
    name: "Attendant",
    desc: "Day-to-day slot and booking management only",
    color: "border-green-200 dark:border-green-800",
    permissions: ["View grounds", "Manage bookings", "Manage slots"],
  },
];

export default function AccessSettingsPage() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);

  function sendInvite() {
    if (!inviteEmail) return;
    setSending(true);
    setTimeout(() => { setSending(false); setInviteEmail(""); toast.success(`Invite sent to ${inviteEmail}`); }, 600);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Access</h2>
        <p className="text-sm text-muted-foreground">Admin users and role permissions</p>
      </div>

      {/* Admin users */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-muted-foreground" />Admin users</CardTitle>
            <span className="text-xs text-muted-foreground">{USERS.length} members</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-border rounded-lg border overflow-hidden">
            {USERS.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {u.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", ROLE_COLOR[u.role])}>{u.role}</span>
                <p className="shrink-0 text-[11px] text-muted-foreground hidden sm:block">Since {u.joined}</p>
                <button className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Invite */}
          <div className="flex items-center gap-2 border-t pt-4">
            <div className="relative flex-1 max-w-xs">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                placeholder="colleague@example.com"
                className="pl-9"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={sendInvite} disabled={sending || !inviteEmail}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />{sending ? "Sending…" : "Send invite"}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">Invitees receive an email to set their password and join the team.</p>
        </CardContent>
      </Card>

      {/* Roles */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4 text-muted-foreground" />Roles &amp; permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ROLES.map((role) => (
            <div key={role.name} className={cn("rounded-xl border-2 p-4 space-y-3", role.color)}>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", ROLE_COLOR[role.name])}>{role.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{role.desc}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map((p) => (
                  <span key={p} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{p}</span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
