"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WebsiteSettingsSchema, type WebsiteSettings } from "@/validations/website-settings";
import {
  ContactFields, HeroFields, SocialFields,
} from "@/components/features/website-settings/website-form-sections";
import {
  FeaturedGroundsEditor, HowItWorksEditor, SportChipsEditor, VisitUsEditor,
} from "@/components/features/website-settings/section-editors";
import { AmenitiesEditor } from "@/components/features/website-settings/amenities-editor";
import { WebsitePreview } from "@/components/features/website-settings/website-preview";

const QUERY_KEY = ["settings", "website"];

async function fetchSettings(): Promise<WebsiteSettings> {
  const res = await fetch("/api/settings/website", { cache: "no-store" });
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "Couldn't load website settings");
  return json.data;
}

async function saveSettings(data: WebsiteSettings): Promise<WebsiteSettings> {
  const res = await fetch("/api/settings/website", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "Couldn't save website settings");
  return json.data;
}

export default function WebsiteSettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: QUERY_KEY, queryFn: fetchSettings });
  const form = useForm<WebsiteSettings>({ resolver: zodResolver(WebsiteSettingsSchema) });
  const { reset, handleSubmit, formState: { isDirty } } = form;

  useEffect(() => { if (data) reset(data); }, [data, reset]);

  const mutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: (saved) => {
      queryClient.setQueryData(QUERY_KEY, saved);
      reset(saved);
      toast.success("Website updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading website settings…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-3 py-10 text-sm">
        <p>Couldn&apos;t load website settings.</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-5" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Website</h2>
          <p className="text-sm text-muted-foreground">What customers see on the booking site</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-4 w-4" />View site
            </Link>
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={!isDirty || mutation.isPending} onClick={() => reset(data)}>
            <RotateCcw className="mr-1.5 h-4 w-4" />Discard
          </Button>
          <Button type="submit" size="sm" disabled={!isDirty || mutation.isPending}>
            {mutation.isPending
              ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Saving…</>
              : <><Save className="mr-1.5 h-4 w-4" />Save changes</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <HeroFields form={form} />
          <ContactFields form={form} />
          <h3 className="pt-2 text-sm font-semibold text-muted-foreground">Home page sections</h3>
          <SportChipsEditor form={form} />
          <FeaturedGroundsEditor form={form} />
          <AmenitiesEditor form={form} />
          <HowItWorksEditor form={form} />
          <VisitUsEditor form={form} />
          <SocialFields form={form} />
        </div>
        <aside className="order-first xl:sticky xl:top-6 xl:order-none">
          <WebsitePreview control={form.control} isDirty={isDirty} />
        </aside>
      </div>
    </form>
  );
}
