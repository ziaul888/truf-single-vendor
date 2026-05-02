"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Search, UserPlus, Pencil, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_STAFF, GROUNDS, ROLE_META, avatarColor, initials, type Role, type Ground, type StaffMember } from "./_data";

// ── Types ──────────────────────────────────────────────────────────────────

interface FormData {
  name: string; phone: string; email: string;
  role: Role | ""; ground: Ground | ""; active: boolean;
}

const EMPTY_FORM: FormData = { name: "", phone: "", email: "", role: "", ground: "", active: true };

// ── Toast ──────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-2xl animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap">
      {type === "success" ? <span className="text-success">✓</span> : <span className="text-destructive">✕</span>}
      {message}
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
            <Trash2 className="h-4 w-4 text-destructive" />
          </div>
          <h3 className="text-base font-bold text-foreground">Are you sure?</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}

// ── Staff Drawer ───────────────────────────────────────────────────────────

function StaffDrawer({
  open, initial, onSave, onClose,
}: {
  open: boolean;
  initial: StaffMember | null;
  onSave: (d: FormData) => void;
  onClose: () => void;
}) {
  const [form,   setForm]   = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Re-populate form whenever drawer opens
  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setForm(initial
        ? { name: initial.name, phone: initial.phone, email: initial.email, role: initial.role, ground: initial.ground, active: initial.active }
        : EMPTY_FORM);
      setErrors({});
    } else {
      onClose();
    }
  }

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function validate() {
    const errs: typeof errors = {};
    if (!form.name.trim())  errs.name  = "Name is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    else if (!/^\+880\s\d{4}-\d{6}$/.test(form.phone)) errs.phone = "Format: +880 XXXX-XXXXXX";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email address";
    if (!form.role) errs.role = "Role is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const selectedRole = form.role ? ROLE_META[form.role] : null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>{initial ? "Edit Staff Member" : "Add New Staff"}</SheetTitle>
          <SheetDescription>
            {initial ? `Editing details for ${initial.name}` : "Fill in the details to add a new team member"}
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="d-name">Full Name <span className="text-destructive">*</span></Label>
            <Input id="d-name" value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Tanvir Ahmed"
              className={cn(errors.name && "border-destructive focus-visible:ring-destructive")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="d-phone">Phone <span className="text-destructive">*</span></Label>
            <Input id="d-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)}
              placeholder="+880 XXXX-XXXXXX"
              className={cn(errors.phone && "border-destructive focus-visible:ring-destructive")} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="d-email">
              Email <span className="text-[11px] text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input id="d-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
              placeholder="name@turf.com"
              className={cn(errors.email && "border-destructive focus-visible:ring-destructive")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          {/* Role + Ground */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Role <span className="text-destructive">*</span></Label>
              <Select value={form.role} onValueChange={(v) => set("role", v as Role)}>
                <SelectTrigger className={cn(errors.role && "border-destructive")}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="attendant">Attendant</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Ground</Label>
              <Select value={form.ground || "_none"} onValueChange={(v) => set("ground", v === "_none" ? "" : v as Ground)}>
                <SelectTrigger><SelectValue placeholder="Select ground" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None</SelectItem>
                  {GROUNDS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3 border border-border">
            <Switch id="d-active" checked={form.active} onCheckedChange={(v) => set("active", v)} />
            <Label htmlFor="d-active" className="cursor-pointer text-sm">
              {form.active
                ? <span className="text-success font-medium">Active</span>
                : <span className="text-muted-foreground">Inactive</span>}
            </Label>
          </div>

          {/* Role permission preview */}
          {selectedRole && (
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                {selectedRole.label} permissions
              </p>
              <div className="space-y-1">
                {selectedRole.permissions.map((p) => (
                  <div key={p.label} className="flex items-center gap-2">
                    <span className="text-[11px] font-bold w-3 shrink-0"
                      style={{ color: p.allowed ? selectedRole.dotColor : "var(--muted-foreground)" }}>
                      {p.allowed ? "✓" : "✕"}
                    </span>
                    <span className={cn("text-xs", p.allowed ? "text-foreground" : "text-muted-foreground/50")}>
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetBody>

        <SheetFooter>
          <Button variant="outline" className="w-full" onClick={onClose}>Cancel</Button>
          <Button className="w-full" onClick={() => { if (validate()) onSave(form); }}>
            {initial ? "Save Changes" : "Save Staff"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

interface ConfirmState { type: "delete" | "toggle"; staff: StaffMember; }
interface ToastState   { message: string; type: "success" | "error"; key: number; }

export default function StaffPage() {
  const [staff,   setStaff]   = useState<StaffMember[]>(MOCK_STAFF);
  const [search,  setSearch]  = useState("");
  const [roleF,   setRoleF]   = useState("all");
  const [groundF, setGroundF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [drawer,  setDrawer]  = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [toast,   setToast]   = useState<ToastState | null>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type, key: Date.now() });
    setTimeout(() => setToast(null), 2500);
  }

  function openAdd()               { setEditing(null); setDrawer(true); }
  function openEdit(s: StaffMember) { setEditing(s);   setDrawer(true); }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staff.filter((s) => {
      const matchQ = !q || s.name.toLowerCase().includes(q) || s.phone.includes(q);
      const matchR = roleF   === "all" || s.role   === roleF;
      const matchG = groundF === "all" || s.ground === groundF;
      const matchS = statusF === "all" || (statusF === "active" ? s.active : !s.active);
      return matchQ && matchR && matchG && matchS;
    });
  }, [staff, search, roleF, groundF, statusF]);

  function handleSave(data: FormData) {
    if (editing) {
      setStaff((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...data } as StaffMember : s));
      showToast("Staff updated successfully");
    } else {
      setStaff((prev) => [...prev, { id: Date.now(), ...data } as StaffMember]);
      showToast("Staff added successfully");
    }
    setDrawer(false);
  }

  function handleToggle(s: StaffMember) {
    if (s.active) { setConfirm({ type: "toggle", staff: s }); return; }
    setStaff((prev) => prev.map((m) => m.id === s.id ? { ...m, active: true } : m));
    showToast(`${s.name} is now active`);
  }

  function handleConfirm() {
    if (!confirm) return;
    if (confirm.type === "delete") {
      setStaff((prev) => prev.filter((s) => s.id !== confirm.staff.id));
      showToast(`${confirm.staff.name} removed`);
    } else {
      setStaff((prev) => prev.map((s) => s.id === confirm.staff.id ? { ...s, active: false } : s));
      showToast(`${confirm.staff.name} marked as inactive`);
    }
    setConfirm(null);
  }

  const activeCount = staff.filter((s) => s.active).length;
  const hasFilters  = search || roleF !== "all" || groundF !== "all" || statusF !== "all";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[2rem] font-black tracking-[0.15em] leading-tight text-foreground uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Staff Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your team across all grounds</p>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <UserPlus className="h-4 w-4" /> Add Staff
        </Button>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..." className="pl-9 h-9" />
        </div>

        <Select value={roleF} onValueChange={setRoleF}>
          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="attendant">Attendant</SelectItem>
          </SelectContent>
        </Select>

        <Select value={groundF} onValueChange={setGroundF}>
          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grounds</SelectItem>
            {GROUNDS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 text-muted-foreground"
            onClick={() => { setSearch(""); setRoleF("all"); setGroundF("all"); setStatusF("all"); }}>
            Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          Total: {staff.length} · Active: {activeCount}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[240px]">Staff</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Ground</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-foreground">No staff found.</p>
                    <p className="text-sm text-muted-foreground mt-1">Add your first team member.</p>
                    <Button size="sm" className="mt-4 gap-1.5" onClick={openAdd}>
                      <UserPlus className="h-3.5 w-3.5" /> Add Staff
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.map((s) => (
              <TableRow key={s.id} className="hover:bg-muted/20 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: avatarColor(s.name) }}>
                      {initials(s.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium leading-tight truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.phone}</TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                    s.role === "manager"
                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                  )}>
                    {s.role}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  {s.ground || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <Switch checked={s.active} onCheckedChange={() => handleToggle(s)}
                    aria-label={`Toggle ${s.name} active status`} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(s)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setConfirm({ type: "delete", staff: s })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <StaffDrawer
        open={drawer}
        initial={editing}
        onSave={handleSave}
        onClose={() => setDrawer(false)}
      />

      {confirm && (
        <ConfirmDialog
          message={confirm.type === "delete"
            ? `This will permanently remove ${confirm.staff.name} from your team.`
            : `This will mark ${confirm.staff.name} as inactive.`}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} />}
    </div>
  );
}
