# Multi-slot booking rollout

Single-slot portal requests send `startHour` / `startMinute`; single-slot staff requests send `slotId`. These work with the old and new APIs. Both pickers use `GET /api/v1/checkout/options`: a missing `maxSlotsPerBooking`, loading response or failed check allows only one slot. A multi-slot checkout link cannot submit more slots than the advertised limit.

There is no environment flag. Multi-slot booking is an admin setting (Settings → Booking → Allow multiple slots per booking), off by default. A leftover `MULTI_SLOT_BOOKINGS_ENABLED` variable on Render is ignored and can be removed.

1. Deploy the backend. Its Docker startup applies `20261112090000_booking_slots` and the migration that adds the setting columns, default OFF. Both services still refuse bookings with more than one slot, and checkout options report a limit of 1. This frontend can deploy before or after this step.
2. Stop/drain every old API container and its background jobs. Old code cannot safely process multi-slot bookings.
3. In the new backend container, run `yarn db:reconcile:booking-slots`. The repeatable transaction clears stale live indexes first, then inserts rows for bookings created during the overlap. See `../turf-api/prisma/rollouts/booking-slots.sql` and backend `CLAUDE.md`.
4. After the repair succeeds, an admin turns on Settings → Booking → Allow multiple slots per booking and picks the maximum slots per booking (2–4, default 4). Check that checkout options report that `maxSlotsPerBooking`; the frontend refreshes its options within 60 seconds.

To stop new multi-slot bookings, an admin turns the setting off (the chosen maximum is kept). Keep the new backend running to handle existing bookings; do not roll back to code that only understands the primary slot.

Before committing, verify migrations and E2E only on an isolated test database, and ensure Prisma's schema diff leaves `Payment_method_reference_key` unchanged. Frontend request compatibility checks run with `yarn test:booking-requests` (Node.js 22.6+).

Per-slot cancellation and partial refunds remain deferred. Cancellation still applies to the whole booking.
