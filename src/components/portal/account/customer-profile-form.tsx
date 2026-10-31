"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PortalApiError, saveCustomerProfile } from "@/lib/portal-bookings";
import type { CustomerSession } from "@/types/booking";
import { CUSTOMER_SESSION_KEY } from "./use-customer-session";

const ProfileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email"),
});
type ProfileValues = z.infer<typeof ProfileSchema>;

const INPUT =
  "mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive";
const LABEL = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

interface CustomerProfileFormProps {
  initial?: Partial<ProfileValues>;
  submitLabel: string;
  onSaved: (session: CustomerSession) => void;
  /** Extra buttons under Save (e.g. "Skip for now"). */
  children?: React.ReactNode;
}

/** Name and email for the signed-in customer. Saving creates the customer record for a new number. */
export function CustomerProfileForm({ initial, submitLabel, onSaved, children }: CustomerProfileFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: { name: initial?.name ?? "", email: initial?.email ?? "" },
  });
  const { errors, isSubmitting, isDirty } = form.formState;

  async function save(values: ProfileValues) {
    setError(null);
    try {
      const session = await saveCustomerProfile(values);
      queryClient.setQueryData(CUSTOMER_SESSION_KEY, session);
      form.reset(values);
      onSaved(session);
    } catch (err) {
      setError(err instanceof PortalApiError ? err.details?.[0]?.message ?? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(save)} noValidate className="space-y-4">
      <div>
        <label htmlFor="name" className={LABEL}>Full name</label>
        <input id="name" autoComplete="name" aria-invalid={!!errors.name} className={INPUT} {...form.register("name")} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="email" className={LABEL}>Email</label>
        <input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} className={INPUT} {...form.register("email")} />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={isSubmitting || (!!initial?.name && !isDirty)}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
      {children}
    </form>
  );
}
