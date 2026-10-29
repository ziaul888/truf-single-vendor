"use client";

import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FormField } from "@/components/features/website-settings/form-primitives";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { useCreateUser, useUpdateUser, type StaffUser } from "@/hooks/useUsers";
import {
  CreateUserSchema,
  UpdateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/validations/user";
import { ROLE_META } from "./role-meta";

interface UserFormSheetProps {
  open: boolean;
  /** null = create a new user; otherwise edit this one. */
  user: StaffUser | null;
  /** The signed-in admin's id — their own role and active status can't be changed. */
  currentUserId?: string;
  onClose: () => void;
}

export function UserFormSheet({ open, user, currentUserId, onClose }: UserFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>{user ? "Edit Staff Member" : "Add Staff Member"}</SheetTitle>
          <SheetDescription>
            {user ? `Editing ${user.name}` : "They sign in with this email and password."}
          </SheetDescription>
        </SheetHeader>
        {open &&
          (user ? (
            <EditUserForm user={user} isSelf={user.id === currentUserId} onDone={onClose} />
          ) : (
            <CreateUserForm onDone={onClose} />
          ))}
      </SheetContent>
    </Sheet>
  );
}

function CreateUserForm({ onDone }: { onDone: () => void }) {
  const create = useCreateUser();
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: { name: "", email: "", role: "manager", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: CreateUserInput) {
    try {
      const created = await create.mutateAsync(values);
      toast.success(`${created.name} can now sign in`);
      onDone();
    } catch (err) {
      const failure = toApiFailure(err);
      if (!applyApiErrors(form, failure, { EMAIL_TAKEN: "email" })) toast.error(failure.error);
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="contents">
        <SheetBody className="space-y-4">
          <IdentityFields />
          <FormField
            id="u-password"
            label="Password"
            hint="At least 12 characters. Share it with them securely."
            error={errors.password?.message}
          >
            <Input
              id="u-password"
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
          </FormField>
        </SheetBody>
        <FormFooter onCancel={onDone} submitting={isSubmitting} label="Add Staff" />
      </form>
    </FormProvider>
  );
}

function EditUserForm({
  user,
  isSelf,
  onDone,
}: {
  user: StaffUser;
  isSelf: boolean;
  onDone: () => void;
}) {
  const update = useUpdateUser();
  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: { name: user.name, email: user.email, role: user.role, isActive: user.isActive },
  });
  const { errors, isSubmitting, dirtyFields } = form.formState;

  async function onSubmit(values: UpdateUserInput) {
    const changes = Object.fromEntries(
      Object.keys(dirtyFields).map((k) => [k, values[k as keyof UpdateUserInput]])
    ) as Partial<UpdateUserInput>;
    if (Object.keys(changes).length === 0) return onDone();
    try {
      await update.mutateAsync({ id: user.id, changes });
      toast.success("Changes saved");
      onDone();
    } catch (err) {
      const failure = toApiFailure(err);
      if (!applyApiErrors(form, failure, { EMAIL_TAKEN: "email" })) toast.error(failure.error);
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="contents">
        <SheetBody className="space-y-4">
          <IdentityFields roleLocked={isSelf} />
          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <div className="border-border bg-muted/40 flex items-center gap-3 rounded-xl border px-4 py-3">
                <Switch
                  id="u-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSelf}
                />
                <Label htmlFor="u-active" className="text-sm">
                  {field.value ? (
                    <span className="text-success font-medium">Active</span>
                  ) : (
                    <span className="text-muted-foreground">Inactive — can&apos;t sign in</span>
                  )}
                </Label>
              </div>
            )}
          />
          {isSelf && (
            <p className="text-muted-foreground text-[11px]">
              You can&apos;t change your own role or deactivate yourself.
            </p>
          )}
        </SheetBody>
        <FormFooter onCancel={onDone} submitting={isSubmitting} label="Save Changes" />
      </form>
    </FormProvider>
  );
}

type IdentityValues = Pick<CreateUserInput, "name" | "email" | "role">;

/** Name, email and role — shared by the create and edit forms (via FormProvider). */
function IdentityFields({ roleLocked = false }: { roleLocked?: boolean }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<IdentityValues>();
  return (
    <>
      <FormField id="u-name" label="Full name" error={errors.name?.message}>
        <Input id="u-name" placeholder="e.g. Tanvir Ahmed" {...register("name")} />
      </FormField>
      <FormField id="u-email" label="Email" error={errors.email?.message}>
        <Input
          id="u-email"
          type="email"
          autoComplete="off"
          placeholder="name@example.com"
          {...register("email")}
        />
      </FormField>
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <FormField
            id="u-role"
            label="Role"
            hint={ROLE_META[field.value].summary}
            error={errors.role?.message}
          >
            <Select value={field.value} onValueChange={field.onChange} disabled={roleLocked}>
              <SelectTrigger id="u-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        )}
      />
    </>
  );
}

function FormFooter({
  onCancel,
  submitting,
  label,
}: {
  onCancel: () => void;
  submitting: boolean;
  label: string;
}) {
  return (
    <SheetFooter>
      <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" className="w-full gap-1.5" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />} {label}
      </Button>
    </SheetFooter>
  );
}
