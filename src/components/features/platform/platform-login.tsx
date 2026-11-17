"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { Layers3, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { LoginSchema, type LoginInput } from "@/validations/auth";
import { platformApi } from "@/lib/platform-api";
import { platformRedirectPath } from "@/lib/platform-redirect";
import { toApiFailure, applyApiErrors } from "@/lib/api-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const SignInResponse = z.object({
  success: z.literal(true),
  data: z.object({ role: z.literal("platform_admin") }),
});

export function PlatformLogin() {
  const router = useRouter(),
    params = useSearchParams(),
    queryClient = useQueryClient();
  const [error, setError] = useState(""),
    [visible, setVisible] = useState(false),
    [locked, setLocked] = useState(false);
  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });
  useEffect(() => {
    if (!locked) return;
    const timer = setTimeout(() => setLocked(false), 60_000);
    return () => clearTimeout(timer);
  }, [locked]);
  async function submit(values: LoginInput) {
    setError("");
    try {
      const response = await platformApi.post("/auth/login", values);
      if (!SignInResponse.safeParse(response.data).success) {
        setError("Platform sign-in is temporarily unavailable. Please try again.");
        return;
      }
      await queryClient.cancelQueries();
      queryClient.clear();
      router.push(platformRedirectPath(params.get("from")));
      router.refresh();
    } catch (err) {
      const failure = toApiFailure(err);
      if (!applyApiErrors(form, failure))
        setError(
          isAxiosError(err) && err.response?.status === 404
            ? "Platform sign-in is being set up. Please try again later."
            : failure.error
        );
      setLocked(failure.code === "TOO_MANY_ATTEMPTS");
    }
  }
  const disabled = form.formState.isSubmitting || locked;
  return (
    <div className="bg-background min-h-dvh px-4 py-8 sm:py-14">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div className="flex items-center gap-3 font-semibold">
          <span className="bg-primary text-primary-foreground flex h-11 w-11 items-center justify-center rounded-xl">
            <Layers3 className="h-5 w-5" />
          </span>
          SaaS Admin
        </div>
        <div className="[&_button]:h-11 [&_button]:w-11">
          <ThemeToggle />
        </div>
      </div>
      <main className="mx-auto mt-14 w-full max-w-md sm:mt-20">
        <div className="bg-card rounded-3xl border p-6 shadow-sm sm:p-9">
          <span className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-2xl">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <p className="text-primary mt-6 text-xs font-semibold tracking-widest uppercase">
            Platform administration
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Sign in to manage your turf businesses and oversee the platform.
          </p>
          <form className="mt-8 space-y-5" onSubmit={form.handleSubmit(submit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="platform-email">Email address</Label>
              <Input
                id="platform-email"
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                disabled={disabled}
                {...form.register("email")}
                aria-invalid={!!form.formState.errors.email}
              />
              {form.formState.errors.email && (
                <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform-password">Password</Label>
              <div className="relative">
                <Input
                  id="platform-password"
                  type={visible ? "text" : "password"}
                  className="pr-12"
                  autoComplete="current-password"
                  disabled={disabled}
                  {...form.register("password")}
                  aria-invalid={!!form.formState.errors.password}
                />
                <button
                  type="button"
                  aria-label={visible ? "Hide password" : "Show password"}
                  className="text-muted-foreground focus-visible:ring-ring absolute top-0 right-0 flex h-11 w-11 items-center justify-center rounded-xl focus-visible:ring-2"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
              )}
            </div>
            {error && (
              <p
                role="alert"
                className="bg-destructive/10 text-destructive border-destructive/20 rounded-xl border p-3 text-sm leading-relaxed"
              >
                {error}
              </p>
            )}
            <Button type="submit" className="h-12 w-full rounded-xl" disabled={disabled}>
              {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
              {locked
                ? "Try again in a minute"
                : form.formState.isSubmitting
                  ? "Signing in…"
                  : "Sign in to platform"}
            </Button>
          </form>
        </div>
        <p className="text-muted-foreground mt-6 text-center text-xs leading-relaxed">
          Access is limited to platform administrators.
        </p>
      </main>
    </div>
  );
}
