"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BillingError } from "../platform/billing-parts";
export function OwnerLogin() {
  const cache = useQueryClient(),
    [error, setError] = useState("");
  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });
  async function submit(values: LoginInput) {
    setError("");
    try {
      const response = await fetch("/api/v1/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setError(typeof json.error === "string" ? json.error : "Sign in failed. Please try again.");
        return;
      }
      await cache.cancelQueries();
      cache.clear();
      window.location.assign("/dashboard");
    } catch {
      setError("Cannot reach the server. Please try again.");
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Turf owner sign in</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Use your activated owner account to view your turf and subscription.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(submit)} noValidate className="space-y-5">
        {(
          [
            { key: "email", label: "Email", type: "email", autoComplete: "username" },
            {
              key: "password",
              label: "Password",
              type: "password",
              autoComplete: "current-password",
            },
          ] as const
        ).map(({ key, label, type, autoComplete }) => (
          <div className="space-y-2" key={key}>
            <Label htmlFor={`owner-login-${key}`}>{label}</Label>
            <Input
              id={`owner-login-${key}`}
              type={type}
              autoComplete={autoComplete}
              {...form.register(key)}
              disabled={form.formState.isSubmitting}
              aria-invalid={!!form.formState.errors[key]}
            />
            {form.formState.errors[key] && (
              <p className="text-destructive text-xs">{form.formState.errors[key]?.message}</p>
            )}
          </div>
        ))}
        <BillingError message={error} />
        <Button type="submit" className="h-11 w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="text-muted-foreground text-xs leading-relaxed">
        If you have not activated your account, ask your platform administrator for an activation
        link.
      </p>
    </div>
  );
}
