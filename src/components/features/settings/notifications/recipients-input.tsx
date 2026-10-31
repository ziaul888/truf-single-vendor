"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MAX_RECIPIENTS, RecipientSchema } from "@/validations/notifications";

interface RecipientsInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  /** Message for the whole list (e.g. too many). */
  error?: string;
  /** Messages per address, by index (from the API's "staff.recipients.1"). */
  itemErrors?: (string | undefined)[];
}

/** Up to 5 staff addresses; an empty list sends to every active admin. */
export function RecipientsInput({ value, onChange, error, itemErrors = [] }: RecipientsInputProps) {
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);
  const full = value.length >= MAX_RECIPIENTS;

  function add() {
    const parsed = RecipientSchema.safeParse(draft);
    if (!parsed.success) return setDraftError(parsed.error.issues[0]?.message ?? "Enter a valid email");
    if (value.includes(parsed.data)) return setDraftError("Already in the list");
    onChange([...value, parsed.data]);
    setDraft("");
    setDraftError(null);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="recipient-draft">Staff recipients</Label>
      {value.length === 0 && (
        <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">No addresses added: staff emails go to every active admin.</p>
      )}
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((email, i) => (
            <li key={email}>
              <div className={cn("flex items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-sm", itemErrors[i] && "border-destructive")}>
                <span className="truncate">{email}</span>
                <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label={`Remove ${email}`} onClick={() => onChange(value.filter((_, j) => j !== i))}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              {itemErrors[i] && <p className="mt-0.5 text-[11px] text-destructive">{itemErrors[i]}</p>}
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <Input
          id="recipient-draft"
          type="email"
          placeholder={full ? `At most ${MAX_RECIPIENTS} addresses` : "staff@example.com"}
          value={draft}
          disabled={full}
          onChange={(e) => { setDraft(e.target.value); setDraftError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          className={cn("max-w-xs", draftError && "border-destructive")}
        />
        <Button type="button" variant="outline" size="sm" onClick={add} disabled={full || !draft.trim()}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add
        </Button>
      </div>
      {(draftError || error) && <p className="text-[11px] text-destructive">{draftError ?? error}</p>}
      <p className="text-[11px] text-muted-foreground">Up to {MAX_RECIPIENTS} addresses. Leave empty to email every active admin.</p>
    </div>
  );
}
