import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { PhotoError } from "@/lib/ground-photos";
import { GROUND_API_FIELDS, type AddGroundFormData } from "@/schemas/ground";

/** Shows a turf-api ground error under the matching form input, or as a toast. */
export function showGroundApiError(form: UseFormReturn<AddGroundFormData>, err: unknown) {
  if (err instanceof PhotoError) {
    toast.error(`Photo not saved: ${err.failure.error}`);
    return;
  }
  const failure = toApiFailure(err);
  // The API names fields hourlyPrice/openingHour/closingHour; the form uses its own names.
  const details = failure.details?.map((d) => ({ ...d, field: GROUND_API_FIELDS[d.field] ?? d.field }));
  const shown = applyApiErrors(
    form,
    { ...failure, details },
    { INVALID_HOURS: "closingTime", INVALID_DAYS: "customDays", INVALID_PEAK_PRICING: "peakPrice" },
    Object.values(GROUND_API_FIELDS),
  );
  if (!shown) toast.error(failure.error);
}
