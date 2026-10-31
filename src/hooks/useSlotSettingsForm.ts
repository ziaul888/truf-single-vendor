import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useUpdateSlotSettings } from "@/hooks/useSlots";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import type { SlotSettings } from "@/types/slot";
import {
  SlotSettingsSchema, fromSlotSettingsForm, toSlotSettingsForm, type SlotSettingsForm, type SlotSettingsInput,
} from "@/validations/slot-settings";

/**
 * The venue-wide slot settings form, shared by Slots → Settings and Settings → Booking.
 * `fields` limits what the PUT sends, so a page never overwrites settings it doesn't show.
 */
export function useSlotSettingsForm(settings: SlotSettings | undefined, fields?: readonly (keyof SlotSettingsInput)[]) {
  const save = useUpdateSlotSettings();
  const form = useForm<SlotSettingsForm>({
    // z.coerce widens the schema's input type; the form's values are always numbers here.
    resolver: zodResolver(SlotSettingsSchema) as Resolver<SlotSettingsForm>,
  });

  useEffect(() => {
    if (settings) form.reset(toSlotSettingsForm(settings));
  }, [settings, form]);

  async function onSubmit(values: SlotSettingsForm) {
    const all = fromSlotSettingsForm(values);
    const body = fields ? Object.fromEntries(fields.map((k) => [k, all[k]])) : all;
    try {
      const saved = await save.mutateAsync(body);
      form.reset(toSlotSettingsForm(saved));
      toast.success("Settings saved");
    } catch (err) {
      const failure = toApiFailure(err);
      if (!applyApiErrors(form, failure)) toast.error(failure.error);
    }
  }

  const discard = () => settings && form.reset(toSlotSettingsForm(settings));

  return { form, submit: form.handleSubmit(onSubmit), discard, saving: save.isPending };
}
