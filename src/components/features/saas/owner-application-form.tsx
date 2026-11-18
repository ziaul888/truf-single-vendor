"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Send } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OwnerApplicationPlans, useOwnerApplicationPlans } from "./owner-application-plans";

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
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type Values = z.infer<typeof schema>;
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

export function OwnerApplicationForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [requestId, setRequestId] = useState("");
  const plans = useOwnerApplicationPlans();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      ownerName: "",
      ownerEmail: "",
      password: "",
      confirmPassword: "",
      planId: "",
      interval: "monthly",
    },
  });
  const planId = useWatch({ control: form.control, name: "planId" });
  const interval = useWatch({ control: form.control, name: "interval" });
  async function submit(values: Values) {
    setError("");
    const currentRequestId = requestId || crypto.randomUUID();
    if (!requestId) setRequestId(currentRequestId);
    try {
      const response = await fetch("/api/v1/owner-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: currentRequestId,
          name: values.name,
          slug: values.slug,
          ownerName: values.ownerName,
          ownerEmail: values.ownerEmail,
          password: values.password,
          timezone: "Asia/Dhaka",
          currency: "bdt",
          planId: values.planId,
          interval: values.interval,
        }),
      });
      const json = (await response.json()) as { success: true } | Failure;
      if (!json.success) {
        json.details?.forEach((item) => {
          if (item.field in values)
            form.setError(item.field as keyof Values, { message: item.message });
        });
        setError(json.error);
        return;
      }
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
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Application received</h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-6">
            Your account is waiting for SaaS admin approval. After activation, sign in from the
            regular login page with the email and password you selected. Your first plan invoice
            will be ready for manual payment confirmation.
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
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Apply for activation</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Choose your login details now. You can sign in only after the SaaS admin approves and
          activates your application.
        </p>
      </div>
      <form className="mt-8 space-y-5" onSubmit={form.handleSubmit(submit)} noValidate>
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
            disabled={busy || plans.isLoading || !plans.data?.length}
          >
            {busy ? <Loader2 className="animate-spin" /> : <Send />}
            {busy ? "Submitting…" : "Submit application"}
          </Button>
        </div>
      </form>
    </main>
  );
}
