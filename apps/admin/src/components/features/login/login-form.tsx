"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CircleAlert, Eye, EyeOff, Loader2, LockKeyhole, Mail, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginSchema, type LoginInput } from "@/validations/login";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { cn } from "@/lib/utils";

const LOCK_MS = 60_000;

interface ApiFailure {
  success: false;
  error: string;
  code?: string;
  details?: { field: string; message: string }[];
}

type LoginResponse =
  | {
      success: true;
      data?: { audience?: string; tenant?: { setupComplete: boolean } };
    }
  | ApiFailure;

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState("");
  const [locked, setLocked] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  // The API enforces the rate limit; this only re-enables the button after it lifts.
  useEffect(() => {
    if (!locked) return;
    const t = setTimeout(() => setLocked(false), LOCK_MS);
    return () => clearTimeout(t);
  }, [locked]);

  function showFailure(json: ApiFailure) {
    const fieldErrors = json.details?.filter((d) => d.field === "email" || d.field === "password");
    fieldErrors?.forEach((d) => form.setError(d.field as keyof LoginInput, { message: d.message }));
    if (!fieldErrors?.length) setServerError(json.error);
    setLocked(json.code === "TOO_MANY_ATTEMPTS");
  }

  async function onSubmit(values: LoginInput) {
    setServerError("");
    try {
      const res = await fetch("/api/v1/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as LoginResponse;
      if (!json.success) return showFailure(json);
      await queryClient.cancelQueries();
      queryClient.clear();
      if (json.data?.audience === "owner" || json.data?.audience === "tenant-staff") {
        const from = searchParams.get("from");
        const dashboard = from === "/admin" || from?.startsWith("/admin/") ? "/admin" : "/dashboard";
        window.location.assign(json.data.tenant?.setupComplete ? dashboard : `${dashboard}/settings/general`);
        return;
      }
      router.push(safeRedirectPath(searchParams.get("from")));
      router.refresh();
    } catch {
      setServerError("Cannot reach the server. Please try again.");
    }
  }

  const disabled = isSubmitting || locked;

  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)} aria-busy={isSubmitting} noValidate>
      <LoginField
        label="Email address"
        icon={Mail}
        type="email"
        autoComplete="username"
        placeholder="name@example.com"
        disabled={disabled}
        error={errors.email?.message}
        registration={form.register("email")}
      />
      <LoginField
        label="Password"
        icon={LockKeyhole}
        type={showPass ? "text" : "password"}
        autoComplete="current-password"
        disabled={disabled}
        error={errors.password?.message}
        registration={form.register("password")}
        trailing={
          <button
            type="button"
            onClick={() => setShowPass((visible) => !visible)}
            aria-label={showPass ? "Hide password" : "Show password"}
            aria-controls="login-password"
            className="no-press text-muted-foreground hover:text-foreground focus-visible:outline-ring absolute inset-y-0 right-0 grid w-12 place-items-center rounded-xl focus-visible:outline-2 focus-visible:-outline-offset-4"
          >
            {showPass ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
          </button>
        }
      />

      {serverError && (
        <div
          role="alert"
          className="border-destructive/35 bg-destructive/10 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm text-[color:var(--login-error)] [overflow-wrap:anywhere]"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <SubmitButton loading={isSubmitting} locked={locked} />
    </form>
  );
}

interface LoginFieldProps {
  label: string;
  icon: LucideIcon;
  type: string;
  autoComplete: string;
  placeholder?: string;
  disabled: boolean;
  error?: string;
  registration: UseFormRegisterReturn;
  trailing?: React.ReactNode;
}

function LoginField({ label, icon: Icon, error, registration, trailing, ...input }: LoginFieldProps) {
  const id = `login-${registration.name}`;
  return (
    <div className="grid min-w-0 gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
        />
        <Input
          id={id}
          {...input}
          {...registration}
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "bg-background/75 border-input/90 h-12 pl-11 placeholder:text-muted-foreground/85 md:text-base",
            trailing && "pr-12",
          )}
        />
        {trailing}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-[color:var(--login-error)] [overflow-wrap:anywhere]">
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton({ loading, locked }: { loading: boolean; locked: boolean }) {
  const Icon = loading ? Loader2 : locked ? LockKeyhole : ArrowRight;
  return (
    <Button
      type="submit"
      disabled={loading || locked}
      className="h-12 w-full rounded-xl text-sm font-semibold disabled:opacity-65"
    >
      {loading ? "Signing in…" : locked ? "Try again in a minute" : "Sign in"}
      <Icon aria-hidden className={loading ? "motion-safe:animate-spin" : undefined} />
    </Button>
  );
}
