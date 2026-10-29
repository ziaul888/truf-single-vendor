"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/features/website-settings/form-primitives";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { useResetUserPassword, type StaffUser } from "@/hooks/useUsers";
import { ResetPasswordSchema, type ResetPasswordInput } from "@/validations/user";

/** Admin sets a new password for someone who forgot theirs (no email reset in v1). */
export function ResetPasswordDialog({ user, onClose }: { user: StaffUser | null; onClose: () => void }) {
  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" /> Reset password
          </DialogTitle>
          <DialogDescription>
            {user?.name} will be signed out everywhere. Tell them the new password yourself.
          </DialogDescription>
        </DialogHeader>
        {user && <ResetPasswordForm user={user} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordForm({ user, onDone }: { user: StaffUser; onDone: () => void }) {
  const reset = useResetUserPassword();
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(body: ResetPasswordInput) {
    try {
      await reset.mutateAsync({ id: user.id, body });
      toast.success(`Password reset for ${user.name}`);
      onDone();
    } catch (err) {
      const failure = toApiFailure(err);
      if (!applyApiErrors(form, failure)) toast.error(failure.error);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField id="reset-password" label="New password" hint="At least 12 characters." error={errors.password?.message}>
        <Input id="reset-password" type="password" autoComplete="new-password" {...form.register("password")} />
      </FormField>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="gap-1.5">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Reset password
        </Button>
      </DialogFooter>
    </form>
  );
}
