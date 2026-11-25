import Image from "next/image";
import { FallbackImage } from "./fallback-image";
import { SAAS_SCREENSHOT_DETAILS, type SaasScreenshotSlot } from "../lib/saas-screenshots";

export function SaasScreenshotImage({
  slot,
  imageUrl,
  sizes,
  priority,
}: {
  slot: SaasScreenshotSlot;
  imageUrl: string | null;
  sizes: string;
  priority?: boolean;
}) {
  const { src, alt, width, height } = SAAS_SCREENSHOT_DETAILS[slot];
  const className = "h-full w-full object-cover object-top";
  const defaultImage = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );

  return imageUrl ? (
    <FallbackImage
      src={imageUrl}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      priority={priority}
      className={className}
      fallback={defaultImage}
    />
  ) : (
    defaultImage
  );
}
