"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, SettingsSection } from "@/components/features/website-settings/form-primitives";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { useChangePassword } from "@/hooks/useUsers";
import { ChangePasswordSchema, type ChangePasswordInput } from "@/validations/auth";

const EMPTY: ChangePasswordInput = { currentPassword: "", newPassword: "", confirmPassword: "" };

/** Self-service password change for any signed-in admin or manager. */
export function ChangePasswordForm() {
  const change = useChangePassword();
  const form = useForm<ChangePasswordInput>({ resolver: zodResolver(ChangePasswordSchema), defaultValues: EMPTY });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit({ currentPassword, newPassword }: ChangePasswordInput) {
    try {
      await change.mutateAsync({ currentPassword, newPassword });
      form.reset(EMPTY);
      toast.success("Password changed. Your other devices have been signed out.");
    } catch (err) {
      const failure = toApiFailure(err);
      // WRONG_PASSWORD is a 400, so the global 401 redirect doesn't fire.
      if (!applyApiErrors(form, failure, { WRONG_PASSWORD: "currentPassword" })) toast.error(failure.error);
    }
  }

  return (
    <SettingsSection
      title="Change password"
      description="Changing it signs you out on every other device."
      icon={KeyRound}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField id="cp-current" label="Current password" error={errors.currentPassword?.message}>
          <Input id="cp-current" type="password" autoComplete="current-password" {...form.register("currentPassword")} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="cp-new" label="New password" hint="At least 12 characters." error={errors.newPassword?.message}>
            <Input id="cp-new" type="password" autoComplete="new-password" {...form.register("newPassword")} />
          </FormField>
          <FormField id="cp-confirm" label="Confirm new password" error={errors.confirmPassword?.message}>
            <Input id="cp-confirm" type="password" autoComplete="new-password" {...form.register("confirmPassword")} />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="gap-1.5">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Update password
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
