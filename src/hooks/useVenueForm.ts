import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useUpdateVenue } from "@/hooks/useSettings";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import type { VenueProfile } from "@/types/settings";
import { fromVenueForm, toVenueForm, VenueSchema, type VenueForm } from "@/validations/venue";

/** The General page's venue form: loads the profile, saves the editable fields, maps API errors onto inputs. */
export function useVenueForm(venue: VenueProfile | undefined) {
  const save = useUpdateVenue();
  const form = useForm<VenueForm>({ resolver: zodResolver(VenueSchema) });

  useEffect(() => {
    // A logo upload refreshes the venue too; keep whatever the user is still typing.
    if (venue) form.reset(toVenueForm(venue), { keepDirtyValues: true });
  }, [venue, form]);

  async function onSubmit(values: VenueForm) {
    try {
      const saved = await save.mutateAsync(fromVenueForm(values));
      form.reset(toVenueForm(saved));
      toast.success("Venue details saved");
    } catch (err) {
      const failure = toApiFailure(err);
      if (!applyApiErrors(form, failure)) toast.error(failure.error);
    }
  }

  const discard = () => venue && form.reset(toVenueForm(venue));

  return { form, submit: form.handleSubmit(onSubmit), discard, saving: save.isPending };
}
