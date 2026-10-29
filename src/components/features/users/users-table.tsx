"use client";

import { KeyRound, Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { StaffUser } from "@/hooks/useUsers";
import { ROLE_META } from "./role-meta";

interface UsersTableProps {
  users: StaffUser[];
  currentUserId?: string;
  onEdit: (user: StaffUser) => void;
  onResetPassword: (user: StaffUser) => void;
  onToggleActive: (user: StaffUser) => void;
}

const AVATAR_COLORS = ["#25a462", "#4db8ff", "#f0a040", "#a970ff", "#e05284", "#3fb7a8"];

function avatarColor(seed: string) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function UsersTable({ users, currentUserId, onEdit, onResetPassword, onToggleActive }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30">
          <TableHead className="w-[280px]">Staff</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Added</TableHead>
          <TableHead>Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => {
          const isSelf = u.id === currentUserId;
          return (
            <TableRow key={u.id} className={cn("transition-colors hover:bg-muted/20", !u.isActive && "opacity-60")}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: avatarColor(u.id) }}
                  >
                    {initials(u.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium leading-tight">
                      {u.name} {isSelf && <span className="text-xs font-normal text-muted-foreground">(you)</span>}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", ROLE_META[u.role].badge)}>
                  {ROLE_META[u.role].label}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{dateFormat.format(new Date(u.createdAt))}</TableCell>
              <TableCell>
                <Switch
                  checked={u.isActive}
                  onCheckedChange={() => onToggleActive(u)}
                  disabled={isSelf}
                  aria-label={`${u.isActive ? "Deactivate" : "Activate"} ${u.name}`}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-0.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onEdit(u)} aria-label={`Edit ${u.name}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onResetPassword(u)} aria-label={`Reset password for ${u.name}`}>
                    <KeyRound className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function UsersEmptyState({ searching }: { searching: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-semibold text-foreground">{searching ? "No staff match your search." : "No staff yet."}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {searching ? "Try a different name or email." : "Add your first team member."}
      </p>
    </div>
  );
}
