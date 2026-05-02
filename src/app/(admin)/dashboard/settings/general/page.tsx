"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Building2, Globe, Palette, Upload } from "lucide-react";
import { toast } from "sonner";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-muted-foreground" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function GeneralSettingsPage() {
  const [saving, setSaving] = useState(false);

  function save() {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Settings saved"); }, 500);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">General</h2>
          <p className="text-sm text-muted-foreground">Business info, locale and branding</p>
        </div>
        <Button onClick={save} disabled={saving} size="sm">
          <Save className="mr-1.5 h-4 w-4" />{saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      {/* Business info */}
      <Section title="Business information" icon={Building2}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Business name"><Input defaultValue="Turf Admin" /></Field>
          <Field label="Phone"><Input defaultValue="+880 1712 000000" /></Field>
          <Field label="Email"><Input type="email" defaultValue="admin@turfadmin.com" /></Field>
          <Field label="Support email"><Input type="email" defaultValue="support@turfadmin.com" /></Field>
          <Field label="Website"><Input defaultValue="https://turfadmin.com" /></Field>
          <Field label="Address"><Input defaultValue="Dhaka, Bangladesh" /></Field>
        </div>
      </Section>

      {/* Locale */}
      <Section title="Locale & region" icon={Globe}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Currency">
            <Select defaultValue="BDT">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BDT">BDT — Bangladeshi Taka (৳)</SelectItem>
                <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                <SelectItem value="INR">INR — Indian Rupee (₹)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Timezone">
            <Select defaultValue="Asia/Dhaka">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Dhaka">Asia/Dhaka (UTC+6)</SelectItem>
                <SelectItem value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">America/New_York</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date format">
            <Select defaultValue="dd-MMM-yyyy">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dd-MMM-yyyy">21 Apr 2026</SelectItem>
                <SelectItem value="MM/dd/yyyy">04/21/2026</SelectItem>
                <SelectItem value="yyyy-MM-dd">2026-04-21</SelectItem>
                <SelectItem value="dd/MM/yyyy">21/04/2026</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Time format">
            <Select defaultValue="12h">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                <SelectItem value="24h">24-hour (14:30)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Week starts on">
            <Select defaultValue="saturday">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="saturday">Saturday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      {/* Branding */}
      <Section title="Branding" icon={Palette}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Logo" hint="PNG or SVG, max 200 KB">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">T</div>
              <Button variant="outline" size="sm"><Upload className="mr-1.5 h-3.5 w-3.5" />Upload logo</Button>
            </div>
          </Field>
          <Field label="Favicon" hint="ICO or PNG 32×32">
            <Button variant="outline" size="sm"><Upload className="mr-1.5 h-3.5 w-3.5" />Upload favicon</Button>
          </Field>
          <Field label="Primary colour" hint="Used for buttons, active states, badges">
            <div className="flex items-center gap-2">
              <input type="color" defaultValue="#3d8f45" className="h-9 w-16 cursor-pointer rounded-md border border-input p-1" />
              <Input defaultValue="#3d8f45" className="font-mono w-32" />
            </div>
          </Field>
          <Field label="Portal tagline" hint="Shown on the customer booking portal">
            <Input defaultValue="Book your turf. Play your game." />
          </Field>
        </div>
      </Section>
    </div>
  );
}
