import assert from "node:assert/strict";
import { test } from "node:test";
import { bookingSlotLimit } from "../../../packages/web-shared/src/lib/booking-limits.ts";
import { checkoutSlotRequest, staffSlotRequest } from "../../../packages/web-shared/src/lib/booking-requests.ts";

test("old, loading and failed capability checks allow only one slot", () => {
  assert.equal(bookingSlotLimit(), 1);
  assert.equal(bookingSlotLimit({}), 1);
  for (const limit of [0, -1, 1.5, NaN, Infinity, "4", null]) {
    assert.equal(bookingSlotLimit({ maxSlotsPerBooking: limit }), 1);
  }
});

test("the backend controls rollout and cannot exceed the supported frontend limit", () => {
  assert.equal(bookingSlotLimit({ maxSlotsPerBooking: 1 }), 1);
  assert.equal(bookingSlotLimit({ maxSlotsPerBooking: 2 }), 2);
  assert.equal(bookingSlotLimit({ maxSlotsPerBooking: 4 }), 4);
  assert.equal(bookingSlotLimit({ maxSlotsPerBooking: 10 }), 4);
});

test("single portal slots use the legacy contract, including half-hour starts", () => {
  assert.deepEqual(checkoutSlotRequest([{ startHour: 18 }]), { startHour: 18, startMinute: 0 });
  assert.deepEqual(checkoutSlotRequest([{ startHour: 19, startMinute: 30 }]), { startHour: 19, startMinute: 30 });
});

test("multiple portal slots keep every selected time", () => {
  const slots = [{ startHour: 18 }, { startHour: 20, startMinute: 30 }];
  assert.deepEqual(checkoutSlotRequest(slots), { slots });
});

test("single staff bookings use slotId and multiple bookings use slotIds", () => {
  assert.deepEqual(staffSlotRequest(["s1"]), { slotId: "s1" });
  assert.deepEqual(staffSlotRequest(["s1", "s2"]), { slotIds: ["s1", "s2"] });
});

test("empty selections cannot produce a booking request", () => {
  assert.throws(() => checkoutSlotRequest([]), /Select a time slot/);
  assert.throws(() => staffSlotRequest([]), /Select a time slot/);
});
