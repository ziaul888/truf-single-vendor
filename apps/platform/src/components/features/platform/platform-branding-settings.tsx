"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  usePlatformBranding,
  useSavePlatformBranding,
  type PlatformBranding,
} from "@/hooks/usePlatformBranding";
import { toApiFailure } from "@/lib/api-error";
import { checkLogoFile, LOGO_TYPES } from "@/validations/logo";
import { PlatformBrandMark } from "@/components/platform-brand-mark";
import { PlatformSettingsSection, PlatformSettingsStatus } from "./platform-settings-section";

export function PlatformBrandingSettings() {
  const branding = usePlatformBranding();
  return (
    <PlatformSettingsSection
      icon={ImageIcon}
      title="Branding"
      description="Manage the console and sign-in branding, including the logo shown on the SaaS landing page."
    >
      {branding.data ? (
        <BrandingForm initial={branding.data} />
      ) : (
        <PlatformSettingsStatus
          subject="branding"
          error={branding.error}
          fetching={branding.isFetching}
          onRetry={() => void branding.refetch()}
        />
      )}
    </PlatformSettingsSection>
  );
}

function BrandingForm({ initial }: { initial: PlatformBranding }) {
  const save = useSavePlatformBranding();
  const fileInput = useRef<HTMLInputElement>(null);
  const [text, setText] = useState<Pick<PlatformBranding, "title" | "subtitle"> | null>(null);
  const [upload, setUpload] = useState<{ file: File; preview: string } | null>(null);
  const [remove, setRemove] = useState(false);
  const [fileError, setFileError] = useState("");
  const { title, subtitle } = text ?? initial;
  const previewUrl = upload?.preview;
  const logoUrl = previewUrl ?? (remove ? null : initial.logoUrl);
  const changed =
    Boolean(upload || (remove && initial.logoUrl)) ||
    title.trim() !== initial.title ||
    subtitle.trim() !== initial.subtitle;

  useEffect(() => {
    if (previewUrl) return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function selectLogo(file?: File) {
    if (fileInput.current) fileInput.current.value = "";
    if (!file) return;
    const problem = checkLogoFile(file);
    setFileError(problem ?? "");
    if (problem) return;
    setRemove(false);
    setUpload({ file, preview: URL.createObjectURL(file) });
  }

  function changeLogoSelection() {
    setUpload(null);
    setRemove(!upload && !remove);
    setFileError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !changed || save.isPending) return;
    const body = new FormData();
    body.set("title", title);
    body.set("subtitle", subtitle);
    body.set("logoAction", remove ? "remove" : "keep");
    if (upload) body.set("logo", upload.file);
    try {
      await save.mutateAsync(body);
      setText(null);
      setUpload(null);
      setRemove(false);
      setFileError("");
      toast.success("Platform branding saved");
    } catch {
      // The form displays the request error below.
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="bg-sidebar text-sidebar-foreground rounded-xl border p-4 sm:p-5">
        <p className="text-sidebar-foreground/75 mb-3 text-xs font-medium">Brand preview</p>
        <div className="flex items-center gap-3">
          <PlatformBrandMark logoUrl={logoUrl} sidebar />
          <div className="min-w-0 [overflow-wrap:anywhere]">
            <p className="font-semibold">{title}</p>
            {subtitle && <p className="text-sidebar-foreground/75 text-sm">{subtitle}</p>}
          </div>
        </div>
      </div>
      <fieldset disabled={save.isPending} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="platform-branding-title">Title</Label>
          <Input
            id="platform-branding-title"
            className="h-11"
            required
            maxLength={60}
            value={title}
            onChange={(event) => setText({ title: event.target.value, subtitle })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform-branding-subtitle">Subtitle</Label>
          <Input
            id="platform-branding-subtitle"
            className="h-11"
            maxLength={100}
            value={subtitle}
            onChange={(event) => setText({ title, subtitle: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <p id="platform-branding-logo-label" className="text-sm font-medium">
            Logo
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="platform-branding-logo"
              ref={fileInput}
              type="file"
              accept={LOGO_TYPES.join(",")}
              aria-labelledby="platform-branding-logo-label"
              aria-describedby="platform-branding-logo-help"
              onChange={(event) => selectLogo(event.currentTarget.files?.[0])}
              className="peer sr-only"
            />
            <Label
              htmlFor="platform-branding-logo"
              className="border-input bg-background hover:bg-muted peer-focus-visible:ring-ring/30 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 peer-focus-visible:ring-4 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              <Upload aria-hidden className="size-4" />
              {logoUrl ? "Replace logo" : "Upload logo"}
            </Label>
            {(upload || initial.logoUrl) && (
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                onClick={changeLogoSelection}
              >
                {upload ? "Clear selected logo" : remove ? "Undo removal" : "Use default logo"}
              </Button>
            )}
            {upload && (
              <p className="text-muted-foreground min-w-0 text-sm break-all">{upload.file.name}</p>
            )}
          </div>
          <p id="platform-branding-logo-help" className="text-muted-foreground text-sm">
            PNG or JPG, up to 200 KB.
          </p>
          {fileError && (
            <p className="text-destructive text-sm" role="alert">
              {fileError}
            </p>
          )}
        </div>
      </fieldset>
      {save.isError && (
        <p className="text-destructive text-sm" role="alert">
          {toApiFailure(save.error).error}
        </p>
      )}
      <div className="flex justify-end border-t pt-4">
        <Button
          type="submit"
          className="min-h-11 w-full sm:w-auto"
          disabled={!title.trim() || !changed || save.isPending}
        >
          {save.isPending ? "Saving…" : "Save branding"}
        </Button>
      </div>
    </form>
  );
}
