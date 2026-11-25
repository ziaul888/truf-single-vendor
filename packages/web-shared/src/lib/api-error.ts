import { isAxiosError } from "axios";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

/** The `{ success: false, … }` envelope turf-api returns for every error. */
export interface ApiFailure {
  error: string;
  code?: string;
  details?: { field: string; message: string }[];
}

/** Reads turf-api's error envelope from an axios error, with a safe fallback message. */
export function toApiFailure(err: unknown): ApiFailure {
  if (isAxiosError(err) && err.response?.data && typeof err.response.data.error === "string") {
    return err.response.data as ApiFailure;
  }
  if (isAxiosError(err) && !err.response) return { error: "Cannot reach the server. Please try again." };
  return { error: "Something went wrong. Please try again." };
}

/**
 * Puts the API's per-field messages under the matching form fields.
 * `codeFields` maps error codes that aren't validation errors (e.g. EMAIL_TAKEN) to a field.
 * Returns true when at least one message landed on a field.
 */
export function applyApiErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  failure: ApiFailure,
  codeFields: Record<string, Path<T>> = {},
  /** Form fields that can show an error; defaults to the keys of the current values. */
  fields: readonly string[] = Object.keys(form.getValues()),
): boolean {
  const known = new Set(fields);
  const details = (failure.details ?? []).filter((d) => known.has(d.field));
  details.forEach((d) => form.setError(d.field as Path<T>, { message: d.message }));

  const codeField = failure.code ? codeFields[failure.code] : undefined;
  if (codeField) form.setError(codeField, { message: failure.error });

  return details.length > 0 || !!codeField;
}
