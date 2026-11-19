"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Send } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { planCharge } from "@/lib/platform-billing";
import type { BillingInterval } from "@/types/platform-billing";
import {
  OwnerApplicationPlans,
  useOwnerApplicationPlans,
  useSubscriptionPaymentMethods,
} from "./owner-application-plans";
import { OwnerApplicationPayment } from "./owner-application-payment";

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter the turf business name").max(100),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(50)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
    ownerName: z.string().trim().min(2, "Enter the owner's name").max(100),
    ownerEmail: z.string().trim().email("Enter a valid email"),
    password: z.string().min(12, "Use at least 12 characters").max(200),
    confirmPassword: z.string(),
    planId: z.string().uuid("Choose a subscription plan"),
    interval: z.enum(["monthly", "yearly"]),
    paymentMethod: z.enum(["bkash", "nagad", "bank_transfer"], "Choose a payment method"),
    paymentReference: z
      .string()
      .trim()
      .max(100)
      .refine(
        (value) =>
          /^[A-Z0-9][A-Z0-9._/-]{2,99}$/.test(
            value.normalize("NFKC").replace(/\s+/g, "").toUpperCase()
          ),
        "Enter a valid transaction reference"
      ),
    paymentDate: z.iso.date("Enter the date you sent the payment"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type PurchaseValues = z.infer<typeof schema>;
type Failure = {
  success: false;
  error: string;
  code?: string;
  details?: { field: string; message: string }[];
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

export function OwnerApplicationForm({
  initialPlanId,
  initialInterval,
}: {
  initialPlanId: string;
  initialInterval: BillingInterval;
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const attempt = useRef<{ requestId: string; payload: string } | null>(null);
  const plans = useOwnerApplicationPlans();
  const methods = useSubscriptionPaymentMethods();
  const form = useForm<PurchaseValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      ownerName: "",
      ownerEmail: "",
      password: "",
      confirmPassword: "",
      planId: initialPlanId,
      interval: initialInterval,
      paymentReference: "",
      paymentDate: "",
    },
  });
  const planId = useWatch({ control: form.control, name: "planId" });
  const interval = useWatch({ control: form.control, name: "interval" });
  const selectedPlan = plans.data?.find((plan) => plan.id === planId);
  const hasPaymentMethods = Object.values(methods.data ?? {}).some(Boolean);
  async function submit(values: PurchaseValues) {
    setError("");
    if (!selectedPlan || selectedPlan.id !== values.planId) {
      form.setError("planId", { message: "Choose an available subscription plan" });
      return;
    }
    if (!methods.data?.[values.paymentMethod]) {
      form.setError("paymentMethod", { message: "Choose an available payment method" });
      return;
    }
    const payload = {
      name: values.name,
      slug: values.slug,
      ownerName: values.ownerName,
      ownerEmail: values.ownerEmail,
      password: values.password,
      planId: values.planId,
      interval: values.interval,
      paymentMethod: values.paymentMethod,
      paymentReference: values.paymentReference,
      paymentDate: values.paymentDate,
      timezone: "Asia/Dhaka",
      currency: "bdt",
      planVersion: selectedPlan.version,
      expectedAmount: planCharge(selectedPlan, values.interval),
    };
    const signature = JSON.stringify(payload);
    if (attempt.current?.payload !== signature)
      attempt.current = { requestId: crypto.randomUUID(), payload: signature };
    try {
      const response = await fetch("/api/v1/owner-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          requestId: attempt.current.requestId,
        }),
      });
      const json = (await response.json()) as { success: true } | Failure;
      if (!json.success) {
        json.details?.forEach((item) => {
          if (item.field in values)
            form.setError(item.field as keyof PurchaseValues, { message: item.message });
        });
        setError(json.error);
        return;
      }
      attempt.current = null;
      form.reset();
      setSuccess(true);
    } catch {
      setError("Cannot reach the server. Please try again.");
    }
  }
  const name = form.register("name");
  const busy = form.formState.isSubmitting;
  if (success)
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl items-center px-4 py-12 sm:px-6">
        <section className="bg-card w-full rounded-3xl border p-6 text-center shadow-lg sm:p-10">
          <CheckCircle2 className="text-success mx-auto h-12 w-12" />
          <h1 className="mt-5 text-2xl font-bold tracking-tight">
            Payment submitted for verification
          </h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-6">
            Keep your transaction reference until verification is complete. Once the platform admin
            confirms the full payment, you can sign in with the email and password you chose.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="h-11">
              <Link href="/login">Go to owner login</Link>
            </Button>
            <Button asChild variant="outline" className="h-11">
              <Link href="/saas">Back to SaaS website</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14">
      <Link
        href="/saas"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium outline-none focus-visible:ring-2"
      >
        <ArrowLeft className="h-4 w-4" />
        SaaS website
      </Link>
      <div className="mt-6">
        <p className="text-primary text-xs font-semibold tracking-widest uppercase">
          Turf owner access
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Apply for turf owner access
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Choose a plan, set up your login details and submit the first payment for verification.{" "}
          <Link href="/saas#access" className="text-primary underline">
            See what your plan includes
          </Link>
          .
        </p>
      </div>
      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => void form.handleSubmit(submit)(event)}
        noValidate
      >
        <OwnerApplicationPlans
          plans={plans.data}
          planId={planId}
          interval={interval}
          disabled={form.formState.isSubmitting}
          error={form.formState.errors.planId?.message}
          loading={plans.isLoading}
          loadError={plans.isError}
          onPlan={(value) => form.setValue("planId", value, { shouldValidate: true })}
          onInterval={(value) => form.setValue("interval", value)}
          onRetry={() => plans.refetch()}
        />
        <section className="bg-card space-y-5 rounded-2xl border p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Turf business</h2>
          <Field label="Business name" error={form.formState.errors.name?.message}>
            <Input
              disabled={busy}
              {...name}
              onChange={(event) => {
                name.onChange(event);
                if (!form.formState.dirtyFields.slug)
                  form.setValue(
                    "slug",
                    event.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")
                      .slice(0, 50)
                  );
              }}
              aria-invalid={!!form.formState.errors.name}
            />
          </Field>
          <Field label="Turf handle" error={form.formState.errors.slug?.message}>
            <Input
              placeholder="greenfield-arena"
              disabled={busy}
              {...form.register("slug")}
              aria-invalid={!!form.formState.errors.slug}
            />
            <p className="text-muted-foreground text-xs">
              A unique lowercase handle for your turf account.
            </p>
          </Field>
        </section>
        <section className="bg-card space-y-5 rounded-2xl border p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Owner and login</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Owner name" error={form.formState.errors.ownerName?.message}>
              <Input
                autoComplete="name"
                disabled={busy}
                {...form.register("ownerName")}
                aria-invalid={!!form.formState.errors.ownerName}
              />
            </Field>
            <Field label="Email address" error={form.formState.errors.ownerEmail?.message}>
              <Input
                type="email"
                autoComplete="email"
                disabled={busy}
                {...form.register("ownerEmail")}
                aria-invalid={!!form.formState.errors.ownerEmail}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Password" error={form.formState.errors.password?.message}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="pr-12"
                  disabled={busy}
                  {...form.register("password")}
                  aria-invalid={!!form.formState.errors.password}
                />
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-11 items-center justify-center"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Field label="Confirm password" error={form.formState.errors.confirmPassword?.message}>
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={busy}
                {...form.register("confirmPassword")}
                aria-invalid={!!form.formState.errors.confirmPassword}
              />
            </Field>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Use at least 12 characters. Your password is stored securely and cannot be viewed by the
            SaaS admin.
          </p>
        </section>
        <OwnerApplicationPayment
          form={form}
          plan={selectedPlan}
          interval={interval}
          methods={methods}
        />
        {error && (
          <p
            role="alert"
            className="bg-destructive/10 text-destructive border-destructive/20 rounded-xl border p-3 text-sm"
          >
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">
            Already activated?{" "}
            <Link className="text-primary font-medium hover:underline" href="/login">
              Owner login
            </Link>
          </p>
          <Button
            type="submit"
            className="h-12 px-6"
            disabled={
              busy || plans.isError || methods.isError || !selectedPlan || !hasPaymentMethods
            }
          >
            {busy ? <Loader2 className="animate-spin" /> : <Send />}
            {busy ? "Submitting…" : "Submit payment and application"}
          </Button>
        </div>
      </form>
    </main>
  );
}
