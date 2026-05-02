"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Wallet, Receipt, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function Toggle({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
      <Switch checked={on} onCheckedChange={setOn} className="shrink-0 mt-0.5" />
    </div>
  );
}

function SecretInput({ label, defaultValue, hint }: { label: string; defaultValue: string; hint?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input type={show ? "text" : "password"} defaultValue={defaultValue} className="pr-9 font-mono text-xs" />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function PaymentsSettingsPage() {
  const [gateway, setGateway] = useState<"stripe" | "razorpay">("stripe");
  const [saving, setSaving] = useState(false);
  function save() { setSaving(true); setTimeout(() => { setSaving(false); toast.success("Settings saved"); }, 500); }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Payments</h2>
          <p className="text-sm text-muted-foreground">Payment gateway and invoice configuration</p>
        </div>
        <Button onClick={save} disabled={saving} size="sm"><Save className="mr-1.5 h-4 w-4" />{saving ? "Saving…" : "Save changes"}</Button>
      </div>

      {/* Gateway */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base"><Wallet className="h-4 w-4 text-muted-foreground" />Payment gateway</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Gateway selector */}
          <div className="grid grid-cols-2 gap-3">
            {(["stripe", "razorpay"] as const).map((gw) => (
              <button
                key={gw}
                type="button"
                onClick={() => setGateway(gw)}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                  gateway === gw ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                )}
              >
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white", gw === "stripe" ? "bg-[#635bff]" : "bg-[#2d81f7]")}>
                  {gw === "stripe" ? "S" : "R"}
                </div>
                <div>
                  <p className="font-semibold text-sm capitalize">{gw}</p>
                  <p className="text-xs text-muted-foreground">{gw === "stripe" ? "Cards, wallets" : "UPI, cards"}</p>
                </div>
                {gateway === gw && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>

          {/* Keys */}
          <SecretInput label="Publishable key"  defaultValue="pk_test_••••••••••••••••••••••••" hint="Starts with pk_test_ or pk_live_" />
          <SecretInput label="Secret key"       defaultValue="sk_test_••••••••••••••••••••••••" hint="Never expose this in the browser" />
          <SecretInput label="Webhook secret"   defaultValue="whsec_••••••••••••••••••••••••••" hint="Used to verify incoming Stripe events" />

          <Toggle label="Test mode" desc="All transactions use Stripe test keys — no real charges" defaultChecked={true} />

          <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">Test mode active.</span> Switch to live keys before going to production.
          </div>
        </CardContent>
      </Card>

      {/* Invoice */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base"><Receipt className="h-4 w-4 text-muted-foreground" />Invoice &amp; receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Invoice prefix</Label>
              <Input defaultValue="INV-" className="font-mono" />
              <p className="text-[11px] text-muted-foreground">e.g. INV-0042</p>
            </div>
            <div className="space-y-1.5">
              <Label>Receipt prefix</Label>
              <Input defaultValue="RCP-" className="font-mono" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Receipt footer note</Label>
            <textarea
              rows={2}
              defaultValue="Thank you for booking with Turf Admin. For support: support@turfadmin.com"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
          <div className="space-y-4 border-t pt-4">
            <Toggle label="Auto-send receipt after payment"    desc="Email receipt to customer immediately on payment"       defaultChecked={true} />
            <Toggle label="Include ground photo in receipt"    desc="Attach a ground image to the emailed receipt"           defaultChecked={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
