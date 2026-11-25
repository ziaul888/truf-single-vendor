"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Opens the phone's share sheet for this page; without one (most desktops) copies the link instead. */
export function ShareButton({ title, className }: { title: string; className?: string }) {
  async function share() {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      // Dismissing the share sheet rejects with AbortError: nothing to do.
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label="Share this ground"
      title="Share"
      className={cn("flex h-10 w-10 items-center justify-center rounded-full border hover:bg-muted", className)}
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}
