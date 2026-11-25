import { Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

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
 * Editing actions above the navigation below lg. Put the bar last inside the form.
 */
export function SettingsSaveBar({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  if (!visible) return null;
  return (
    <div
      data-settings-save-bar
      className="sticky bottom-0 z-10 -ml-(--dashboard-left) -mr-(--dashboard-right) grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2 border-t bg-card py-3 pl-(--dashboard-left) pr-(--dashboard-right) lg:hidden [&>button]:h-auto [&>button]:min-h-11 [&>button]:px-2 [&>button]:whitespace-normal [&>button:only-child]:col-span-2 [&_svg]:mr-0"
    >
      {children}
    </div>
  );
}
