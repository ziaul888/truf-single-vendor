"use client";

import { useId, type ReactNode } from "react";
import { isAxiosError } from "axios";
import { AlertCircle, Loader2, RefreshCw, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toApiFailure } from "@/lib/api-error";

export function PlatformSettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="bg-card min-w-0 rounded-2xl border">
      <header className="flex items-start gap-3.5 border-b p-4 sm:p-5">
        <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
          <Icon aria-hidden className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{description}</p>
        </div>
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function PlatformSettingsStatus({
  subject,
  error,
  fetching,
  onRetry,
}: {
  subject: string;
  error: unknown;
  fetching: boolean;
  onRetry: () => void;
}) {
  if (!error) {
    return (
      <p role="status" className="text-muted-foreground flex min-h-12 items-center gap-2 text-sm">
        <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" />
        Loading {subject}…
      </p>
    );
  }

  const message =
    isAxiosError(error) && error.response?.status === 404
      ? "The API needs an update to load these settings."
      : toApiFailure(error).error;

  return (
    <div className="bg-destructive/5 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
      <div role="alert" className="flex min-w-0 flex-1 basis-52 items-start gap-2.5 text-sm">
        <AlertCircle aria-hidden className="text-destructive mt-0.5 size-4 shrink-0" />
        <div className="min-w-0">
          <p className="font-medium">Couldn’t load {subject}</p>
          <p className="text-muted-foreground mt-0.5 break-words">{message}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        disabled={fetching}
        onClick={onRetry}
      >
        <RefreshCw aria-hidden className={fetching ? "motion-safe:animate-spin" : undefined} />
        {fetching ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}
