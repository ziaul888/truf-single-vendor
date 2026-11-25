import assert from "node:assert/strict";
import { test } from "node:test";
import { turfPortalPublicUrl, turfPortalSlugForHost } from "../../../packages/web-shared/src/lib/turf-portal-path.ts";

test("booking aliases use the saved turf handle and reserve platform and owner domains", () => {
  assert.equal(turfPortalSlugForHost("turf-nation-turforg.vercel.app"), "turf-nation");
  assert.equal(turfPortalSlugForHost("FIELD-HOUSE-turforg.vercel.app"), "field-house");
  for (const host of [
    "turforg.vercel.app",
    "platform-turforg.vercel.app",
    "admin-turforg.vercel.app",
    "other.site-turforg.vercel.app",
    "field-house-turforg.vercel.app.example.com",
  ])
    assert.equal(turfPortalSlugForHost(host), null);
});

test("owner console copies the booking URL on the public host and local development uses its own host", () => {
  assert.equal(
    turfPortalPublicUrl("field-house", "https://admin-turforg.vercel.app"),
    "https://turforg.vercel.app/turf/field-house"
  );
  assert.equal(
    turfPortalPublicUrl("field-house", "http://localhost:3000"),
    "http://localhost:3000/turf/field-house"
  );
});
