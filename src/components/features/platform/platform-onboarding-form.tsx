"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePlatformMe } from "@/hooks/usePlatform";
import { usePlatformCommand } from "@/hooks/usePlatformBilling";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import type { PlatformTenant } from "@/types/platform";
import { PlatformBack, BillingError } from "./billing-parts";
const schema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  ownerName: z.string().trim().min(2).max(100),
  ownerEmail: z.string().trim().email(),
  timezone: z.string().trim().min(3).max(80),
});
type Values = z.infer<typeof schema>;
export function PlatformOnboardingForm() {
  const me = usePlatformMe(),
    router = useRouter(),
    [error, setError] = useState("");
  const command = usePlatformCommand<Values & { currency: "bdt" }, PlatformTenant>(
    me.data?.id,
    "/tenants"
  );
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", ownerName: "", ownerEmail: "", timezone: "Asia/Dhaka" },
  });
  async function submit(values: Values) {
    setError("");
    try {
      const tenant = await command.mutateAsync({ ...values, currency: "bdt" });
      router.push(`/platform/tenants/${tenant.id}`);
    } catch (err) {
      const failure = toApiFailure(err);
      if (
        !applyApiErrors(form, failure, {
          TENANT_SLUG_IN_USE: "slug",
          OWNER_ALREADY_ASSIGNED: "ownerEmail",
        })
      )
        setError(failure.error);
    }
  }
  const name = form.register("name"),
    busy = form.formState.isSubmitting;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PlatformBack href="/platform/tenants">Turf businesses</PlatformBack>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add a turf business</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Create the turf account and assign its owner. New accounts begin in setup.
        </p>
      </div>
      <form className="space-y-5" onSubmit={form.handleSubmit(submit)} noValidate>
        <section className="bg-card space-y-5 rounded-2xl border p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Turf details</h2>
          <div className="space-y-2">
            <Label htmlFor="turf-name">Business name</Label>
            <Input
              id="turf-name"
              disabled={busy}
              {...name}
              onChange={(e) => {
                name.onChange(e);
                if (!form.formState.dirtyFields.slug)
                  form.setValue(
                    "slug",
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")
                      .slice(0, 50)
                  );
              }}
              aria-invalid={!!form.formState.errors.name}
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="turf-slug">Turf handle</Label>
            <Input
              id="turf-slug"
              placeholder="greenfield-arena"
              disabled={busy}
              {...form.register("slug")}
              aria-invalid={!!form.formState.errors.slug}
            />
            <p className="text-muted-foreground text-xs">
              A unique handle using lowercase letters, numbers and hyphens.
            </p>
            {form.formState.errors.slug && (
              <p className="text-destructive text-xs">{form.formState.errors.slug.message}</p>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="turf-timezone">Time zone</Label>
              <Input id="turf-timezone" disabled={busy} {...form.register("timezone")} />
              {form.formState.errors.timezone && (
                <p className="text-destructive text-xs">{form.formState.errors.timezone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="turf-currency">Currency</Label>
              <Input id="turf-currency" value="BDT — Bangladeshi taka" readOnly />
            </div>
          </div>
        </section>
        <section className="bg-card space-y-5 rounded-2xl border p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Business owner</h2>
          <div className="space-y-2">
            <Label htmlFor="turf-owner-name">Owner name</Label>
            <Input
              id="turf-owner-name"
              disabled={busy}
              {...form.register("ownerName")}
              aria-invalid={!!form.formState.errors.ownerName}
            />
            {form.formState.errors.ownerName && (
              <p className="text-destructive text-xs">{form.formState.errors.ownerName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="turf-owner-email">Owner email</Label>
            <Input
              id="turf-owner-email"
              type="email"
              disabled={busy}
              {...form.register("ownerEmail")}
              aria-invalid={!!form.formState.errors.ownerEmail}
            />
            {form.formState.errors.ownerEmail && (
              <p className="text-destructive text-xs">{form.formState.errors.ownerEmail.message}</p>
            )}
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Each owner can be assigned to one turf. New owner access remains pending while the turf
            is being set up.
          </p>
        </section>
        <BillingError message={error} />
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" className="h-11" asChild>
            <Link href="/platform/tenants">Cancel</Link>
          </Button>
          <Button type="submit" className="h-11" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {busy ? "Creating…" : "Create turf account"}
          </Button>
        </div>
      </form>
    </div>
  );
}
