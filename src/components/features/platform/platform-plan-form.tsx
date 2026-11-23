"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Layers3, ListChecks, Loader2, Timer, Wallet } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { usePlatformMe } from "@/hooks/usePlatform";
import { usePlatformCommand } from "@/hooks/usePlatformBilling";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { bdtMinorUnits, formatBdt } from "@/lib/platform-billing";
import { PLAN_FEATURE_DETAILS, PLAN_FEATURES, type PlanFeature } from "@/lib/plan-features";
import type { PlatformPlan } from "@/types/platform-billing";
import { PlatformBack, BillingError } from "./billing-parts";
import { PlatformSettingsSection } from "./platform-settings-section";
import { PlanFeaturesList } from "@/components/plan-features-list";
const price = z
  .string()
  .trim()
  .refine((value) => {
    try {
      bdtMinorUnits(value);
      return true;
    } catch {
      return false;
    }
  }, "Enter a BDT price between 0.01 and 10,000,000, with up to two decimal places");
const schema = z
  .object({
    name: z.string().trim().min(2).max(80),
    code: z
      .string()
      .trim()
      .min(2)
      .max(40)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
    description: z.string().trim().max(500),
    kind: z.enum(["paid", "trial"]),
    trialDays: z.string(),
    monthlyPrice: z.string(),
    yearlyPrice: z.string(),
    features: z.array(z.enum(PLAN_FEATURES)),
  })
  .superRefine((values, ctx) => {
    if (values.kind === "trial") {
      if (
        !/^\d+$/.test(values.trialDays) ||
        Number(values.trialDays) < 1 ||
        Number(values.trialDays) > 365
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["trialDays"],
          message: "Enter a whole number from 1 to 365",
        });
      }
      return;
    }
    for (const key of ["monthlyPrice", "yearlyPrice"] as const) {
      const result = price.safeParse(values[key]);
      if (!result.success)
        ctx.addIssue({ code: "custom", path: [key], message: result.error.issues[0].message });
    }
  });
type Values = z.infer<typeof schema>;
const identityFields = [
  { key: "name", label: "Plan name", placeholder: "e.g. Starter" },
  { key: "code", label: "Plan code", placeholder: "e.g. starter" },
] as const;
const priceFields = [
  { key: "monthlyPrice", label: "Monthly price (BDT)" },
  { key: "yearlyPrice", label: "Yearly price (BDT)" },
] as const;
const planTypes = [
  {
    value: "paid",
    label: "Paid subscription",
    detail: "Monthly and yearly prices",
    Icon: CreditCard,
  },
  { value: "trial", label: "Free trial", detail: "Access for a set number of days", Icon: Timer },
] as const;

function previewPrice(value: string) {
  try {
    return formatBdt(bdtMinorUnits(value));
  } catch {
    return "—";
  }
}

export function PlatformPlanForm() {
  const me = usePlatformMe(),
    router = useRouter(),
    queryClient = useQueryClient(),
    [error, setError] = useState("");
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      kind: "paid",
      trialDays: "14",
      monthlyPrice: "",
      yearlyPrice: "",
      features: [...PLAN_FEATURES],
    },
  });
  const [kind, name, description, monthly, yearly, days, features] = useWatch({
    control: form.control,
    name: ["kind", "name", "description", "monthlyPrice", "yearlyPrice", "trialDays", "features"],
  });
  const isTrial = kind === "trial";
  const command = usePlatformCommand<
    {
      name: string;
      code: string;
      description: string;
      monthlyAmount?: number;
      yearlyAmount?: number;
      trialDays?: number;
      features: PlanFeature[];
    },
    PlatformPlan
  >(me.data?.id, "/plans");
  async function submit(values: Values) {
    setError("");
    try {
      await command.mutateAsync({
        name: values.name,
        code: values.code,
        description: values.description,
        features: values.features,
        ...(values.kind === "trial"
          ? { trialDays: Number(values.trialDays) }
          : {
              monthlyAmount: bdtMinorUnits(values.monthlyPrice),
              yearlyAmount: bdtMinorUnits(values.yearlyPrice),
            }),
      });
      await queryClient.invalidateQueries({ queryKey: ["owner-application", "plans"] });
      router.push("/platform/plans");
    } catch (err) {
      const failure = toApiFailure(err);
      if (!applyApiErrors(form, failure, { PLAN_CODE_IN_USE: "code" })) setError(failure.error);
    }
  }
  const busy = form.formState.isSubmitting;
  return (
    <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
      <PlatformBack href="/platform/plans">Plans</PlatformBack>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create plan</h1>
      </div>
      <form
        className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_19rem] 2xl:grid-cols-[minmax(0,1fr)_21rem]"
        onSubmit={form.handleSubmit(submit)}
        noValidate
      >
        <div className="min-w-0 space-y-5">
          <PlatformSettingsSection
            title="Plan details"
            icon={Layers3}
            description="Name and describe the plan for turf owners comparing their options."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {identityFields.map(({ key, label, placeholder }) => (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={`plan-${key}`}>{label}</Label>
                  <Input
                    id={`plan-${key}`}
                    placeholder={placeholder}
                    disabled={busy}
                    {...form.register(key)}
                    aria-invalid={!!form.formState.errors[key]}
                  />
                  {form.formState.errors[key] && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors[key]?.message}
                    </p>
                  )}
                </div>
              ))}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="plan-description">Description (optional)</Label>
                <Textarea
                  id="plan-description"
                  rows={3}
                  disabled={busy}
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </PlatformSettingsSection>
          <PlatformSettingsSection
            title="Billing"
            icon={Wallet}
            description="Choose a paid subscription or a free trial."
          >
            <fieldset disabled={busy} className="mb-5">
              <legend className="mb-2 text-sm font-medium">Plan type</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {planTypes.map(({ value, label, detail, Icon }) => (
                  <label
                    key={value}
                    className="has-checked:border-primary/60 has-checked:bg-primary/5 has-focus-visible:ring-ring/40 flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border p-3 has-focus-visible:ring-2"
                  >
                    <input
                      type="radio"
                      value={value}
                      className="accent-primary size-4 shrink-0"
                      {...form.register("kind")}
                    />
                    <Icon aria-hidden className="text-muted-foreground size-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="text-muted-foreground block text-xs">{detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {isTrial ? (
              <div className="space-y-2">
                <Label htmlFor="plan-trial-days">Trial length (days)</Label>
                <Input
                  id="plan-trial-days"
                  type="number"
                  min={1}
                  max={365}
                  inputMode="numeric"
                  disabled={busy}
                  {...form.register("trialDays")}
                  aria-invalid={!!form.formState.errors.trialDays}
                />
                {form.formState.errors.trialDays && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.trialDays.message}
                  </p>
                )}
                <p className="text-muted-foreground text-sm">
                  The trial begins when the application is approved.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {priceFields.map(({ key, label }) => (
                  <div className="space-y-2" key={key}>
                    <Label htmlFor={`plan-${key}`}>{label}</Label>
                    <Input
                      id={`plan-${key}`}
                      inputMode="decimal"
                      placeholder="0.00"
                      disabled={busy}
                      {...form.register(key)}
                      aria-invalid={!!form.formState.errors[key]}
                    />
                    {form.formState.errors[key] && (
                      <p className="text-destructive text-xs">
                        {form.formState.errors[key]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </PlatformSettingsSection>
          <PlatformSettingsSection
            title="Plan features"
            icon={ListChecks}
            description="Select the optional features available to turf owners on this plan."
          >
            <fieldset disabled={busy}>
              <legend className="sr-only">Optional features</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {PLAN_FEATURES.map((feature) => {
                  const { label, description } = PLAN_FEATURE_DETAILS[feature];
                  return (
                    <label
                      key={feature}
                      className="has-checked:border-primary/50 has-checked:bg-primary/5 has-focus-visible:ring-ring/40 flex cursor-pointer items-start gap-3 rounded-xl border p-3 has-focus-visible:ring-2"
                    >
                      <input
                        type="checkbox"
                        value={feature}
                        aria-labelledby={`plan-feature-${feature}-label`}
                        aria-describedby={`plan-feature-${feature}-description`}
                        className="accent-primary mt-0.5 size-4 shrink-0"
                        {...form.register("features")}
                      />
                      <span className="space-y-1 text-sm">
                        <span id={`plan-feature-${feature}-label`} className="block font-medium">
                          {label}
                        </span>
                        <span
                          id={`plan-feature-${feature}-description`}
                          className="text-muted-foreground block"
                        >
                          {description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {form.formState.errors.features?.message && (
                <p role="alert" className="text-destructive mt-2 text-sm">
                  {form.formState.errors.features.message}
                </p>
              )}
            </fieldset>
          </PlatformSettingsSection>
        </div>
        <aside
          aria-labelledby="plan-preview-heading"
          className="bg-card min-w-0 rounded-2xl border xl:sticky xl:top-24"
        >
          <div className="border-b p-4 sm:p-5">
            <h2 id="plan-preview-heading" className="text-base font-semibold">
              Plan preview
            </h2>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <div className="min-w-0 [overflow-wrap:anywhere]">
              <p className="text-xl font-semibold">{name.trim() || "Untitled plan"}</p>
              {description.trim() && (
                <p className="text-muted-foreground mt-1 text-sm">{description}</p>
              )}
            </div>
            <dl className="bg-muted/50 grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl p-3 text-sm">
              {isTrial ? (
                <>
                  <dt className="text-muted-foreground">Free trial</dt>
                  <dd className="text-right font-semibold">
                    {/^\d+$/.test(days) && Number(days) >= 1 && Number(days) <= 365
                      ? `${Number(days)} days`
                      : "—"}
                  </dd>
                </>
              ) : (
                <>
                  <dt className="text-muted-foreground">Monthly</dt>
                  <dd className="text-right font-semibold break-words tabular-nums">
                    {previewPrice(monthly)}
                  </dd>
                  <dt className="text-muted-foreground">Yearly</dt>
                  <dd className="text-right font-semibold break-words tabular-nums">
                    {previewPrice(yearly)}
                  </dd>
                </>
              )}
            </dl>
            <PlanFeaturesList features={features} />
            <BillingError message={error} />
            <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
              <Button variant="outline" className="h-11" asChild>
                <Link href="/platform/plans">Cancel</Link>
              </Button>
              <Button type="submit" className="h-11" disabled={busy}>
                {busy && <Loader2 aria-hidden className="motion-safe:animate-spin" />}
                {busy ? "Creating…" : "Create plan"}
              </Button>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
