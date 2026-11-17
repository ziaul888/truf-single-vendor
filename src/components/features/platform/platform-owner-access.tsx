"use client";
import { useState } from "react";
import { Copy, KeyRound, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlatformOwnerAccess } from "@/hooks/useOwner";
import { usePlatformCommand } from "@/hooks/usePlatformBilling";
import type { OwnerInvitation } from "@/types/owner";
import { toApiFailure } from "@/lib/api-error";
import { PlatformLoading, PlatformReadError } from "./platform-states";
import { BillingError } from "./billing-parts";
const descriptions = {
  pending: "Create an activation link so the owner can choose their password and sign in.",
  invited: "An activation link is available. The owner has not completed password setup yet.",
  active:
    "The owner has activated their account. They can sign in to view their turf account and subscription billing.",
  existing_account:
    "This owner already has an active account. Their current sign-in details are unchanged.",
  inactive: "Owner access is disabled or this account needs a separate access review.",
  unassigned: "Assign an owner before creating an activation link.",
};
export function PlatformOwnerAccess({ userId, tenantId }: { userId?: string; tenantId: string }) {
  const query = usePlatformOwnerAccess(userId, tenantId),
    [copied, setCopied] = useState(false),
    [error, setError] = useState("");
  const command = usePlatformCommand<Record<string, never>, OwnerInvitation>(
    userId,
    `/tenants/${tenantId}/owner-invitation`
  );
  const token = query.data?.status === "invited" ? command.data?.token : null;
  const link =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/owner/activate#token=${encodeURIComponent(token)}`
      : "";
  async function create() {
    setError("");
    setCopied(false);
    try {
      await command.mutateAsync({});
    } catch (err) {
      setError(toApiFailure(err).error);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      document.getElementById("owner-activation-link")?.focus();
      setError("Select the link below and copy it to share with the owner.");
    }
  }
  if (query.isError)
    return <PlatformReadError error={query.error} onRetry={() => query.refetch()} />;
  if (!query.data) return <PlatformLoading label="Loading owner activation" />;
  return (
    <section className="bg-card space-y-5 rounded-2xl border p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <KeyRound className="text-primary h-5 w-5" />
        <h2 className="text-lg font-semibold">Owner activation</h2>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {descriptions[query.data.status]}
      </p>
      {query.data.invitationExpiresAt && (
        <p className="text-muted-foreground text-xs">
          Link expires{" "}
          {new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Dhaka",
          }).format(new Date(query.data.invitationExpiresAt))}{" "}
          (Bangladesh time).
        </p>
      )}
      {query.data.canInvite && (
        <div className="space-y-3">
          <Button className="h-11" disabled={command.isPending} onClick={create}>
            {query.data.status === "invited" ? <RefreshCw /> : <KeyRound />}
            {command.isPending
              ? "Creating…"
              : query.data.status === "invited"
                ? "Create new activation link"
                : "Create activation link"}
          </Button>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Links expire after 24 hours and can be used once. Creating a new link replaces the
            previous link. Share it privately with the owner.
          </p>
        </div>
      )}
      {link && (
        <div className="bg-muted/40 space-y-3 rounded-xl border p-4">
          <Label htmlFor="owner-activation-link">Activation link</Label>
          <Input
            id="owner-activation-link"
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
          />
          <Button variant="outline" className="h-11" onClick={copy}>
            <Copy />
            {copied ? "Copied" : "Copy link"}
          </Button>
          <span role="status" className="sr-only">
            {copied ? "Activation link copied" : ""}
          </span>
        </div>
      )}
      <BillingError message={error} />
      <p className="text-muted-foreground border-t pt-4 text-xs leading-relaxed">
        Activating the owner account gives access to their account and billing. Booking management
        becomes available after turf setup is complete.
      </p>
    </section>
  );
}
