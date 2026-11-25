import assert from "node:assert/strict";
import { test } from "node:test";
import { platformRedirectPath } from "../src/lib/platform-redirect.ts";
import { turfPortalPublicUrl, turfPortalSlugForHost } from "../src/lib/turf-portal-path.ts";

test("platform sign-in returns only to platform console routes", () => {
  for (const value of [
    "/platform",
    "/platform/applications",
    "/platform/tenants",
    "/platform/tenants?status=active",
    "/platform/tenants/11111111-1111-4111-8111-111111111111",
    "/platform/tenants/new",
    "/platform/plans",
    "/platform/plans/new",
    "/platform/subscriptions",
    "/platform/invoices?tenantId=11111111-1111-4111-8111-111111111111",
    "/platform/invoices/11111111-1111-4111-8111-111111111111",
  ])
    assert.equal(platformRedirectPath(value), value);
});
test("platform sign-in rejects external destinations, login loops and other audiences", () => {
  for (const value of [
    null,
    "",
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "/platform/\\example.com",
    "/dashboard",
    "/login",
    "/platform/login",
    "/platform-other",
    "/platform/../dashboard",
    "/platform/tenants#https://example.com",
  ])
    assert.equal(platformRedirectPath(value), "/platform");
});

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
