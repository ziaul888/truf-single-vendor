"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Save, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_STAFF, ROLE_META, avatarColor, initials, type Role, type StaffMember } from "../_data";

// ── Toast ──────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-2xl animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap">
      {type === "success" ? <span className="text-success">✓</span> : <span className="text-destructive">✕</span>}
      {message}
    </div>
  );
}

// ── Role Overview Card ─────────────────────────────────────────────────────

function RoleCard({ role, count, total }: { role: Role; count: number; total: number }) {
  const meta = ROLE_META[role];
  const granted = meta.permissions.filter((p) => p.allowed).length;

  return (
    <Card className="overflow-hidden">
      <div className="h-1" style={{ background: meta.dotColor }} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xl font-bold text-white"
              style={{ background: meta.dotColor }}
            >
              {meta.icon}
            </div>
            <div>
              <p className="font-bold text-foreground">{meta.label}</p>
              <p className="text-xs text-muted-foreground">{count} of {total} staff</p>
            </div>
          </div>
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", meta.badgeClass)}>
            {granted}/{meta.permissions.length} perms
          </span>
        </div>

        {/* Permission pills */}
        <div className="space-y-1.5 mb-4">
          {meta.permissions.map((p) => (
            <div key={p.label} className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold w-3 shrink-0"
                style={{ color: p.allowed ? meta.dotColor : "var(--muted-foreground)" }}
              >
                {p.allowed ? "✓" : "✕"}
              </span>
              <span className={cn("text-xs", p.allowed ? "text-foreground" : "text-muted-foreground/50 line-through")}>
                {p.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bar */}
        <div className="flex gap-1">
          {meta.permissions.map((p, i) => (
            <div key={i} className="flex-1 h-1 rounded-full"
              style={{ background: p.allowed ? meta.dotColor : "var(--muted)" }} />
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          <strong style={{ color: meta.dotColor }}>{granted}</strong> of {meta.permissions.length} permissions active
        </p>
      </CardContent>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

interface ToastState { message: string; type: "success" | "error"; key: number; }

export default function RolesPage() {
  const [staff,    setStaff]    = useState<StaffMember[]>(MOCK_STAFF);
  const [pending,  setPending]  = useState<Record<number, Role>>({});
  const [toast,    setToast]    = useState<ToastState | null>(null);
  const [saving,   setSaving]   = useState(false);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type, key: Date.now() });
    setTimeout(() => setToast(null), 2500);
  }

  function handleRoleChange(id: number, role: Role) {
    const original = staff.find((s) => s.id === id)?.role;
    setPending((prev) => {
      const next = { ...prev };
      if (role === original) { delete next[id]; }
      else { next[id] = role; }
      return next;
    });
  }

  function handleSave() {
    if (Object.keys(pending).length === 0) return;
    setSaving(true);
    // TODO: wire up real API
    setTimeout(() => {
      setStaff((prev) =>
        prev.map((s) => pending[s.id] ? { ...s, role: pending[s.id] } : s)
      );
      setPending({});
      setSaving(false);
      showToast(`${Object.keys(pending).length} role(s) updated successfully`);
    }, 700);
  }

  function handleReset() {
    setPending({});
    showToast("Changes discarded", "error");
  }

  const managerCount  = staff.filter((s) => s.role === "manager").length;
  const attendantCount = staff.filter((s) => s.role === "attendant").length;
  const changeCount   = Object.keys(pending).length;

  const grouped = useMemo(() => ({
    manager:   staff.filter((s) => s.role === "manager"),
    attendant: staff.filter((s) => s.role === "attendant"),
  }), [staff]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.75rem] font-black tracking-[0.15em] leading-tight uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Role Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Assign and manage roles for your team members
          </p>
        </div>
        {changeCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
              {changeCount} unsaved change{changeCount > 1 ? "s" : ""}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Discard
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving
                ? <><span className="h-3 w-3 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> Saving…</>
                : <><Save className="h-3.5 w-3.5" /> Save Changes</>}
            </Button>
          </div>
        )}
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RoleCard role="manager"   count={managerCount}   total={staff.length} />
        <RoleCard role="attendant" count={attendantCount} total={staff.length} />
      </div>

      {/* ── Assignment Table ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Role Assignments</h2>
          <p className="text-xs text-muted-foreground">
            Select a new role from the dropdown to stage a change, then click Save
          </p>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[260px]">Staff Member</TableHead>
                <TableHead>Ground</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead className="w-[180px]">Assign Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Managers group */}
              <TableRow className="bg-muted/10 hover:bg-muted/10">
                <TableCell colSpan={5} className="py-2 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
                      Managers · {grouped.manager.length}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
              {grouped.manager.map((s) => (
                <StaffRoleRow key={s.id} staff={s} pending={pending[s.id]} onChange={handleRoleChange} />
              ))}

              {/* Attendants group */}
              <TableRow className="bg-muted/10 hover:bg-muted/10">
                <TableCell colSpan={5} className="py-2 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
                      Attendants · {grouped.attendant.length}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
              {grouped.attendant.map((s) => (
                <StaffRoleRow key={s.id} staff={s} pending={pending[s.id]} onChange={handleRoleChange} />
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} />}
    </div>
  );
}

// ── Staff Role Row ─────────────────────────────────────────────────────────

function StaffRoleRow({
  staff: s, pending, onChange,
}: {
  staff: StaffMember;
  pending: Role | undefined;
  onChange: (id: number, role: Role) => void;
}) {
  const effectiveRole = pending ?? s.role;
  const isDirty       = pending !== undefined;
  const meta          = ROLE_META[effectiveRole];

  return (
    <TableRow className={cn("hover:bg-muted/20 transition-colors", isDirty && "bg-warning/5")}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: avatarColor(s.name) }}
          >
            {initials(s.name)}
          </div>
          <div className="min-w-0">
            <p className="font-medium leading-tight truncate text-sm">{s.name}</p>
            <p className="text-xs text-muted-foreground truncate">{s.email}</p>
          </div>
          {isDirty && (
            <span className="ml-1 rounded-full bg-warning/20 px-1.5 py-0.5 text-[10px] font-bold text-warning-foreground tracking-wide">
              CHANGED
            </span>
          )}
        </div>
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {s.ground || <span className="text-muted-foreground/40">—</span>}
      </TableCell>

      <TableCell>
        <span className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
          s.active
            ? "bg-success/10 text-success"
            : "bg-muted text-muted-foreground"
        )}>
          {s.active ? "Active" : "Inactive"}
        </span>
      </TableCell>

      <TableCell>
        {isDirty ? (
          <div className="flex items-center gap-1.5">
            <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold line-through opacity-40", ROLE_META[s.role].badgeClass)}>
              {ROLE_META[s.role].label}
            </span>
            <span className="text-muted-foreground text-xs">→</span>
            <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", meta.badgeClass)}>
              {meta.label}
            </span>
          </div>
        ) : (
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", meta.badgeClass)}>
            {meta.label}
          </span>
        )}
      </TableCell>

      <TableCell>
        <Select value={effectiveRole} onValueChange={(v) => onChange(s.id, v as Role)}>
          <SelectTrigger className={cn("h-8 w-full text-xs", isDirty && "border-warning/60 ring-warning/20")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="attendant">Attendant</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  );
}
