"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ClipboardList, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlatformApplications, usePlatformMe } from "@/hooks/usePlatform";
import { usePlatformCommand } from "@/hooks/usePlatformBilling";
import { toApiFailure } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { formatBdt } from "@/lib/platform-billing";
import type { OwnerApplication, OwnerApplicationStatus, PlatformTenant } from "@/types/platform";
import { BillingError, BillingPagination } from "./billing-parts";
import { PlatformLoading, PlatformReadError } from "./platform-states";

const labels: Record<OwnerApplicationStatus, string> = {
  pending: "Awaiting review",
  activated: "Activated",
  rejected: "Rejected",
};

function Status({ value }: { value: OwnerApplicationStatus }) {
  return (
    <span className="bg-muted/60 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          value === "activated"
            ? "bg-success"
            : value === "pending"
              ? "bg-warning"
              : "bg-muted-foreground"
        )}
      />
      {labels[value]}
    </span>
  );
}

type Review = { application: OwnerApplication; action: "activate" | "reject" };

function ReviewDialog({
  review,
  userId,
  onClose,
}: {
  review: Review | null;
  userId?: string;
  onClose: () => void;
}) {
  const action = review?.action ?? "activate";
  const command = usePlatformCommand<Record<string, never>, PlatformTenant | OwnerApplication>(
    userId,
    review ? `/applications/${review.application.id}/${action}` : "/applications/unused"
  );
  const [error, setError] = useState("");
  async function confirm() {
    if (!review) return;
    setError("");
    try {
      await command.mutateAsync({});
      toast.success(action === "activate" ? "Owner account activated" : "Application rejected");
      onClose();
    } catch (err) {
      setError(toApiFailure(err).error);
    }
  }
  return (
    <Dialog open={!!review} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === "activate" ? "Activate owner account?" : "Reject application?"}
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            {action === "activate"
              ? `${review?.application.ownerName ?? "The owner"} will be able to sign in at /login. The selected plan and first unpaid invoice will be created. The turf will remain Setting up.`
              : "The application will be closed and its saved password hash removed. This cannot be undone from this screen."}
          </DialogDescription>
        </DialogHeader>
        <BillingError message={error} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="h-11" disabled={command.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="h-11"
            variant={action === "reject" ? "destructive" : "default"}
            disabled={command.isPending || (action === "activate" && !review?.application.plan)}
            onClick={confirm}
          >
            {command.isPending ? (
              <Loader2 className="animate-spin" />
            ) : action === "activate" ? (
              <Check />
            ) : (
              <X />
            )}
            {command.isPending
              ? "Saving…"
              : action === "activate"
                ? "Activate owner"
                : "Reject application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PlatformApplications() {
  const me = usePlatformMe();
  const [status, setStatus] = useState<OwnerApplicationStatus | "all">("pending");
  const [page, setPage] = useState(1);
  const [review, setReview] = useState<Review | null>(null);
  const query = usePlatformApplications(me.data?.id, {
    page,
    limit: 12,
    status: status === "all" ? undefined : status,
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            Owner access
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed">
            Review applications from the SaaS website. Activation creates the owner account while
            the turf remains in setup.
          </p>
        </div>
        <Button asChild variant="outline" className="h-11">
          <Link href="/saas" target="_blank">
            View SaaS website
          </Link>
        </Button>
      </div>
      <div className="bg-card rounded-2xl border p-3 sm:w-64 sm:p-4">
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as typeof status);
            setPage(1);
          }}
        >
          <SelectTrigger aria-label="Application status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All applications</SelectItem>
            <SelectItem value="pending">Awaiting review</SelectItem>
            <SelectItem value="activated">Activated</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {query.isError ? (
        <PlatformReadError error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <PlatformLoading label="Loading owner applications" />
      ) : query.data.data.length === 0 ? (
        <section className="bg-card rounded-2xl border border-dashed px-5 py-14 text-center">
          <ClipboardList className="text-primary mx-auto h-10 w-10" />
          <h2 className="mt-5 text-lg font-semibold">
            No {status === "all" ? "" : labels[status].toLowerCase()} applications
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            New turf-owner applications will appear here for review.
          </p>
        </section>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            {query.data.data.map((application) => (
              <article key={application.id} className="bg-card rounded-2xl border p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{application.turfName}</h2>
                    <p className="text-muted-foreground mt-1 text-xs">@{application.slug}</p>
                  </div>
                  <Status value={application.status} />
                </div>
                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground text-xs">Owner</dt>
                    <dd className="mt-1 font-medium">{application.ownerName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Email</dt>
                    <dd className="mt-1 font-medium break-all">{application.ownerEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Applied</dt>
                    <dd className="mt-1 font-medium">
                      {new Intl.DateTimeFormat("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Dhaka",
                      }).format(new Date(application.createdAt))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Time zone</dt>
                    <dd className="mt-1 font-medium">{application.timezone}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground text-xs">Selected plan</dt>
                    <dd className="mt-1 font-medium">
                      {application.plan ? (
                        <>
                          {application.plan.name} ·{" "}
                          {application.plan.interval === "monthly" ? "Monthly" : "Yearly"} ·{" "}
                          {formatBdt(application.plan.selectedAmount)}
                        </>
                      ) : (
                        <span className="text-destructive">No plan selected</span>
                      )}
                    </dd>
                  </div>
                </dl>
                {application.status === "pending" && (
                  <div className="mt-5 flex flex-col gap-2 border-t pt-5 sm:flex-row">
                    <Button
                      className="h-11 flex-1"
                      disabled={!application.plan}
                      onClick={() => setReview({ application, action: "activate" })}
                    >
                      <Check />
                      Activate owner
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 flex-1"
                      onClick={() => setReview({ application, action: "reject" })}
                    >
                      <X />
                      Reject
                    </Button>
                  </div>
                )}
                {application.tenantId && (
                  <Button asChild variant="outline" className="mt-5 h-11 w-full">
                    <Link href={`/platform/tenants/${application.tenantId}`}>
                      Open turf account
                    </Link>
                  </Button>
                )}
              </article>
            ))}
          </div>
          <BillingPagination
            page={page}
            total={query.data.total}
            busy={query.isFetching}
            onPage={setPage}
          />
        </>
      )}
      <ReviewDialog review={review} userId={me.data?.id} onClose={() => setReview(null)} />
    </div>
  );
}
