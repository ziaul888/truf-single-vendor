import { z } from "zod";

export const PeakRangeSchema = z.object({
  from: z.string().min(1, "Required"),
  to: z.string().min(1, "Required"),
});

export const AddGroundSchema = z.object({
  name: z.string().min(2, "Ground name is required"),
  type: z.enum(["football", "cricket", "badminton", "tennis", "hockey", "basketball", "other"] as const),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  description: z.string().optional(),

  openingTime: z.string().min(1, "Opening time required"),
  closingTime: z.string().min(1, "Closing time required"),
  availableDays: z.enum(["everyday", "weekdays", "weekends", "custom"] as const),
  customDays: z.array(z.string()).optional(),
  slotDuration: z.enum(["60", "120"] as const),

  peakPrice: z.coerce.number().min(1, "Peak price required"),
  peakRanges: z.array(PeakRangeSchema).min(1, "Add at least one peak time range"),
  offPeakPrice: z.coerce.number().min(1, "Off-peak price required"),

  amenities: z.array(z.string()),

  isActive: z.boolean(),
  showOnPortal: z.boolean(),
  internalNotes: z.string().optional(),
});

export type AddGroundFormData = z.infer<typeof AddGroundSchema>;
