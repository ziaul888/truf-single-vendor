import { Lock } from "lucide-react";

/** Shown to managers: they can read settings, only admins can change them. */
export function ReadOnlyNotice() {
  return (
    <p className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      <Lock className="h-4 w-4" /> Only admins can change these settings.
    </p>
  );
}
