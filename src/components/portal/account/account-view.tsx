"use client";

import { useRouter } from "next/navigation";
import { Loader2, LogOut, Phone, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useCustomerSession, useCustomerSignOut } from "./use-customer-session";
import { CustomerProfileForm } from "./customer-profile-form";
import { AccountBookingsCard } from "./account-bookings-card";
import { SignedOut } from "./my-bookings-view";
import { AccountSkeleton } from "@/components/portal/loading/account-skeletons";

/** The signed-in customer's profile: verified phone, name and email, bookings, sign out. */
export function AccountView() {
  const router = useRouter();
  const session = useCustomerSession();
  const signOut = useCustomerSignOut();

  if (session.isPending) {
    return <AccountSkeleton />;
  }
  if (!session.data) return <SignedOut title="Your profile" from="/account" />;

  const s = session.data;
  const initial = (s.name ?? "").trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-extrabold text-accent-foreground">
          {initial || <UserRound className="h-6 w-6" />}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-extrabold tracking-tight">{s.name ?? "Your profile"}</h1>
          <p className="text-sm text-muted-foreground">{s.phone}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-bold">Personal details</h2>
          {s.needsProfile && (
            <p className="mt-1 text-sm text-accent">Add your name and email so we can send your booking confirmations.</p>
          )}

          <div className="mt-4 rounded-xl bg-muted/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mobile number</p>
            <p className="mt-1 flex items-center gap-2 font-medium">
              <Phone className="h-4 w-4 text-primary" />{s.phone}
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                <ShieldCheck className="h-3 w-3" />Verified
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Your sign-in number. To use another one, sign out and sign in with it.</p>
          </div>

          <div className="mt-4">
            <CustomerProfileForm
              initial={{ name: s.name ?? undefined, email: s.email ?? undefined }}
              submitLabel={s.needsProfile ? "Save details" : "Save changes"}
              onSaved={() => toast.success("Profile saved")}
            />
          </div>
        </section>

        <div className="space-y-6">
          <AccountBookingsCard />
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="font-bold">Sign out</h2>
            <p className="mt-1 text-sm text-muted-foreground">Signs you out on every device.</p>
            <button type="button" disabled={signOut.isPending}
              onClick={() => signOut.mutate(undefined, { onSuccess: () => { router.push("/"); router.refresh(); } })}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold hover:bg-muted disabled:opacity-60">
              {signOut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Sign out
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
