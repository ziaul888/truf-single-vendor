"use client";

import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { WebsiteSectionKey, WebsiteSettings } from "@/validations/website-settings";

/** A home page section with its show/hide switch in the header. */
export function SectionCard({
  form, sectionKey, title, description, icon: Icon, children,
}: {
  form: UseFormReturn<WebsiteSettings>;
  sectionKey: WebsiteSectionKey;
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  const enabled = useWatch({ control: form.control, name: `sections.${sectionKey}.enabled` });
  const switchId = `section-${sectionKey}-enabled`;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4 text-muted-foreground" /> {title}
          </CardTitle>
          <CardDescription>{enabled ? description : "Hidden from the home page. You can still edit it."}</CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <label htmlFor={switchId} className="text-xs text-muted-foreground">{enabled ? "Shown" : "Hidden"}</label>
          <Controller
            control={form.control}
            name={`sections.${sectionKey}.enabled`}
            render={({ field }) => (
              <Switch id={switchId} checked={field.value} onCheckedChange={field.onChange} aria-label={`Show ${title} on the home page`} />
            )}
          />
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-4 transition-opacity", !enabled && "opacity-60")}>{children}</CardContent>
    </Card>
  );
}
