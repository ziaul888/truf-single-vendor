"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ChevronLeft, Save, Clock, DollarSign, Bell, Shield } from "lucide-react";
import { toast } from "sonner";

const GROUNDS = [
  { id: "GR-01", name: "Green Arena — Football",  open: "06:00", close: "23:00", defaultDuration: "1 hour",  peakFrom: "17:00", peakTo: "23:00" },
  { id: "GR-02", name: "Blue Pitch — Cricket",    open: "07:00", close: "22:00", defaultDuration: "1 hour",  peakFrom: "16:00", peakTo: "22:00" },
  { id: "GR-03", name: "Red Court — Badminton",   open: "06:00", close: "22:00", defaultDuration: "30 min",  peakFrom: "16:00", peakTo: "22:00" },
  { id: "GR-04", name: "Gold Tennis — Tennis",    open: "07:00", close: "21:00", defaultDuration: "1 hour",  peakFrom: "17:00", peakTo: "21:00" },
];

export default function SlotSettingsPage() {
  const [groundId,        setGroundId]        = useState("GR-01");
  const [defaultDuration, setDefaultDuration] = useState("1 hour");
  const [autoGenerate,    setAutoGenerate]     = useState(true);
  const [skipExisting,    setSkipExisting]     = useState(true);
  const [allowPartial,    setAllowPartial]     = useState(true);
  const [notifyOnBlock,   setNotifyOnBlock]    = useState(true);
  const [notifyOnBook,    setNotifyOnBook]     = useState(false);
  const [bufferTime,      setBufferTime]       = useState("0");
  const [advanceBooking,  setAdvanceBooking]   = useState("30");
  const [cancelCutoff,    setCancelCutoff]     = useState("2");
  const [saving,          setSaving]           = useState(false);

  const ground = GROUNDS.find((g) => g.id === groundId)!;

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Slot settings saved");
    }, 600);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard/slots" className="mb-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
            <ChevronLeft className="h-4 w-4" /> Back to slots
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Slot settings</h1>
          <p className="text-sm text-muted-foreground">Configure slot generation rules, pricing, and booking behaviour</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-1.5 h-4 w-4" />
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>

      {/* Ground selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Label className="shrink-0">Configure settings for</Label>
            <Select value={groundId} onValueChange={(v) => { setGroundId(v); setDefaultDuration(GROUNDS.find((g) => g.id === v)?.defaultDuration ?? "1 hour"); }}>
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                {GROUNDS.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Hours: {ground.open} – {ground.close}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Generation settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Generation settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Default slot duration</Label>
              <Select value={defaultDuration} onValueChange={setDefaultDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30 min">30 minutes</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="2 hours">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Buffer time between slots</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min="0" max="60" value={bufferTime} onChange={(e) => setBufferTime(e.target.value)} className="w-24" />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Gap inserted between consecutive slots for changeover.</p>
            </div>

            <div className="space-y-1.5">
              <Label>Advance booking window</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min="1" max="365" value={advanceBooking} onChange={(e) => setAdvanceBooking(e.target.value)} className="w-24" />
                <span className="text-sm text-muted-foreground">days ahead</span>
              </div>
              <p className="text-[11px] text-muted-foreground">How many days in advance customers can book.</p>
            </div>

            <SettingToggle
              label="Auto-generate slots daily"
              desc="Automatically create slots each day based on operating hours"
              checked={autoGenerate}
              onChange={setAutoGenerate}
            />
            <SettingToggle
              label="Skip existing slots on generate"
              desc="Prevents duplicate slots when re-running generation"
              checked={skipExisting}
              onChange={setSkipExisting}
            />
          </CardContent>
        </Card>

        {/* Pricing settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" /> Pricing settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Peak hours from</Label>
                <Input type="time" defaultValue={ground.peakFrom} />
              </div>
              <div className="space-y-1.5">
                <Label>Peak hours to</Label>
                <Input type="time" defaultValue={ground.peakTo} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Peak price / hr</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
                  <Input type="number" defaultValue="1500" className="pl-7" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Off-peak price / hr</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
                  <Input type="number" defaultValue="1000" className="pl-7" />
                </div>
              </div>
            </div>

            <SettingToggle
              label="Allow partial payments"
              desc="Customers can book with a deposit and pay the rest later"
              checked={allowPartial}
              onChange={setAllowPartial}
            />

            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground text-sm">Pricing rules</p>
              <p>· Peak pricing applies between the set hours above</p>
              <p>· Off-peak applies to all other time slots</p>
              <p>· Prices are per hour and prorated for shorter slots</p>
            </div>
          </CardContent>
        </Card>

        {/* Booking behaviour */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" /> Booking behaviour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Cancellation cutoff</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min="0" max="72" value={cancelCutoff} onChange={(e) => setCancelCutoff(e.target.value)} className="w-24" />
                <span className="text-sm text-muted-foreground">hours before slot</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Customers cannot cancel within this window.</p>
            </div>

            <div className="space-y-3">
              {[
                { label: "Blocking a booked slot cancels booking", desc: "Automatically cancels and refunds when admin blocks an occupied slot", checked: true, onChange: () => {} },
                { label: "Unblocking reopens slot for booking",    desc: "Immediately makes the slot available when unblocked", checked: true, onChange: () => {} },
              ].map(({ label, desc, checked, onChange }) => (
                <SettingToggle key={label} label={label} desc={desc} checked={checked} onChange={onChange} disabled />
              ))}
            </div>

            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-700 dark:text-amber-400">
              The two rules above are system-enforced and cannot be disabled.
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingToggle
              label="Notify customer on slot blocked"
              desc="Send email when their booked slot gets blocked by admin"
              checked={notifyOnBlock}
              onChange={setNotifyOnBlock}
            />
            <SettingToggle
              label="Notify admin on new booking"
              desc="Admin receives email whenever a slot is booked"
              checked={notifyOnBook}
              onChange={setNotifyOnBook}
            />

            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              Emails are sent via SendGrid. Configure templates in{" "}
              <Link href="/dashboard/settings" className="text-primary underline">Settings → Email</Link>.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SettingToggle({ label, desc, checked, onChange, disabled }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", disabled && "opacity-60")}>
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} className="shrink-0 mt-0.5" />
    </div>
  );
}
