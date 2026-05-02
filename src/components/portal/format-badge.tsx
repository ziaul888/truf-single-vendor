import { Grid3x3 } from "lucide-react";
import type { Ground } from "@/types/api";
import { FORMAT_LABEL } from "@/lib/portal-stub-data";
import { cn } from "@/lib/utils";

export function FormatBadge({
  format,
  size = "sm",
  className,
}: {
  format: Ground["format"];
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-sidebar font-extrabold tracking-wide text-accent",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-sm",
        className
      )}
    >
      <Grid3x3 className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {FORMAT_LABEL[format]}
    </span>
  );
}
