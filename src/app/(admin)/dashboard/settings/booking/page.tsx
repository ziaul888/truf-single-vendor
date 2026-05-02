"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, CalendarCog, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-muted-foreground" />{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Toggle({ label, desc, defaultChecked, disabled }: { label: string; desc: string; defaultChecked?: boolean; disabled?: boolean }) {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className={cn("flex items-start justify-between gap-4", disabled && "opacity-50")}>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={on} onCheckedChange={setOn} disabled={disabled} className="shrink-0 mt-0.5" />
    </div>
  );
}

export default function BookingSettingsPage() {
  const [saving, setSaving] = useState(false);
  function save() { setSaving(true); setTimeout(() => { setSaving(false); toast.success("Settings saved"); }, 500); }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Booking</h2>
          <p className="text-sm text-muted-foreground">Booking rules, slot defaults and pricing</p>
        </div>
        <Button onClick={save} disabled={saving} size="sm"><Save className="mr-1.5 h-4 w-4" />{saving ? "Saving…" : "Save changes"}</Button>
      </div>

      {/* Booking rules */}
      <Section title="Booking rules" icon={CalendarCog}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Minimum advance booking</Label>
            <div className="flex items-center gap-2">
              <Input type="number" defaultValue="1" className="w-24" />
              <span className="text-sm text-muted-foreground">hours before slot</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Maximum advance booking</Label>
            <div className="flex items-center gap-2">
              <Input type="number" defaultValue="30" className="w-24" />
              <span className="text-sm text-muted-foreground">days ahead</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Cancellation window</Label>
            <div className="flex items-center gap-2">
              <Input type="number" defaultValue="2" className="w-24" />
              <span className="text-sm text-muted-foreground">hours before slot</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Max bookings per customer / day</Label>
            <Input type="number" defaultValue="3" className="w-24" />
          </div>
        </div>
        <div className="space-y-4 border-t pt-4">
          <Toggle label="Enable online booking"      desc="Allow customers to book via the portal"         defaultChecked={true} />
          <Toggle label="Allow partial payments"     desc="Customers can pay a deposit and settle later"   defaultChecked={true} />
          <Toggle label="Auto-confirm bookings"      desc="Skip the pending state — confirm immediately"   defaultChecked={false} />
          <Toggle label="Show price on booking form" desc="Display slot price before checkout"             defaultChecked={true} />
        </div>
      </Section>

      {/* Slot defaults */}
      <Section title="Slot defaults" icon={Clock}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Default slot duration</Label>
            <Select defaultValue="60">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Default opening time</Label>
            <Input type="time" defaultValue="06:00" />
          </div>
          <div className="space-y-1.5">
            <Label>Default closing time</Label>
            <Input type="time" defaultValue="23:00" />
          </div>
        </div>
        <div className="space-y-4 border-t pt-4">
          <Toggle label="Auto-generate slots on ground creation" desc="Create slots immediately when a new ground is added" defaultChecked={true} />
          <Toggle label="Auto-generate slots daily at midnight"  desc="Regenerate tomorrow's slots each night automatically" defaultChecked={true} />
        </div>
      </Section>

      {/* Pricing rules */}
      <Section title="Pricing rules" icon={DollarSign}>
        <div className="space-y-4">
          <Toggle label="Enable peak / off-peak pricing" desc="Charge different rates during peak hours"         defaultChecked={true} />
          <Toggle label="Show peak badge on booking form" desc="Highlight peak-hour slots with an amber badge"   defaultChecked={true} />
          <Toggle label="Allow admin price override"     desc="Admins can manually set a custom price per slot" defaultChecked={false} />
        </div>
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div className="space-y-1.5">
            <Label>Default peak price / hr</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
              <Input type="number" defaultValue="1500" className="pl-7" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Default off-peak price / hr</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
              <Input type="number" defaultValue="1000" className="pl-7" />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
