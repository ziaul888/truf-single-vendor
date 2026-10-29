"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@/validations/auth";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { LOGIN_COLORS as C } from "./login-theme";

const LOCK_MS = 60_000;

interface ApiFailure {
  success: false;
  error: string;
  code?: string;
  details?: { field: string; message: string }[];
}

type LoginResponse = { success: true } | ApiFailure;

export function LoginForm() {
  const router = useRouter();
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
      router.push(safeRedirectPath(searchParams.get("from")));
      router.refresh();
    } catch {
      setServerError("Cannot reach the server. Please try again.");
    }
  }

  const disabled = isSubmitting || locked;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <LoginField
        label="Email Address"
        icon="✉"
        type="email"
        autoComplete="username"
        placeholder="your@email.com"
        disabled={disabled}
        error={errors.email?.message}
        registration={form.register("email")}
      />
      <LoginField
        label="Password"
        icon="🔒"
        type={showPass ? "text" : "password"}
        autoComplete="current-password"
        placeholder="••••••••"
        disabled={disabled}
        error={errors.password?.message}
        registration={form.register("password")}
        trailing={
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            aria-label={showPass ? "Hide password" : "Show password"}
            style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: C.faint, fontSize: 14,
            }}
          >
            {showPass ? "🙈" : "👁"}
          </button>
        }
      />

      {serverError && (
        <div
          role="alert"
          style={{
            background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.3)",
            borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            fontSize: 12, color: C.danger, animation: "slideUp 0.3s ease",
          }}
        >
          ⚠ {serverError}
        </div>
      )}

      <SubmitButton loading={isSubmitting} locked={locked} />
    </form>
  );
}

interface LoginFieldProps {
  label: string;
  icon: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  disabled: boolean;
  error?: string;
  registration: UseFormRegisterReturn;
  trailing?: React.ReactNode;
}

function LoginField({ label, icon, error, registration, trailing, ...input }: LoginFieldProps) {
  const id = `login-${registration.name}`;
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 11, letterSpacing: 2, color: C.muted,
          textTransform: "uppercase", display: "block", marginBottom: 8,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <span
          aria-hidden
          style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)", color: C.faint, fontSize: 15,
          }}
        >
          {icon}
        </span>
        <input
          id={id}
          {...input}
          {...registration}
          aria-invalid={!!error}
          className="login-input"
          style={{
            width: "100%",
            padding: `12px ${trailing ? 44 : 14}px 12px 38px`,
            background: C.inputBg,
            border: `1.5px solid ${error ? C.danger : C.border}`,
            borderRadius: 8,
            color: C.text,
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            transition: "border-color 0.2s ease",
            opacity: input.disabled ? 0.5 : 1,
            boxSizing: "border-box",
          }}
        />
        {trailing}
      </div>
      {error && <p style={{ marginTop: 6, fontSize: 11, color: C.danger }}>{error}</p>}
    </div>
  );
}

function SubmitButton({ loading, locked }: { loading: boolean; locked: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || locked}
      style={{
        width: "100%",
        padding: "14px",
        background: loading ? "transparent" : `linear-gradient(135deg, ${C.accent}, ${C.accent}cc)`,
        border: loading ? `1.5px solid ${C.accent}` : "none",
        borderRadius: 8,
        color: loading ? C.accent : "#060d09",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        cursor: loading || locked ? "not-allowed" : "pointer",
        fontFamily: "'DM Sans', sans-serif",
        opacity: locked ? 0.5 : 1,
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      {loading ? (
        <>
          <span
            aria-hidden
            style={{
              width: 16, height: 16, borderRadius: "50%",
              border: `2px solid ${C.accent}`, borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
            }}
          />
          Signing in…
        </>
      ) : locked ? "🔒 Try again in a minute" : "Sign In"}
    </button>
  );
}
