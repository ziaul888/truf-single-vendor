"use client";

import Link from "next/link";
import { isAxiosError } from "axios";
import { CircleAlert, RefreshCw, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toApiFailure } from "@/lib/api-error";

export function PlatformLoading({ label = "Loading platform data" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="grid gap-4 sm:grid-cols-2">
      {[0, 1].map((key) => (
        <div key={key} className="bg-card space-y-5 rounded-2xl border p-6">
          <div className="bg-muted h-6 w-1/2 animate-pulse rounded" />
          <div className="bg-muted h-16 animate-pulse rounded-xl" />
          <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
        </div>
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export function PlatformReadError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const failure = toApiFailure(error);
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const missing = [
    "PLATFORM_TENANT_NOT_FOUND",
    "INVOICE_NOT_FOUND",
    "SUBSCRIPTION_NOT_FOUND",
  ].includes(failure.code ?? "");
  const notReady = failure.code === "PLATFORM_NOT_READY" || (status === 404 && !missing);
  const denied = status === 403;
  return (
    <section role="alert" className="bg-card rounded-2xl border px-5 py-14 text-center sm:px-8">
      <CircleAlert className="text-muted-foreground mx-auto mb-4 h-9 w-9" />
      <h2 className="text-lg font-semibold">
        {notReady
          ? "Platform administration is being set up"
          : denied
            ? "Platform access is required"
            : missing
              ? "Record not found"
              : "We couldn't load this information"}
      </h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
        {notReady
          ? "Please try again once platform setup is complete."
          : denied
            ? "Sign in with an account that has platform administrator access."
            : missing
              ? "This record may no longer be available. Return to the turf list to continue."
              : failure.error}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="outline" className="h-11" onClick={onRetry}>
          <RefreshCw />
          Try again
        </Button>
        {(denied || missing) && (
          <Button asChild className="h-11">
            <Link href={denied ? "/platform/login" : "/platform/tenants"}>
              {denied ? "Platform sign in" : "Turf businesses"}
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}

export function PlatformEmpty({ filtered = false }: { filtered?: boolean }) {
  return (
    <section className="bg-card rounded-2xl border border-dashed px-5 py-14 text-center">
      <Building2 className="text-primary mx-auto h-10 w-10" />
      <h2 className="mt-5 text-lg font-semibold">
        {filtered ? "No matching turf businesses" : "No turf businesses yet"}
      </h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
        {filtered
          ? "Try a different name or clear your filters."
          : "Your turf businesses will appear here once their accounts are set up."}
      </p>
    </section>
  );
}
