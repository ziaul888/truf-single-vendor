import { Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SettingsSaveActionsProps {
  dirty: boolean;
  saving: boolean;
  onDiscard: () => void;
  /** Added to both buttons, e.g. to hide the header copy on phones. */
  className?: string;
}

/** Discard + Save for a settings form; put it inside the <form> so Save submits it. */
export function SettingsSaveActions({ dirty, saving, onDiscard, className }: SettingsSaveActionsProps) {
  return (
    <>
      <Button type="button" variant="outline" size="sm" className={className} onClick={onDiscard} disabled={!dirty || saving}>
        <RotateCcw className="mr-1.5 h-4 w-4" /> Discard
      </Button>
      <Button type="submit" size="sm" className={className} disabled={!dirty || saving}>
        {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </>
  );
}

/**
 * Phones only: the save buttons pinned to the bottom of the screen, because the header ones scroll
 * out of reach on a long form. Put it last inside the <form>; hide the header buttons below `md`.
 */
export function SettingsSaveBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-3 flex gap-2 border-t bg-background/95 px-3 pt-3 backdrop-blur sm:-mx-6 sm:px-6 md:hidden",
        "pb-[calc(0.75rem+env(safe-area-inset-bottom))] [&>button]:h-10 [&>button]:flex-1"
      )}
    >
      {children}
    </div>
  );
}
