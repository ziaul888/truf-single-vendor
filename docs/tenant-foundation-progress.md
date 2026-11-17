# Tenant foundation and owner dashboard flow

Date: 17 November 2026, Asia/Dhaka.
Branches: `feat/tenant-foundation` in turf-admin and turf-api.
Plan: [SaaS feature plan](multi-tenant-saas-feature-plan.md).

## Implemented

- Additive Tenant and TenantMembership models, lifecycle status and membership roles.
- Migration `20261117062213_tenant_foundation`: two enums, two tables, indexes and membership foreign keys. Existing business tables, booking amounts and payment indexes are unchanged.
- TenantsModule with membership authorization, tenant role checks and transaction-bound database access.
- Immutable tenant context resolved from current membership, active user and active tenant. Global User.role and supplied tenant headers do not imply membership.
- Parameterized transaction-local context, restricted-role checks and an explicit narrow SQL convention in the API's CLAUDE.md.
- Synthetic two-business HTTP/database proof using the actual PrismaPg adapter and a separate restricted login.
- Reservation projection with composite tenant foreign keys, row-security policies, compare-and-set slot claims and live-slot uniqueness.
- Read-only business account APIs using current membership rather than the global staff role.
- Separate SaaS platform authentication, explicit PlatformGrant access, overview/directory/detail APIs and console pages. See [platform dashboard progress](platform-admin-progress.md).

AppModule imports TenantsModule for the read-only account endpoints. The reservation proof controller and projection tables exist only in tests; the application's existing booking tables/routes have not yet been converted to tenant isolation. The separate workspace/My turf frontend has been removed at the user's request.

## Owner flow and account APIs

- V1 supports one turf business per owner. A business can still have several grounds/sports. There is no separate workspace, My turf page, chooser or switcher.
- Owners use the existing dashboard and Settings. Normal login lands directly on `/dashboard`. The My turf menu item, workspace routes/layout, components, account query hook and frontend account types have been removed.
- Old `/businesses` and `/businesses/*` bookmarks redirect to `/dashboard`; the dashboard's existing authentication gate applies.
- `GET /api/v1/admin/me/tenant`: resolves one active membership for the authenticated active staff user; returns 404 `TENANT_ACCOUNT_NOT_ASSIGNED` when none exists and 409 `TENANT_ACCOUNT_AMBIGUOUS` when more than one is assigned. It never defaults to the first membership or accepts a supplied user/tenant selector. Paused/setup account metadata remains visible; operational tenant guards still require an active tenant.
- `GET /api/v1/admin/me/tenants`: bounded pagination, search and status filters; only active memberships for the current active staff user. The response includes account metadata and that user's membership role, without other users or credentials.
- `GET /api/v1/tenants/:tenantId/profile`: current active membership and active business required. A foreign, revoked or inactive business is denied.
- Successful account API responses use `Cache-Control: private, no-store`. Successful login still cancels queries and clears the previous account's cache. The account resolver will be integrated into the existing dashboard during the tenant-aware business API migration.

The backend tenant foundation and account APIs remain available. Self-service creation, editing, invitations, subscription billing and tenant-scoped booking operations remain later work.

## Evidence

| Check                           | Result                                                            |
| ------------------------------- | ----------------------------------------------------------------- |
| Last full unit suite            | 639 passed, including platform authentication boundary cases      |
| Last complete e2e suite         | 307 passed, including 19 platform integration cases               |
| Current tenant integration      | 35 passed, including six new single-turf account cases            |
| API production build            | Passed                                                            |
| Focused proof/source type check | Passed using tsconfig.tenant-proof.json                           |
| API lint                        | Passed                                                            |
| Frontend lint                   | Passed with 12 existing warnings in legacy files; new files clean |
| Frontend booking-request tests  | 6 passed                                                          |
| Frontend production build/types | Passed with the normal project API configuration                  |
| Workspace removal               | Build, lint, old-link redirects and dashboard sign-in gate passed |
| Isolated test DB schema diff    | Empty after the additive migration                                |

The unrestricted repository-wide test TypeScript check also reports existing errors in legacy test fixtures and supertest/types imports. Those files were not changed. The production build and focused new-code type check pass.

Database evidence: dedicated local `turf_test`, PostgreSQL 17.11. The test runner validates the database before setup. Proof roles are non-superuser, non-owner, without BYPASSRLS/role-creation/database-creation privileges. Each run removes its synthetic schema, identities and ephemeral runtime role.

The 35 tenant proof/account API tests cover:

- Staff authentication, UUID validation, membership revocation and inactive tenants.
- Global admins without membership and global admins with a manager membership.
- Forged tenant headers, foreign resource IDs and foreign-slot reservation attempts.
- Unscoped reads/writes, cross-tenant inserts/updates/deletes/counts and composite foreign keys.
- Nested writes and an invalid user/tenant database context.
- Context cleanup after commit and rollback on the same reused connection.
- Concurrent A/B requests across a four-connection pool.
- Two competing transactions for the same single slot or pair of slots.
- Complete rollback when a multi-slot claim cannot reserve every slot.
- Membership-only account listing/profile DTOs, status/search/pagination, revoked access and private cache headers.
- Single-turf resolution for owners/managers, forged identity selectors, unassigned global admins, ambiguous assignments, revoked membership and paused account metadata with denied operational access.

The earlier workspace and single-turf overview browser checks are historical; those screens have now been removed. The owner flow uses the existing dashboard. No backend changes or application data changes are required for this frontend removal.

## Repository inventory

[Route catalog](tenant-foundation-routes.csv): 110 controller HTTP methods.
[Query call-site catalog](tenant-foundation-queries.csv): 270 statically identified Prisma model call sites.

These are implementation snapshots, not claims that all listed access paths are already scoped. Decorator guards are recorded; service-level signed-link/OTP checks still need review when porting each route. Dynamic/delegated data access needs inspection alongside the catalog.

| Model/group                      | Intended ownership                                 | Migration concern                                                                                        |
| -------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| User                             | Global staff identity                              | Keep identity; move business permissions to memberships                                                  |
| Tenant, TenantMembership         | Platform control-plane, linked business membership | Explicit access; no automatic platform privileges                                                        |
| Ground, Slot                     | Tenant                                             | Composite relationships; retain schedule and unique slot identity                                        |
| SlotEvent, Closure               | Tenant                                             | Empty closure groundIds means all grounds of that tenant; validate or replace free-form ground-ID arrays |
| SlotSettings                     | One record per tenant                              | Replace the id=1 singleton assumption without changing current settings                                  |
| Customer                         | Tenant                                             | Scope normalized phone and merchant customer identity; preserve notes/history                            |
| Booking, BookingSlot             | Tenant                                             | Preserve primary/live slots and atomic multi-slot reservations                                           |
| BookingSeries, BookingSeriesSkip | Tenant                                             | Scope extension, skips, checkpoints and cancellation                                                     |
| Payment                          | Tenant with immutable merchant account association | Review reference uniqueness and provider/account identity before changing indexes                        |
| BookingEvent, SettingsEvent      | Tenant                                             | Actor identity is global; actions require business authority                                             |
| SettingsSection                  | Tenant plus key                                    | Scope venue/website/notification settings and caches                                                     |
| SystemState                      | Split tenant/account and infrastructure scope      | Digests and cleanup checkpoints cannot remain global business state                                      |
| EmailLog                         | Tenant or explicit platform-message scope          | Separate business correspondence from platform invitations/billing                                       |

Remaining frontend migration surfaces: integrate automatic turf resolution into the existing dashboard, root metadata/layout, host routing, public server fetches, tenant-scoped business API clients/query keys, branding, icons/manifests, sitemaps, confirmation URLs and legacy account links.

Other surfaces: public versus private uploads, receiver-account details, Stripe webhook resources, notification identities, slot generation, hold expiry, completion, recurring bookings, due reminders/digests and deployment migration credentials.

## Decisions used for this slice

- V1 owner accounts manage one turf business. The current-account endpoint rejects ambiguous assignments. Future onboarding/membership writes must enforce the one-turf provisioning rule; those write endpoints have not been implemented. The underlying membership model and isolation proof remain general enough to verify separate SaaS tenants.
- Reuse the existing staff identity/token checks in the tenant proof; verify business authority separately. Platform sessions now use an explicit grant, domain-separated key and dedicated audience/issuer. Tenant-specific customer session audiences remain future work.
- Use a transaction callback and one transaction client for authorization, context and database work. Avoid a per-query transaction extension.
- Reject administrative/bypass/table-owner connections in the tenant transaction boundary, including owners of forced-RLS tables.
- Limit raw SQL to transaction-local context and role metadata in the shared helper; fixed-schema/role DDL is test infrastructure.
- Keep proof tables outside public business tables. The proof establishes compatibility of the transaction pattern; it does not certify the entire legacy booking/payment workflow under RLS.

## Reproduce

From the API repository, with an isolated local test database configured:

```sh
yarn test:tenant-isolation
yarn test
NODE_ENV=test yarn test:e2e --no-file-parallelism
yarn build
yarn tsc -p tsconfig.tenant-proof.json
```

The dedicated proof runner checks NODE_ENV, local host, test database name and separation from the application database before generating clients, applying test migrations or creating its test role/schema. Its database principal needs test-bootstrap role-creation privileges. Production runtime credentials must not have those privileges.

The original proof slice changed only the isolated test database. The later platform dashboard task applied the reviewed additive migrations to the local development database and granted the requested local owner account platform access, preserving business record counts. See the platform progress report for details. Production deployment remains a separate release step.

## Remaining gates and next work

M0's local context/reservation-pattern proof is complete. G0 remains a release gate: validate the intended production pool/runtime identity, finalize the complete business-role contract, and rehearse the migration with the converted business services.

Next implementation:

1. Add TenantDomain and explicit legacy-host mapping.
2. Add nullable ownership to the real business models and review tenant-consistent relationships, identifiers and merchant constraints.
3. Build repeatable backfill/reconciliation tooling for the existing business and choose its owner explicitly.
4. Convert real APIs, background work and frontend clients in the planned dependency order.
5. Apply enforcement and enable another external tenant only after the full isolation gate passes.

Self-service onboarding, subscription charging, custom domains, broad business-data backfill and production RLS enforcement remain pending.
