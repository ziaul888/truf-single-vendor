"use client";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NewPasswordSchema } from "@/validations/auth";
import { ownerApi } from "@/lib/owner-api";
import { toApiFailure } from "@/lib/api-error";
import type { ApiSuccess } from "@/types/api";
import type { OwnerActivationPreview } from "@/types/owner";
import { BillingError } from "../platform/billing-parts";
const schema = z
  .object({ password: NewPasswordSchema, confirm: z.string() })
  .refine((value) => value.password === value.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });
type Values = z.infer<typeof schema>;
const subscribe = (listener: () => void) => {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
};
const snapshot = () => window.location.hash;
const serverSnapshot = () => "";
export function OwnerActivation() {
  const fragment = useSyncExternalStore(subscribe, snapshot, serverSnapshot),
    token = new URLSearchParams(fragment.slice(1)).get("token") ?? "";
  const [checked, setChecked] = useState<{
      token: string;
      data?: OwnerActivationPreview;
      error?: string;
    } | null>(null),
    [error, setError] = useState(""),
    [success, setSuccess] = useState<{ email: string } | null>(null);
  const preview = checked?.token === token ? checked.data : undefined;
  const previewError = checked?.token === token ? checked.error : undefined;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    ownerApi
      .post<ApiSuccess<OwnerActivationPreview>>(
        "/activation/preview",
        { token },
        { signal: controller.signal }
      )
      .then((response) => setChecked({ token, data: response.data.data }))
      .catch((err) => {
        if (!controller.signal.aborted) setChecked({ token, error: toApiFailure(err).error });
      });
    return () => controller.abort();
  }, [token]);
  async function submit(values: Values) {
    setError("");
    try {
      const response = await ownerApi.post<ApiSuccess<{ email: string }>>("/activation/accept", {
        token,
        password: values.password,
      });
      setSuccess(response.data.data);
      window.history.replaceState(null, "", window.location.pathname);
      form.reset();
    } catch (err) {
      setError(toApiFailure(err).error);
    }
  }
  if (success)
    return (
      <div className="space-y-5 text-center">
        <CheckCircle2 className="text-primary mx-auto h-12 w-12" />
        <h1 className="text-2xl font-bold">Your owner account is active</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Sign in with {success.email} and the password you just chose to view your turf account and
          billing.
        </p>
        <Button asChild className="h-11 w-full">
          <Link href="/owner/login">Sign in</Link>
        </Button>
      </div>
    );
  return (
    <div className="space-y-6">
      <KeyRound className="text-primary h-10 w-10" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activate your owner account</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Choose a password to sign in to your turf account.
        </p>
      </div>
      {preview ? (
        <>
          <div className="bg-muted rounded-xl p-4 text-sm">
            <p className="font-semibold break-words">{preview.turfName}</p>
            <p className="text-muted-foreground mt-2 break-words">{preview.ownerName}</p>
            <p className="text-muted-foreground mt-1 break-all">{preview.email}</p>
          </div>
          <form onSubmit={form.handleSubmit(submit)} noValidate className="space-y-5">
            {(
              [
                { key: "password", label: "New password", autoComplete: "new-password" },
                { key: "confirm", label: "Confirm password", autoComplete: "new-password" },
              ] as const
            ).map(({ key, label, autoComplete }) => (
              <div className="space-y-2" key={key}>
                <Label htmlFor={`owner-${key}`}>{label}</Label>
                <Input
                  id={`owner-${key}`}
                  type="password"
                  autoComplete={autoComplete}
                  disabled={form.formState.isSubmitting}
                  {...form.register(key)}
                  aria-invalid={!!form.formState.errors[key]}
                />
                {form.formState.errors[key] && (
                  <p className="text-destructive text-xs">{form.formState.errors[key]?.message}</p>
                )}
              </div>
            ))}
            <p className="text-muted-foreground text-xs">Use at least 12 characters.</p>
            <BillingError message={error} />
            <Button type="submit" className="h-11 w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Activating…" : "Activate account"}
            </Button>
          </form>
        </>
      ) : previewError ? (
        <>
          <BillingError message={previewError} />
          <Button variant="outline" asChild className="h-11 w-full">
            <Link href="/owner/login">Go to sign in</Link>
          </Button>
        </>
      ) : (
        <p role="status" className="text-muted-foreground text-sm">
          {token
            ? "Checking your activation link…"
            : "Open the full activation link shared by your platform administrator."}
        </p>
      )}
    </div>
  );
}
