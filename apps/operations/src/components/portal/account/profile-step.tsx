"use client";

import { CustomerProfileForm } from "./customer-profile-form";

/**
 * Shown right after verify when the number is new (`needsProfile`). Saving creates
 * the customer record, so they show in the dashboard's Customers list straight away.
 * "Skip" is fine too: the first booking creates the record instead.
 */
export function ProfileStep({ onDone }: { onDone: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold">Your name and email</p>
        <p className="text-sm text-muted-foreground">So we can send your booking confirmations.</p>
      </div>
      <CustomerProfileForm submitLabel="Continue" onSaved={onDone}>
        <button type="button" onClick={onDone} className="w-full text-center text-sm font-medium text-muted-foreground hover:underline">
          Skip for now
        </button>
      </CustomerProfileForm>
    </div>
  );
}
