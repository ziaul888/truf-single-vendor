"use client";

import { useRef, useState } from "react";
import { isAxiosError } from "axios";
import Image from "next/image";
import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { ImagePlus, Loader2, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { resizeImage } from "@/lib/resize-image";
import {
  WEBSITE_IMAGE_MAX_PICK_BYTES, WEBSITE_IMAGE_TYPES, isUploadedWebsiteImage, isWebsiteImageSrc,
  type WebsiteImageSlot, type WebsiteSettings,
} from "@/validations/website-settings";
import { useUploadWebsiteImage } from "@/hooks/useSettings";
import { toApiFailure } from "@/lib/api-error";
import { FormField } from "./form-primitives";

type Form = UseFormReturn<WebsiteSettings>;
export type ImageFieldName = "hero.imageUrl" | "sections.visitUs.imageUrl";

/** Checks the picked file, then resizes it in the browser to fit turf-api's 2 MB limit. */
async function prepareImage(picked: File): Promise<File> {
  if (!(WEBSITE_IMAGE_TYPES as readonly string[]).includes(picked.type)) throw new Error("Use a JPG, PNG or WebP image");
  if (picked.size > WEBSITE_IMAGE_MAX_PICK_BYTES) throw new Error("Image is larger than 10 MB");
  return resizeImage(picked);
}

const savedUrl = (w: WebsiteSettings, slot: WebsiteImageSlot) => (slot === "hero" ? w.hero.imageUrl : w.sections.visitUs.imageUrl);

export function ImageUploadField({
  form, name, slot, label, hint, defaultUrl,
}: {
  form: Form; name: ImageFieldName; slot: WebsiteImageSlot; label: string; hint: string; defaultUrl: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preparing, setPreparing] = useState(false);
  const upload = useUploadWebsiteImage();
  const uploading = preparing || upload.isPending;
  const imageUrl = useWatch({ control: form.control, name });
  const error = form.getFieldState(name, form.formState).error?.message;
  const inputId = `${slot}-image-file`;

  function setImage(url: string) {
    form.setValue(name, url, { shouldDirty: true, shouldValidate: true });
  }

  // The upload is live as soon as it finishes, so the field becomes the new saved value (not a pending change).
  async function handleFile(file: File | undefined) {
    if (!file || uploading) return;
    setPreparing(true);
    try {
      const prepared = await prepareImage(file);
      setPreparing(false);
      const saved = await upload.mutateAsync({ slot, file: prepared });
      form.resetField(name, { defaultValue: savedUrl(saved, slot) });
      toast.success("Image uploaded and published");
    } catch (err) {
      toast.error(isAxiosError(err) || !(err instanceof Error) ? toApiFailure(err).error : err.message);
    } finally {
      setPreparing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <FormField id={inputId} label={label} hint={hint} error={error}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={WEBSITE_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <DropZone
        imageUrl={imageUrl}
        uploading={uploading}
        canReset={imageUrl !== defaultUrl}
        onFile={handleFile}
        onPick={() => inputRef.current?.click()}
        onReset={() => setImage(defaultUrl)}
      />
      <ImageLinkInput form={form} name={name} />
    </FormField>
  );
}

function DropZone({
  imageUrl, uploading, canReset, onFile, onPick, onReset,
}: {
  imageUrl: string | undefined; uploading: boolean; canReset: boolean;
  onFile: (file: File | undefined) => void; onPick: () => void; onReset: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer.files?.[0]); }}
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-dashed p-3 transition-colors sm:flex-row sm:items-center",
        dragging ? "border-primary bg-primary/5" : "border-input",
      )}
    >
      <Thumbnail src={imageUrl} uploading={uploading} />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm">
          {uploading ? "Uploading…" : <>Drag an image here, or <span className="font-medium">choose a file</span>.</>}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={onPick}>
            <Upload className="mr-1.5 h-4 w-4" />{isWebsiteImageSrc(imageUrl) ? "Replace image" : "Upload image"}
          </Button>
          {canReset && (
            <Button type="button" size="sm" variant="ghost" disabled={uploading} onClick={onReset}>
              <RotateCcw className="mr-1.5 h-4 w-4" />Use default
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Thumbnail({ src, uploading }: { src: string | undefined; uploading: boolean }) {
  return (
    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-44">
      {isWebsiteImageSrc(src) ? (
        <Image src={src!} alt="Current image" fill unoptimized sizes="176px" className="object-cover" />
      ) : (
        <ImagePlus className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
      )}
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
    </div>
  );
}

function ImageLinkInput({ form, name }: { form: Form; name: ImageFieldName }) {
  return (
    <details className="group text-sm">
      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">Use an image link instead</summary>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <Input
            type="url"
            aria-label="Image link"
            placeholder="https://images.example.com/turf.jpg"
            className="mt-2"
            value={isUploadedWebsiteImage(field.value) ? "" : field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
          />
        )}
      />
    </details>
  );
}
