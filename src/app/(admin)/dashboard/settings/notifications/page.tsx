"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/useMe";
import { useNotificationSettings, useUpdateNotifications } from "@/hooks/useSettings";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { SettingsPageHeader } from "@/components/features/settings/settings-page-header";
import { ReadOnlyNotice } from "@/components/features/settings/read-only-notice";
import { EmailSenderSection } from "@/components/features/settings/notifications/email-sender-section";
import { CustomerEmailsSection } from "@/components/features/settings/notifications/customer-emails-section";
import { StaffEmailsSection } from "@/components/features/settings/notifications/staff-emails-section";
import { TestEmailBox } from "@/components/features/settings/notifications/test-email-box";
import { EmailLogTable } from "@/components/features/settings/notifications/email-log-table";
import {
  NOTIFICATION_ERROR_FIELDS, NotificationsSchema, toNotificationsForm, toNotificationsInput, type NotificationsForm,
} from "@/validations/notifications";

const TITLE = "Notifications";
const DESCRIPTION = "Who gets which emails, and how they're sent";

export default function NotificationsSettingsPage() {
  const { data: settings, isLoading, isError, refetch } = useNotificationSettings();
  const save = useUpdateNotifications();
  const { data: me } = useMe();
  const canEdit = me?.role === "admin";

  const form = useForm<NotificationsForm>({
    resolver: zodResolver(NotificationsSchema) as Resolver<NotificationsForm>,
  });
  const { isDirty } = form.formState;

  useEffect(() => {
    if (settings) form.reset(toNotificationsForm(settings));
  }, [settings, form]);

  async function onSubmit(values: NotificationsForm) {
    if (!settings) return;
    const input = toNotificationsInput(values, toNotificationsForm(settings));
    if (Object.keys(input).length === 0) return form.reset(toNotificationsForm(settings));
    try {
      const saved = await save.mutateAsync(input);
      form.reset(toNotificationsForm(saved));
      toast.success("Notification settings saved");
    } catch (err) {
      const failure = toApiFailure(err);
      if (!applyApiErrors(form, failure, {}, NOTIFICATION_ERROR_FIELDS)) toast.error(failure.error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="space-y-5">
        <SettingsPageHeader title={TITLE} description={DESCRIPTION} />
        <div className="flex flex-col items-center gap-3 rounded-lg border py-12 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load the notification settings.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <SettingsPageHeader title={TITLE} description={DESCRIPTION} audit={settings}>
          {canEdit && (
            <>
              <Button type="button" variant="outline" size="sm" disabled={!isDirty || save.isPending} onClick={() => form.reset(toNotificationsForm(settings))}>
                <Undo2 className="mr-1.5 h-4 w-4" /> Discard
              </Button>
              <Button type="submit" size="sm" disabled={!isDirty || save.isPending}>
                {save.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                {save.isPending ? "Saving…" : "Save changes"}
              </Button>
            </>
          )}
        </SettingsPageHeader>

        {me && !canEdit && <ReadOnlyNotice />}

        <fieldset disabled={!canEdit} className="space-y-5">
          <EmailSenderSection form={form} email={settings.email} />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <CustomerEmailsSection form={form} />
            <StaffEmailsSection form={form} />
          </div>
        </fieldset>
      </form>

      <TestEmailBox />
      <EmailLogTable />
    </div>
  );
}
