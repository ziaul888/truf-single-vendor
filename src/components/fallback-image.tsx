"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { isUploadedImage } from "@/components/portal/home/is-uploaded-image";

/**
 * A `fill` image that shows a placeholder when the file can't be loaded (deleted, or lost when the
 * API restarted): the pitch-coloured one, or your own `fallback` (which should fill its parent, e.g.
 * `absolute inset-0`). Uploaded images skip the Next optimizer, as everywhere else.
 */
export function FallbackImage({
  src, unoptimized, alt = "", fallback, ...props
}: Omit<ImageProps, "src"> & { src: string; fallback?: React.ReactNode }) {
  // Remember which src failed, so a new src gets a fresh try.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) {
    return fallback ?? (
      <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/80 to-primary/40 text-primary-foreground/60">
        <ImageOff className="h-8 w-8" aria-hidden />
      </div>
    );
  }
  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      unoptimized={unoptimized ?? isUploadedImage(src)}
      onError={() => setFailedSrc(src)}
      // A server-rendered image can fail before React attaches onError: catch that on mount.
      ref={(img) => {
        if (img?.complete && img.naturalWidth === 0) setFailedSrc(src);
      }}
    />
  );
}
