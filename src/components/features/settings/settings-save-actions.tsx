import { Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Discard + Save for a settings form; put it inside the <form> so Save submits it. */
export function SettingsSaveActions({ dirty, saving, onDiscard }: { dirty: boolean; saving: boolean; onDiscard: () => void }) {
  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={onDiscard} disabled={!dirty || saving}>
        <RotateCcw className="mr-1.5 h-4 w-4" /> Discard
      </Button>
      <Button type="submit" size="sm" disabled={!dirty || saving}>
        {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </>
  );
}
