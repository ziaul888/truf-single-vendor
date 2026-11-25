"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ownerApi } from "@/lib/owner-api";
import { toApiFailure } from "@/lib/api-error";
import { turfPortalPath, turfPortalPublicUrl } from "@/lib/turf-portal-path";

interface PortalStatus { slug: string; published: boolean }

export function TurfPortalCard({ slug, canEdit, setupComplete, dirty }: {
  slug: string; canEdit: boolean; setupComplete: boolean; dirty: boolean;
}) {
  const path = turfPortalPath(slug);
  const portalOrigin = process.env.NEXT_PUBLIC_PORTAL_ORIGIN;
  const queryKey = ["owner", "website-portal", slug];
  const cache = useQueryClient();
  const portal = useQuery<PortalStatus>({
    queryKey,
    queryFn: async () => (await ownerApi.get("/admin/settings/website/portal")).data.data,
  });
  const save = useMutation({
    mutationFn: async (published: boolean) =>
      (await ownerApi.put("/admin/settings/website/portal", { published })).data.data as PortalStatus,
    onSuccess: (data) => {
      cache.setQueryData(queryKey, data);
      toast.success(data.published ? "Turf website published" : "Turf website unpublished");
    },
    onError: (error) => toast.error(toApiFailure(error).error),
  });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(turfPortalPublicUrl(slug, portalOrigin ?? window.location.origin));
      toast.success("Website link copied");
    } catch {
      toast.error("Couldn’t copy the link. Open the site to copy its address.");
    }
  }

  const published = portal.data?.published === true;
  return (
    <section className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Globe className="size-4 text-primary" /> Customer website
          </h2>
          <p className="text-sm text-muted-foreground break-all">{path}</p>
          {portal.data && (
            <p role="status" className="text-sm font-medium">
              {published ? "Published" : "Unpublished"}
            </p>
          )}
        </div>
        {portal.data && (
          <div className="flex flex-wrap gap-2">
            {published && (
              <>
                <Button type="button" size="sm" variant="outline" onClick={() => void copyLink()}>
                  <Copy className="size-4" /> Copy link
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={`${portalOrigin ?? ""}${path}`} target="_blank" rel="noopener noreferrer">View site <ExternalLink className="size-4" /></a>
                </Button>
              </>
            )}
            {canEdit && (
              <Button
                type="button"
                size="sm"
                variant={published ? "outline" : "default"}
                disabled={save.isPending || (!published && (!setupComplete || dirty))}
                onClick={() => save.mutate(!published)}
              >
                {save.isPending ? "Saving…" : published ? "Unpublish" : "Publish website"}
              </Button>
            )}
          </div>
        )}
      </div>
      {portal.isPending && <p role="status" className="mt-3 text-sm text-muted-foreground">Loading website status…</p>}
      {portal.isError && (
        <div role="alert" className="mt-3 flex items-center gap-3 text-sm">
          <p>Couldn’t load website status.</p>
          <Button size="sm" variant="outline" type="button" onClick={() => void portal.refetch()}>Try again</Button>
        </div>
      )}
      {!setupComplete && canEdit && <p className="mt-3 text-sm text-muted-foreground">Complete General settings to publish.</p>}
      {setupComplete && !published && dirty && canEdit && (
        <p className="mt-3 text-sm text-muted-foreground">Save your website changes before publishing.</p>
      )}
      {portal.data && setupComplete && (
        <p className="mt-3 text-sm text-muted-foreground">
          Customers can book active grounds with <strong>Show on booking site</strong> turned on.
        </p>
      )}
    </section>
  );
}
