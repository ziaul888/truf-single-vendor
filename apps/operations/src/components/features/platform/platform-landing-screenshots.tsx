"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { ArrowUpRight, Monitor, Smartphone, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SaasScreenshotImage } from "@/components/saas-screenshot-image";
import { useSaasScreenshots, useSaveSaasScreenshot } from "@/hooks/useSaasScreenshots";
import { toApiFailure } from "@/lib/api-error";
import {
  SAAS_SCREENSHOT_DETAILS,
  SAAS_SCREENSHOT_SLOTS,
  type SaasScreenshotSlot,
} from "@/lib/saas-screenshots";
import { WEBSITE_IMAGE_MAX_PICK_BYTES, WEBSITE_IMAGE_TYPES } from "@/validations/website-settings";
import { PlatformSettingsSection, PlatformSettingsStatus } from "./platform-settings-section";

export function PlatformLandingScreenshots() {
  const screenshots = useSaasScreenshots();
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild variant="outline" className="min-h-11">
          <Link href="/saas" target="_blank">
            View landing page
            <ArrowUpRight aria-hidden />
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {SAAS_SCREENSHOT_SLOTS.map((slot) => {
          const { title, description } = SAAS_SCREENSHOT_DETAILS[slot];
          return (
            <PlatformSettingsSection
              key={slot}
              title={title}
              description={description}
              icon={slot === "desktop" ? Monitor : Smartphone}
            >
              {screenshots.data ? (
                <ScreenshotEditor slot={slot} savedImage={screenshots.data[slot]} />
              ) : (
                <PlatformSettingsStatus
                  subject={title.toLowerCase()}
                  error={screenshots.error}
                  fetching={screenshots.isFetching}
                  onRetry={() => void screenshots.refetch()}
                />
              )}
            </PlatformSettingsSection>
          );
        })}
      </div>
    </div>
  );
}

type Draft = { file: File; previewUrl: string } | "default" | null;

function ScreenshotEditor({
  slot,
  savedImage,
}: {
  slot: SaasScreenshotSlot;
  savedImage: string | null;
}) {
  const save = useSaveSaasScreenshot(slot);
  const [draft, setDraft] = useState<Draft>(null);
  const [fileError, setFileError] = useState("");
  const selected = draft === "default" ? null : draft;
  const previewUrl = selected?.previewUrl;
  const imageUrl = draft === "default" ? null : (previewUrl ?? savedImage);
  const inputId = `landing-screenshot-${slot}`;
  const { title, width, height } = SAAS_SCREENSHOT_DETAILS[slot];

  useEffect(() => {
    if (previewUrl) return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function pick(file?: File) {
    if (!file) return;
    save.reset();
    setFileError("");
    if (!(WEBSITE_IMAGE_TYPES as readonly string[]).includes(file.type) || !file.size) {
      setDraft(null);
      setFileError("Choose a JPG, PNG or WebP image.");
    } else if (file.size > WEBSITE_IMAGE_MAX_PICK_BYTES) {
      setDraft(null);
      setFileError("Choose an image up to 10 MB.");
    } else {
      setDraft({ file, previewUrl: URL.createObjectURL(file) });
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || save.isPending) return;
    try {
      await save.mutateAsync(selected?.file ?? null);
      setDraft(null);
      toast.success(
        draft === "default" ? "Default screenshot restored" : "Landing screenshot saved"
      );
    } catch {
      // The form displays the request error below.
    }
  }

  const saveError = save.isError
    ? !isAxiosError(save.error) && save.error instanceof Error
      ? save.error.message
      : toApiFailure(save.error).error
    : "";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="bg-muted/50 grid h-56 place-items-center rounded-xl border p-3 sm:h-64">
        <div
          className={
            slot === "desktop"
              ? "relative w-full max-w-[25rem] overflow-hidden rounded-lg"
              : "relative max-w-full overflow-hidden rounded-lg"
          }
          style={{
            aspectRatio: `${width} / ${height}`,
            ...(slot === "phone" && { height: "100%" }),
          }}
        >
          <SaasScreenshotImage
            slot={slot}
            imageUrl={imageUrl}
            sizes={slot === "desktop" ? "400px" : "125px"}
          />
        </div>
      </div>
      <fieldset disabled={save.isPending} className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            id={inputId}
            type="file"
            accept={WEBSITE_IMAGE_TYPES.join(",")}
            aria-label={`Choose ${title.toLowerCase()}`}
            aria-describedby={`${inputId}-hint`}
            className="peer sr-only"
            onChange={(event) => {
              pick(event.currentTarget.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
          <Label
            htmlFor={inputId}
            className="border-input bg-background hover:bg-muted peer-focus-visible:ring-ring/30 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 peer-focus-visible:ring-4 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
          >
            <Upload aria-hidden className="size-4" />
            Replace image
          </Label>
          {(draft || savedImage) && (
            <Button
              type="button"
              variant="ghost"
              className="min-h-11"
              onClick={() => {
                save.reset();
                setFileError("");
                setDraft(draft ? null : "default");
              }}
            >
              {draft === "default" ? "Undo" : selected ? "Discard selection" : "Use default"}
            </Button>
          )}
        </div>
        <p id={`${inputId}-hint`} className="text-muted-foreground text-sm">
          JPG, PNG or WebP, up to 10 MB. Recommended {width} × {height} px.
        </p>
        {selected && (
          <p className="text-muted-foreground text-sm break-all">{selected.file.name}</p>
        )}
      </fieldset>
      {(fileError || saveError) && (
        <p role="alert" className="text-destructive text-sm">
          {fileError || saveError}
        </p>
      )}
      <div className="flex justify-end border-t pt-4">
        <Button
          type="submit"
          className="min-h-11 w-full sm:w-auto"
          disabled={!draft || save.isPending}
        >
          {save.isPending ? "Saving…" : "Save screenshot"}
        </Button>
      </div>
    </form>
  );
}
