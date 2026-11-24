"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlanFeaturesList } from "@/components/plan-features-list";
import { formatBdt, planCharge } from "@/lib/platform-billing";
import type { BillingInterval, PlatformPlan } from "@/types/platform-billing";
import {
  OwnerApplicationPlans,
  useOwnerApplicationPlans,
  useSubscriptionPaymentMethods,
} from "./owner-application-plans";
import { OwnerApplicationPayment } from "./owner-application-payment";

const paymentDetailsSchema = z.object({
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
});

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
    includePayment: z.boolean(),
    paymentMethod: paymentDetailsSchema.shape.paymentMethod.nullish(),
    paymentReference: z.string().optional(),
    paymentDate: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.includePayment) return;
    const payment = paymentDetailsSchema.safeParse(value);
    if (!payment.success) {
      for (const { path, message } of payment.error.issues) {
        ctx.addIssue({ code: "custom", path, message });
      }
    }
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type PurchaseValues = z.infer<typeof schema>;
type SubmissionKind = "application" | "payment" | "trial";
type Failure = {
  success: false;
  error: string;
  code?: string;
  details?: { field: string; message: string }[];
};

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

function ApplicationSummary({
  plan,
  interval,
}: {
  plan?: PlatformPlan;
  interval: BillingInterval;
}) {
  return (
    <aside
      className="bg-card min-w-0 overflow-hidden rounded-2xl border shadow-xs lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1"
      aria-labelledby="order-summary"
    >
      <div className="p-5 sm:p-6">
        <h2 id="order-summary" className="saas-title flex items-center gap-2.5">
          <ReceiptText aria-hidden className="text-primary size-5 shrink-0" />
          Order summary
        </h2>
        {plan ? (
          <div aria-live="polite" className="mt-5">
            <dl className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-4 text-sm">
              <dt className="min-w-0 font-semibold [overflow-wrap:anywhere]">{plan.name}</dt>
              <dd className="text-muted-foreground">
                {plan.trialDays ? "Trial" : interval === "yearly" ? "Yearly" : "Monthly"}
              </dd>
            </dl>
            <p className="text-muted-foreground mt-4 text-sm">
              {plan.trialDays ? "Trial length" : "First subscription payment"}
            </p>
            <p className="saas-numeral mt-1 text-4xl leading-tight tracking-tight [overflow-wrap:anywhere]">
              {plan.trialDays ? `${plan.trialDays} days` : formatBdt(planCharge(plan, interval))}
            </p>
            <PlanFeaturesList features={plan.features} className="mt-5 border-t pt-4" />
          </div>
        ) : (
          <p className="text-muted-foreground mt-3 text-sm">Choose a plan to see its price.</p>
        )}
      </div>
      <div className="bg-muted/45 flex items-start gap-3 border-t p-5 sm:px-6">
        <ShieldCheck aria-hidden className="text-primary mt-0.5 size-5 shrink-0" />
        <div className="text-sm leading-relaxed">
          <p className="font-semibold">
            {plan?.trialDays ? "Trial approval" : "Pay after applying"}
          </p>
          <p className="text-muted-foreground mt-1">
            {plan?.trialDays
              ? "Your free trial begins when the platform admin approves your application."
              : "The platform admin verifies your first payment before activating your account."}
          </p>
        </div>
      </div>
    </aside>
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
  const [success, setSuccess] = useState<SubmissionKind | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const section = useRef<HTMLElement>(null);
  const attempt = useRef<{ requestId: string; payload: string } | null>(null);
  const plans = useOwnerApplicationPlans();
  const form = useForm<PurchaseValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      slug: "",
      ownerName: "",
      ownerEmail: "",
      password: "",
      confirmPassword: "",
      planId: initialPlanId,
      interval: initialInterval,
      includePayment: false,
      paymentReference: "",
      paymentDate: "",
    },
  });
  const planId = useWatch({ control: form.control, name: "planId" });
  const interval = useWatch({ control: form.control, name: "interval" });
  const includePayment = useWatch({ control: form.control, name: "includePayment" });
  const methods = useSubscriptionPaymentMethods(includePayment);
  const selectedPlan = plans.data?.find((plan) => plan.id === planId);
  const hasPaymentMethods = Object.values(methods.data ?? {}).some(Boolean);
  const plansHref = interval === "yearly" ? "/saas?interval=yearly#plans" : "/saas#plans";

  useEffect(() => {
    if (!success) return;
    section.current?.scrollIntoView({ block: "start" });
    section.current?.focus({ preventScroll: true });
  }, [success]);

  async function submit(values: PurchaseValues) {
    setError("");
    if (!selectedPlan || selectedPlan.id !== values.planId) {
      form.setError("planId", { message: "Choose an available subscription plan" });
      return;
    }
    const payment = values.includePayment ? paymentDetailsSchema.parse(values) : undefined;
    if (payment && !methods.data?.[payment.paymentMethod]) {
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
      ...payment,
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
      form.reset({ ...form.formState.defaultValues, interval: values.interval });
      setSuccess(selectedPlan.trialDays ? "trial" : payment ? "payment" : "application");
    } catch {
      setError("Cannot reach the server. Please try again.");
    }
  }
  const name = form.register("name");
  const { errors, isSubmitting: busy } = form.formState;
  return (
    <section ref={section} id="apply" tabIndex={-1} className="saas-section-space" aria-labelledby="apply-heading">
      {success ? (
        <div className="saas-container max-w-xl">
          <div
            className="bg-card rounded-2xl border p-6 shadow-xs sm:p-8"
          >
            <span className="bg-success/10 text-success inline-flex size-12 items-center justify-center rounded-xl">
              <CheckCircle2 aria-hidden className="size-6" />
            </span>
            <h1 id="apply-heading" className="saas-section mt-5">
              Application submitted
            </h1>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              {success === "trial"
                ? "Your trial application is awaiting review."
                : success === "payment"
                  ? "Keep your transaction reference while the platform admin verifies your payment."
                  : "Your application is awaiting review. Arrange your first payment with the platform admin before activation."}{" "}
              Once your account is active, sign in with the email and password you chose.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="saas-button h-11">
                <Link href="/login">
                  Go to owner login <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" className="saas-button h-11">
                <a href={plansHref}>Back to plans</a>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="saas-container">
          <a
            href={plansHref}
            className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium"
          >
            <ArrowLeft aria-hidden className="size-4" /> Back to plans
          </a>
          <div className="mt-3 max-w-2xl sm:mt-4">
            <h1 id="apply-heading" className="saas-section">Apply for turf owner access</h1>
            <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed">
              {selectedPlan?.trialDays
                ? "Enter your business details to apply for the free trial."
                : "Choose a plan and enter your business details to apply. You can pay after submitting."}
            </p>
          </div>
          <form
            className="mt-6 grid items-start gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,21rem)] lg:grid-rows-[auto_1fr]"
            onSubmit={(event) => void form.handleSubmit(submit)(event)}
            noValidate
          >
            <OwnerApplicationPlans
              plans={plans.data}
              planId={planId}
              interval={interval}
              disabled={busy}
              error={errors.planId?.message}
              loading={plans.isLoading}
              loadError={plans.isError}
              onPlan={(value) => choosePlan(form, value, Boolean(plans.data?.find((plan) => plan.id === value)?.trialDays))}
              onInterval={(value) => form.setValue("interval", value)}
              onRetry={() => plans.refetch()}
            />
            <ApplicationSummary plan={selectedPlan} interval={interval} />
            <div className="min-w-0 space-y-5 sm:space-y-6 lg:col-start-1 lg:row-start-2">
              <section
                className="bg-card space-y-5 rounded-2xl border p-5 shadow-xs sm:p-6"
                aria-labelledby="turf-details"
              >
                <h2 id="turf-details" className="saas-title">
                  Turf business
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="business-name" label="Business name" error={errors.name?.message}>
                    <Input
                      id="business-name"
                      placeholder="Greenfield Arena"
                      autoComplete="organization"
                      disabled={busy}
                      {...name}
                      onChange={(event) => {
                        name.onChange(event);
                        if (!form.getFieldState("slug").isDirty)
                          form.setValue(
                            "slug",
                            event.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/^-|-$/g, "")
                              .slice(0, 50)
                          );
                      }}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "business-name-error" : undefined}
                    />
                  </Field>
                  <Field id="turf-handle" label="Turf handle" error={errors.slug?.message}>
                    <div className="relative">
                      <span
                        aria-hidden
                        className="text-muted-foreground pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm"
                      >
                        /turf/
                      </span>
                      <Input
                        id="turf-handle"
                        className="pl-16"
                        placeholder="greenfield-arena"
                        autoCapitalize="none"
                        disabled={busy}
                        {...form.register("slug")}
                        aria-invalid={!!errors.slug}
                        aria-describedby={
                          errors.slug ? "turf-handle-hint turf-handle-error" : "turf-handle-hint"
                        }
                      />
                    </div>
                    <p id="turf-handle-hint" className="text-muted-foreground text-sm">
                      Used in your booking website address.
                    </p>
                  </Field>
                </div>
              </section>
              <section
                className="bg-card space-y-5 rounded-2xl border p-5 shadow-xs sm:p-6"
                aria-labelledby="owner-details"
              >
                <h2 id="owner-details" className="saas-title">
                  Owner account
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="owner-name" label="Owner name" error={errors.ownerName?.message}>
                    <Input
                      id="owner-name"
                      autoComplete="name"
                      disabled={busy}
                      {...form.register("ownerName")}
                      aria-invalid={!!errors.ownerName}
                      aria-describedby={errors.ownerName ? "owner-name-error" : undefined}
                    />
                  </Field>
                  <Field id="owner-email" label="Email address" error={errors.ownerEmail?.message}>
                    <Input
                      id="owner-email"
                      type="email"
                      autoComplete="email"
                      disabled={busy}
                      {...form.register("ownerEmail")}
                      aria-invalid={!!errors.ownerEmail}
                      aria-describedby={errors.ownerEmail ? "owner-email-error" : undefined}
                    />
                  </Field>
                  <Field id="owner-password" label="Password" error={errors.password?.message}>
                    <div className="relative">
                      <Input
                        id="owner-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="pr-12"
                        disabled={busy}
                        {...form.register("password")}
                        aria-invalid={!!errors.password}
                        aria-describedby={
                          errors.password
                            ? "owner-password-hint owner-password-error"
                            : "owner-password-hint"
                        }
                      />
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-xl"
                        disabled={busy}
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                        aria-controls="owner-password owner-password-confirmation"
                      >
                        {showPassword ? (
                          <EyeOff aria-hidden className="size-4" />
                        ) : (
                          <Eye aria-hidden className="size-4" />
                        )}
                      </button>
                    </div>
                    <p id="owner-password-hint" className="text-muted-foreground text-sm">
                      Use at least 12 characters.
                    </p>
                  </Field>
                  <Field
                    id="owner-password-confirmation"
                    label="Confirm password"
                    error={errors.confirmPassword?.message}
                  >
                    <Input
                      id="owner-password-confirmation"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      disabled={busy}
                      {...form.register("confirmPassword")}
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={
                        errors.confirmPassword ? "owner-password-confirmation-error" : undefined
                      }
                    />
                  </Field>
                </div>
              </section>
              {selectedPlan && !selectedPlan.trialDays && (
                <section
                  className="bg-card space-y-4 rounded-2xl border p-5 shadow-xs sm:p-6"
                  aria-labelledby="payment-heading"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 id="payment-heading" className="saas-title">
                        Payment
                      </h2>
                      <p className="text-muted-foreground mt-1 text-sm">
                        You can submit your application and pay later.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11"
                      aria-expanded={includePayment}
                      aria-controls="application-payment-fields"
                      disabled={busy}
                      onClick={() => {
                        form.setValue("includePayment", !includePayment);
                        if (includePayment)
                          form.clearErrors(["paymentMethod", "paymentReference", "paymentDate"]);
                      }}
                    >
                      {includePayment ? "Pay later" : "Add payment details"}
                    </Button>
                  </div>
                  <div id="application-payment-fields" hidden={!includePayment}>
                    {includePayment && (
                      <OwnerApplicationPayment
                        form={form}
                        plan={selectedPlan}
                        interval={interval}
                        methods={methods}
                      />
                    )}
                  </div>
                </section>
              )}
              {error && (
                <p
                  role="alert"
                  className="bg-destructive/10 text-destructive border-destructive/20 rounded-xl border p-4 text-sm"
                >
                  {error}
                </p>
              )}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="saas-button min-h-12 w-full px-6 sm:w-auto"
                  disabled={
                    busy ||
                    plans.isError ||
                    !selectedPlan ||
                    (includePayment && (methods.isError || !hasPaymentMethods))
                  }
                >
                  {busy ? (
                    <Loader2 aria-hidden className="motion-safe:animate-spin" />
                  ) : (
                    <ArrowRight aria-hidden />
                  )}
                  {busy ? "Submitting…" : "Submit application"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function choosePlan({ clearErrors, setValue }: Pick<UseFormReturn<PurchaseValues>, "clearErrors" | "setValue">, planId: string, trial: boolean) {
  if (trial) {
    setValue("includePayment", false);
    clearErrors(["paymentMethod", "paymentReference", "paymentDate"]);
  }
  setValue("planId", planId, { shouldValidate: true });
}
