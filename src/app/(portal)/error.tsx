"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

/** Shown inside the portal layout when a page fails to load, e.g. turf-api is unreachable. */
export default function PortalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const [retrying, startRetry] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6" role="alert">
      <h1 className="text-3xl font-extrabold tracking-tight">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        We couldn&apos;t load this page. Please try again in a moment. Any booking you&apos;ve already made is safe.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          disabled={retrying}
          onClick={() => startRetry(() => unstable_retry())}
          className="inline-flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {retrying && <Loader2 className="h-4 w-4 animate-spin" />}
          Try again
        </button>
        <Link href="/" className="text-sm font-medium hover:text-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
