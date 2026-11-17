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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { usePlatformMe } from "@/hooks/usePlatform";
import { usePlatformCommand } from "@/hooks/usePlatformBilling";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { bdtMinorUnits } from "@/lib/platform-billing";
import type { PlatformPlan } from "@/types/platform-billing";
import { PlatformBack, BillingError } from "./billing-parts";
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
const schema = z.object({
  name: z.string().trim().min(2).max(80),
  code: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  description: z.string().trim().max(500),
  monthlyPrice: price,
  yearlyPrice: price,
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
export function PlatformPlanForm() {
  const me = usePlatformMe(),
    router = useRouter(),
    [error, setError] = useState("");
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", code: "", description: "", monthlyPrice: "", yearlyPrice: "" },
  });
  const command = usePlatformCommand<
    {
      name: string;
      code: string;
      description: string;
      monthlyAmount: number;
      yearlyAmount: number;
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
        monthlyAmount: bdtMinorUnits(values.monthlyPrice),
        yearlyAmount: bdtMinorUnits(values.yearlyPrice),
      });
      router.push("/platform/plans");
    } catch (err) {
      const failure = toApiFailure(err);
      if (!applyApiErrors(form, failure, { PLAN_CODE_IN_USE: "code" })) setError(failure.error);
    }
  }
  const busy = form.formState.isSubmitting;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PlatformBack href="/platform/plans">Plans</PlatformBack>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create a subscription plan</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Set the monthly and yearly software subscription prices in BDT.
        </p>
      </div>
      <form className="space-y-5" onSubmit={form.handleSubmit(submit)} noValidate>
        <section className="bg-card space-y-5 rounded-2xl border p-5 sm:p-7">
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
                <p className="text-destructive text-xs">{form.formState.errors[key]?.message}</p>
              )}
            </div>
          ))}
          <div className="space-y-2">
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
        </section>
        <section className="bg-card space-y-5 rounded-2xl border p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Subscription pricing</h2>
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
                  <p className="text-destructive text-xs">{form.formState.errors[key]?.message}</p>
                )}
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            These rates apply to newly assigned subscriptions. Payment is recorded after you verify
            it in your receiving account.
          </p>
        </section>
        <BillingError message={error} />
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" className="h-11" asChild>
            <Link href="/platform/plans">Cancel</Link>
          </Button>
          <Button type="submit" className="h-11" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {busy ? "Creating…" : "Create plan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
