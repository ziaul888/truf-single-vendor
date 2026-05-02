"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Mail, Bell, Send, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

function Toggle({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <Switch checked={on} onCheckedChange={setOn} className="shrink-0 mt-0.5" />
    </div>
  );
}

export default function NotificationsSettingsPage() {
  const [showKey, setShowKey] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [testing, setTesting] = useState(false);

  function save() { setSaving(true); setTimeout(() => { setSaving(false); toast.success("Settings saved"); }, 500); }
  function sendTest() { setTesting(true); setTimeout(() => { setTesting(false); toast.success("Test email sent"); }, 800); }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">Email delivery and notification rules</p>
        </div>
        <Button onClick={save} disabled={saving} size="sm"><Save className="mr-1.5 h-4 w-4" />{saving ? "Saving…" : "Save changes"}</Button>
      </div>

      {/* Email settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base"><Mail className="h-4 w-4 text-muted-foreground" />Email settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>SendGrid API key</Label>
            <div className="relative">
              <Input type={showKey ? "text" : "password"} defaultValue="SG.••••••••••••••••••••••••••••••••••••••••••" className="pr-9 font-mono text-xs" />
              <button type="button" onClick={() => setShowKey((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">Starts with SG. — get it from SendGrid dashboard</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>From email</Label>
              <Input type="email" defaultValue="no-reply@turfadmin.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Reply-to email</Label>
              <Input type="email" defaultValue="support@turfadmin.com" />
            </div>
            <div className="space-y-1.5">
              <Label>From name</Label>
              <Input defaultValue="Turf Admin" />
            </div>
          </div>

          <div className="flex items-center gap-3 border-t pt-4">
            <Input type="email" placeholder="test@example.com" className="max-w-xs" />
            <Button variant="outline" size="sm" onClick={sendTest} disabled={testing}>
              <Send className="mr-1.5 h-3.5 w-3.5" />{testing ? "Sending…" : "Send test email"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification rules */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4 text-muted-foreground" />Notification rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer notifications</p>
          <div className="space-y-4">
            <Toggle label="Booking confirmation"   desc="Send email when a booking is confirmed"              defaultChecked={true}  />
            <Toggle label="Booking cancellation"   desc="Notify customer when their booking is cancelled"     defaultChecked={true}  />
            <Toggle label="Refund processed"       desc="Email customer when a refund has been issued"        defaultChecked={true}  />
          </div>

          <div className="my-5 h-px bg-border" />

          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin notifications</p>
          <div className="space-y-4">
            <Toggle label="New booking received"   desc="Alert admin when a customer makes a new booking"     defaultChecked={false} />
            <Toggle label="Booking cancellation"   desc="Alert admin when a customer cancels"                 defaultChecked={true}  />
            <Toggle label="Due payment reminder"   desc="Daily digest of customers with outstanding balances" defaultChecked={true}  />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
