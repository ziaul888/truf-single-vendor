"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { GROUNDS, ROLE_META, type Role, type Ground } from "../_data";

interface FormData {
  name: string; phone: string; email: string;
  role: Role | ""; ground: Ground | ""; active: boolean;
}

const EMPTY: FormData = { name: "", phone: "", email: "", role: "", ground: "", active: true };

export default function AddStaffPage() {
  const router = useRouter();
  const [form,   setForm]   = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function validate() {
    const errs: typeof errors = {};
    if (!form.name.trim())  errs.name  = "Full name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^\+880\s\d{4}-\d{6}$/.test(form.phone)) errs.phone = "Format must be +880 XXXX-XXXXXX";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.role) errs.role = "Role is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    // TODO: wire up real API
    setTimeout(() => {
      setSaving(false);
      router.push("/dashboard/staff");
    }, 900);
  }

  const selectedRole = form.role ? ROLE_META[form.role] : null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href="/dashboard/staff"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-[1.75rem] font-black tracking-[0.15em] leading-tight uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Add New Staff
          </h1>
          <p className="text-sm text-muted-foreground">Fill in the details below to add a team member</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_260px]">
        {/* ── Main form ── */}
        <Card>
          <CardContent className="p-6 space-y-5">

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name" value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                placeholder="+880 XXXX-XXXXXX"
                className={cn(errors.phone && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">
                Email Address{" "}
                <span className="text-[11px] text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="name@turf.com"
                className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Role + Ground */}
            <div className="grid grid-cols-2 gap-4">
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
                <Label>Assigned Ground</Label>
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
              <Switch id="active" checked={form.active} onCheckedChange={(v) => set("active", v)} />
              <div>
                <Label htmlFor="active" className="cursor-pointer text-sm font-medium">
                  {form.active ? <span className="text-success">Active</span> : <span className="text-muted-foreground">Inactive</span>}
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {form.active ? "Staff member can log in and perform duties" : "Staff member account is disabled"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" asChild><Link href="/dashboard/staff">Cancel</Link></Button>
              <Button onClick={handleSubmit} disabled={saving} className="gap-1.5">
                {saving ? (
                  <><span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> Saving…</>
                ) : (
                  <><UserPlus className="h-4 w-4" /> Save Staff</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Role preview sidebar ── */}
        <div className="space-y-4">
          {selectedRole ? (
            <Card>
              <CardContent className="p-5">
                <div className="mb-4">
                  <div className={cn("text-2xl mb-1", selectedRole.colorClass)}>{selectedRole.icon}</div>
                  <p className="text-sm font-bold text-foreground">{selectedRole.label} Permissions</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">What this role can access</p>
                </div>
                <div className="space-y-2">
                  {selectedRole.permissions.map((p) => (
                    <div key={p.label} className="flex items-center gap-2.5">
                      <span className={cn("text-xs font-bold shrink-0", p.allowed ? "text-success" : "text-muted-foreground/40")}>
                        {p.allowed ? "✓" : "✕"}
                      </span>
                      <span className={cn("text-xs", p.allowed ? "text-foreground" : "text-muted-foreground/50")}>
                        {p.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-1">
                  {selectedRole.permissions.map((p, i) => (
                    <div key={i} className="flex-1 h-1 rounded-full"
                      style={{ background: p.allowed ? selectedRole.dotColor : "var(--muted)" }} />
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  <strong style={{ color: selectedRole.dotColor }}>{selectedRole.permissions.filter(p => p.allowed).length}</strong>
                  {" "}of {selectedRole.permissions.length} permissions
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-5 flex flex-col items-center justify-center text-center py-10">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3 text-lg">◈</div>
                <p className="text-sm font-medium text-foreground">Select a role</p>
                <p className="text-xs text-muted-foreground mt-1">Role permissions will appear here</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Quick Guide</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• <strong className="text-foreground">Manager</strong> — can manage bookings, block slots, view reports</p>
                <p>• <strong className="text-foreground">Attendant</strong> — can only block time slots</p>
                <p>• Roles can be changed later from the Roles page</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
