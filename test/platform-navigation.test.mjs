import assert from "node:assert/strict";
import { test } from "node:test";
import { platformRedirectPath } from "../src/lib/platform-redirect.ts";

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
