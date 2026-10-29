import { z } from "zod";
import { timeToHour, toMinorUnits } from "@/lib/ground-format";
import {
  AMENITIES, AVAILABLE_DAYS, FORMATS, SPORTS, SURFACES, WEEKDAYS,
  type GroundWriteInput, type PeakRange,
} from "@/types/ground";

const wholeHour = (label: string, isClosing = false) =>
  z
    .string()
    .min(1, `${label} required`)
    .refine((v) => timeToHour(v, { isClosing }) !== null, "Use a whole hour, e.g. 06:00");

export const PeakRangeSchema = z.object({ from: z.string(), to: z.string() });

/** Empty number inputs mean "not set". */
const optionalNumber = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), schema.optional());

/** Optional select: "" or "none" means "not set". */
const optionalChoice = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((v) => (v === "" || v === "none" ? undefined : v), z.enum(values).optional());

/** Peak ranges the admin actually filled in (both ends), converted to whole hours. */
export function filledPeakRanges(ranges: { from: string; to: string }[] | undefined): PeakRange[] {
  return (ranges ?? [])
    .filter((r) => r.from && r.to)
    .map((r) => ({ fromHour: timeToHour(r.from) ?? -1, toHour: timeToHour(r.to, { isClosing: true }) ?? -1 }));
}

export const AddGroundSchema = z
  .object({
    // ── Saved to turf-api ──
    name: z.string().trim().min(1, "Ground name is required").max(100),
    /** Sent to the API as `sport`. */
    type: z.enum(SPORTS, "Pick a sport"),
    capacity: optionalNumber(
      z.number("Capacity must be a number").int("Whole number of players").min(1, "Capacity must be at least 1").max(1000, "At most 1000 players"),
    ),
    /** Ground size, e.g. 7x7. */
    format: optionalChoice(FORMATS),
    surface: optionalChoice(SURFACES),
    dimensions: z.string().trim().max(50, "At most 50 characters").optional(),
    description: z.string().max(2000).optional(),
    address: z.string().trim().max(300, "At most 300 characters").optional(),
    openingTime: wholeHour("Opening time"),
    closingTime: wholeHour("Closing time", true),
    /** v1 has one fixed hourly price; the off-peak input supplies it. */
    offPeakPrice: z.coerce.number().positive("Price required").max(100_000, "Price is too high"),
    isActive: z.boolean(),
    availableDays: z.enum(AVAILABLE_DAYS),
    customDays: z.array(z.enum(WEEKDAYS)),
    amenities: z.array(z.enum(AMENITIES)).max(10),
    showOnPortal: z.boolean(),
    internalNotes: z.string().max(2000).optional(),

    slotDuration: z.enum(["60", "120"] as const),
    /** Peak pricing is optional; when the price is set, hourly price above is the off-peak price. */
    peakPrice: optionalNumber(z.number("Peak price must be a number").positive("Peak price must be above 0").max(100_000, "Price is too high")),
    peakRanges: z.array(PeakRangeSchema).max(6, "At most 6 peak ranges"),
  })
  .refine(
    (v) => {
      const open = timeToHour(v.openingTime);
      const close = timeToHour(v.closingTime, { isClosing: true });
      return open === null || close === null || open < close;
    },
    { path: ["closingTime"], message: "Closing time must be after opening time" },
  )
  .refine((v) => v.availableDays !== "custom" || v.customDays.length > 0, {
    path: ["customDays"],
    message: "Pick at least one day",
  })
  .superRefine((v, ctx) => {
    const ranges = filledPeakRanges(v.peakRanges);
    const issue = (message: string) => ctx.addIssue({ code: "custom", path: ["peakPrice"], message });
    if (v.peakPrice === undefined && ranges.length === 0) return;
    if (v.peakPrice === undefined) return issue("Enter a peak price, or clear the peak time ranges");
    if (ranges.length === 0) return issue("Add at least one peak time range");
    const open = timeToHour(v.openingTime);
    const close = timeToHour(v.closingTime, { isClosing: true });
    if (ranges.some((r) => r.fromHour < 0 || r.toHour < 0)) return issue("Peak ranges must use whole hours");
    if (ranges.some((r) => r.fromHour >= r.toHour)) return issue("Each peak range must end after it starts");
    if (open !== null && close !== null && ranges.some((r) => r.fromHour < open || r.toHour > close)) {
      return issue("Peak ranges must be within opening hours");
    }
    const sorted = [...ranges].sort((a, b) => a.fromHour - b.fromHour);
    if (sorted.some((r, i) => i > 0 && r.fromHour < sorted[i - 1].toHour)) issue("Peak ranges must not overlap");
  });

export type AddGroundFormData = z.infer<typeof AddGroundSchema>;

/** The form values turf-api stores. Only call with values that passed AddGroundSchema. */
export function toGroundWriteInput(data: AddGroundFormData): GroundWriteInput {
  return {
    name: data.name.trim(),
    sport: data.type,
    capacity: data.capacity ?? null,
    format: data.format ?? null,
    surface: data.surface ?? null,
    dimensions: data.dimensions?.trim() || null,
    description: data.description?.trim() || null,
    address: data.address?.trim() || null,
    hourlyPrice: toMinorUnits(data.offPeakPrice),
    openingHour: timeToHour(data.openingTime)!,
    closingHour: timeToHour(data.closingTime, { isClosing: true })!,
    isActive: data.isActive,
    amenities: data.amenities,
    availableDays: data.availableDays,
    // The API ignores customDays unless availableDays is "custom".
    customDays: data.availableDays === "custom" ? data.customDays : [],
    showOnPortal: data.showOnPortal,
    internalNotes: data.internalNotes?.trim() || null,
    slotDurationMinutes: data.slotDuration === "120" ? 120 : 60,
    // Both or neither: null + [] turns peak pricing off.
    peakPrice: data.peakPrice === undefined ? null : toMinorUnits(data.peakPrice),
    peakRanges: data.peakPrice === undefined ? [] : filledPeakRanges(data.peakRanges),
  };
}

/** turf-api field names → the form inputs that hold them, for showing API errors. */
export const GROUND_API_FIELDS: Record<string, keyof AddGroundFormData> = {
  name: "name",
  sport: "type",
  capacity: "capacity",
  format: "format",
  surface: "surface",
  dimensions: "dimensions",
  peakPrice: "peakPrice",
  peakRanges: "peakPrice",
  slotDurationMinutes: "slotDuration",
  description: "description",
  address: "address",
  hourlyPrice: "offPeakPrice",
  openingHour: "openingTime",
  closingHour: "closingTime",
  isActive: "isActive",
  amenities: "amenities",
  availableDays: "availableDays",
  customDays: "customDays",
  showOnPortal: "showOnPortal",
  internalNotes: "internalNotes",
};
