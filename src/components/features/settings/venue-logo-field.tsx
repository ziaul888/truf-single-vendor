"use client";

import { useRef } from "react";
import Image from "next/image";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRemoveLogo, useUploadLogo } from "@/hooks/useSettings";
import { toApiFailure } from "@/lib/api-error";
import { checkLogoFile, LOGO_TYPES } from "@/validations/venue";

/** Logo preview with upload and remove. Both take effect straight away, separate from Save. */
export function VenueLogoField({ logoUrl, name, canEdit }: { logoUrl: string | null; name: string; canEdit: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadLogo();
  const remove = useRemoveLogo();
  const busy = upload.isPending || remove.isPending;

  async function handleFile(file: File | undefined) {
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    const problem = checkLogoFile(file);
    if (problem) return void toast.error(problem);
    try {
      await upload.mutateAsync(file);
      toast.success("Logo updated");
    } catch (err) {
      toast.error(toApiFailure(err).error);
    }
  }

  async function handleRemove() {
    try {
      await remove.mutateAsync();
      toast.success("Logo removed");
    } catch (err) {
      toast.error(toApiFailure(err).error);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
        {logoUrl ? (
          // Same-origin /api/v1/uploads/… path, proxied to turf-api.
          <Image src={logoUrl} alt={`${name} logo`} fill unoptimized sizes="64px" className="object-contain" />
        ) : (
          <span className="text-xl font-bold text-muted-foreground">{name.charAt(0).toUpperCase() || "T"}</span>
        )}
      </div>
      <div className="space-y-1.5">
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <input ref={inputRef} type="file" accept={LOGO_TYPES.join(",")} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
              {upload.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
              {logoUrl ? "Replace logo" : "Upload logo"}
            </Button>
            {logoUrl && (
              <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={handleRemove}>
                {remove.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
                Remove
              </Button>
            )}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">
          PNG or JPG, 200 KB at most. {canEdit ? "Uploads and removals apply straight away." : ""}
          {!logoUrl && " Without a logo the default icon is shown."}
        </p>
      </div>
    </div>
  );
}
