import assert from "node:assert/strict";
import { test } from "node:test";
import { bdtMinorUnits, displayBillingDate } from "../src/lib/platform-billing.ts";

test("BDT prices keep poisha exact and enforce the API amount range", () => {
  for (const [text, amount] of [
    ["0.01", 1],
    ["1.1", 110],
    ["1500.99", 150099],
    [" 12000 ", 1200000],
    ["10000000.00", 1000000000],
  ]) {
    assert.equal(bdtMinorUnits(text), amount);
  }
  for (const text of [
    "",
    "0",
    "-1",
    "1.005",
    "1e3",
    "1,500",
    "NaN",
    "Infinity",
    "10000000.01",
    "99999999999999999999",
  ]) {
    assert.throws(() => bdtMinorUnits(text));
  }
});
test("billing date labels preserve date-only invoice boundaries", () => {
  assert.equal(displayBillingDate("2028-02-29"), "29 Feb 2028");
  assert.equal(displayBillingDate("2026-01-31"), "31 Jan 2026");
});
