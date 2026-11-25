"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { useTheme } from "next-themes";
import { Palette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppearance, useSaveAppearance, type AppearanceScope } from "@/hooks/useAppearance";
import { dashboardAccentStyles, normalizeAccentColor, type Appearance } from "@/lib/appearance";
import { toApiFailure } from "@/lib/api-error";
import { SettingsLoading, SettingsLoadError } from "./settings-load-state";
import { SettingsSection } from "./settings-section";
import {
  PlatformSettingsSection,
  PlatformSettingsStatus,
} from "@/components/features/platform/platform-settings-section";
import { cn } from "@/lib/utils";

export function AppearanceSettings({ scope, id }: { scope: AppearanceScope; id?: string }) {
  const query = useAppearance(scope, id);

  const form =
    id && query.data ? (
      <AccentColorForm key={id} scope={scope} id={id} current={query.data} />
    ) : null;
  const description = "Applied to buttons, links and navigation highlights.";

  if (scope === "platform") {
    return (
      <PlatformSettingsSection icon={Palette} title="Primary color" description={description}>
        {form ?? (
          <PlatformSettingsStatus
            subject="primary color"
            error={query.error}
            fetching={query.isFetching}
            onRetry={() => void query.refetch()}
          />
        )}
      </PlatformSettingsSection>
    );
  }

  if (!form && query.isError)
    return <SettingsLoadError what="appearance settings" onRetry={() => query.refetch()} />;
  if (!form) return <SettingsLoading />;

  return (
    <SettingsSection icon={Palette} title="Primary color" description={description}>
      {form}
    </SettingsSection>
  );
}

function AccentColorForm({
  scope,
  id,
  current,
}: {
  scope: AppearanceScope;
  id: string;
  current: Appearance;
}) {
  const fieldId = useId();
  const { resolvedTheme } = useTheme();
  const save = useSaveAppearance(scope, id);
  const [draft, setDraft] = useState<string | null>(null);
  const color = draft ?? current.accentColor ?? "";
  const normalized = normalizeAccentColor(color.trim());
  const invalid = color.trim() !== "" && !normalized;
  const changed = normalized !== current.accentColor;
  const defaultColor = resolvedTheme === "pitch" ? "#E5BB2E" : "#DA291C";
  const preview = normalized
    ? dashboardAccentStyles(normalized, resolvedTheme)
    : {
        "--primary": "var(--theme-primary)",
        "--primary-foreground": "var(--theme-primary-foreground)",
      };

  function update(value: string) {
    setDraft(value);
    if (save.isError) save.reset();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (invalid || !changed || save.isPending) return;
    try {
      await save.mutateAsync({ accentColor: normalized });
      setDraft(null);
      toast.success("Dashboard color saved");
    } catch {
      // The form shows the request error below.
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <fieldset disabled={save.isPending} className="space-y-2">
        <Label htmlFor={fieldId}>Hex color</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id={fieldId}
            value={color}
            onChange={(event) => update(event.target.value)}
            placeholder={defaultColor}
            maxLength={7}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={invalid}
            aria-describedby={`${fieldId}-help`}
            className="h-11 w-32 font-mono"
          />
          <Input
            type="color"
            value={normalized ?? defaultColor}
            onChange={(event) => update(event.target.value.toUpperCase())}
            aria-label="Pick a primary color"
            className="h-11 w-12 cursor-pointer p-1"
          />
          <Button
            type="button"
            variant="ghost"
            className="min-h-11"
            disabled={!color}
            onClick={() => update("")}
          >
            Use default
          </Button>
        </div>
        <p
          id={`${fieldId}-help`}
          className={invalid ? "text-destructive text-sm" : "text-muted-foreground text-sm"}
        >
          {invalid
            ? "Enter a six-digit hex color, such as #2563EB."
            : "The dashboard adjusts shades for readability in each theme."}
        </p>
      </fieldset>
      <div className="bg-muted/35 rounded-xl border p-4" style={preview as CSSProperties}>
        <p className="text-muted-foreground mb-3 text-xs font-medium">Color preview</p>
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <span className="bg-primary text-primary-foreground rounded-lg px-4 py-2">
            Primary button
          </span>
          <span className="text-primary underline underline-offset-4">Link text</span>
        </div>
      </div>
      {save.isError && (
        <p className="text-destructive text-sm" role="alert">
          {toApiFailure(save.error).error}
        </p>
      )}
      <div className={cn(scope === "platform" && "flex justify-end border-t pt-4")}>
        <Button
          type="submit"
          className={cn("min-h-11", scope === "platform" && "w-full sm:w-auto")}
          disabled={invalid || !changed || save.isPending}
        >
          {save.isPending ? "Saving…" : "Save color"}
        </Button>
      </div>
    </form>
  );
}
