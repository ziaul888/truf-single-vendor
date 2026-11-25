import { z } from "zod";

// Mirrors turf-api's TrxIdSchema (bookings.schemas.ts): trimmed, uppercased, 6–20 letters and digits.
const TRX_ID = /^[A-Z0-9]{6,20}$/;
const TRX_ID_MESSAGE = "Enter the TrxID: 6 to 20 letters and digits";

/** A bKash / Nagad transaction id the customer must give at checkout. */
export const TrxIdSchema = z.string().trim().toUpperCase().regex(TRX_ID, TRX_ID_MESSAGE);

/** Staff forms: the TrxID is optional; "" means none. */
export const OptionalTrxIdSchema = z.string().trim().toUpperCase().refine((v) => v === "" || TRX_ID.test(v), TRX_ID_MESSAGE);
