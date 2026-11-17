# Multi-tenant SaaS research

Research date: 17 November 2026, Asia/Dhaka.
Status: architecture recommendations for review; implementation has not started.
Companion document: [Feature and delivery plan](multi-tenant-saas-feature-plan.md).

## 1. Confirmed product direction

- One tenant represents one independent turf business, with multiple grounds.
- Each business has its own staff, customers, bookings, refunds, branding, and payment settings.
- Businesses pay the platform a monthly or yearly software subscription.
- Keep the existing frontend and API repositories.
- The SaaS website uses the main domain; platform administrators use `manage.`; business staff use `app.`; customers use tenant subdomains.
- Actual brand/domain, registration country, subscription provider, prices, trial duration, and grace period remain undecided.

This research distinguishes observed repository behavior from recommendations. The deliverable is research and implementation planning.

## 2. Repository assessment

Reviewed frontend commit: `72b69fd`. Reviewed API commit: `59f6e85`.
Installed versions inspected locally: Next.js 16.2.4, React 19.2.5, NestJS 12.3.1, Prisma 7.10.1.
The production PostgreSQL version and actual hosting tier were not inspected.

| Observed implementation                                                                                             | SaaS implication                                                                                         | Evidence                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff users have global admin/manager roles; staff and customer JWTs have no tenant context                         | Introduce memberships and separate platform authorization; bind customer sessions to a business          | [Staff types](../../turf-api/src/auth/auth.types.ts), [customer types](../../turf-api/src/customer-auth/customer-auth.types.ts)                                                                                  |
| Customer phone and booking number are globally unique                                                               | Review business-level identifiers; customer profiles must be independent between businesses              | [API schema](../../turf-api/prisma/schema.prisma)                                                                                                                                                                |
| Slot settings use a single record; JSON settings and system state use global keys                                   | Replace singleton assumptions with explicit business ownership                                           | [Slot settings](../../turf-api/src/slots/slot-settings.service.ts), [settings store](../../turf-api/src/settings/settings-store.service.ts), [system state](../../turf-api/src/settings/system-state.service.ts) |
| Public settings have an in-memory cache; frontend public fetches use common URLs/tags; React Query has one provider | Partition server and browser caches and invalidation by tenant                                           | [Settings store](../../turf-api/src/settings/settings-store.service.ts), [website reads](../src/services/website-settings.ts), [providers](../src/components/providers.tsx)                                      |
| Root metadata reads one venue; site URL is a single environment value                                               | Give marketing, platform, staff, and tenant pages separate metadata policies                             | [Root layout](../src/app/layout.tsx), [site URL](../src/lib/site-url.ts), [sitemap](../src/app/sitemap.ts)                                                                                                       |
| Proxy recognizes admin hosts and checks cookie presence; API authorization remains authoritative                    | Add explicit host classes and tenant resolution without making hostname or cookie presence authorization | [Frontend proxy](../src/proxy.ts), [API guard](../../turf-api/src/auth/auth.guard.ts)                                                                                                                            |
| Stripe credentials, currency, email identity, timezone defaults, and confirmation origin have global configuration  | Resolve business settings and payment accounts explicitly; keep platform billing separate                | [Stripe service](../../turf-api/src/payments/stripe.service.ts), [booking links](../../turf-api/src/bookings/booking-rules.ts), [venue time](../../turf-api/src/slots/venue-time.ts)                             |
| Jobs run on process timers; digest and cleanup state use global keys                                                | Scope work, checkpoints, retry handling, and concurrency controls by tenant                              | [Booking jobs](../../turf-api/src/bookings/booking-jobs.ts), [generation job](../../turf-api/src/slots/slot-auto-generate.job.ts)                                                                                |
| Uploads are served as public static files; the Render blueprint specifies a free service and local upload directory | Separate intentional public assets from private files; provision durable storage and reliable scheduling | [App setup](../../turf-api/src/app.setup.ts), [Render blueprint](../../turf-api/render.yaml)                                                                                                                     |
| API Docker startup automatically applies pending migrations                                                         | Separate additive and enforcement releases; avoid deploying all migration stages together                | [Dockerfile](../../turf-api/Dockerfile)                                                                                                                                                                          |

Important behavior to retain: atomic slot reservation, multi-slot uniqueness, repeat bookings, cash deposits, manual wallet verification, full-booking cancellation/refunds, refund tracking, and existing customer links.

## 3. Findings from primary sources

### R1. Tenant selection and authorization are different operations

OWASP treats a supplied tenant identifier as a selector that still needs an authorization check. Isolation also covers asynchronous work, storage, and caches.

Project recommendation: public host resolution selects public business content; staff requests must independently verify membership. Platform privileges must never follow automatically from the existing admin role.

Source: [OWASP multi-tenant security guidance](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html).

### R2. Database policies add protection but do not replace correct relationships

PostgreSQL RLS can restrict row access. Owners normally bypass policies; superusers and BYPASSRLS roles bypass them. Referential-integrity checks have different policy behavior.

Project recommendation: combine scoped services, tenant-consistent foreign keys, and tested RLS under a restricted runtime role. Use a separate migration identity. Validate the deployed PostgreSQL version before writing policy DDL.

Source: [PostgreSQL row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

### R3. Prisma transaction compatibility needs a proof before adoption

Prisma supports query extensions. Its published RLS example explicitly cautions that wrapping each query in another transaction can conflict with explicit transactions.

Project recommendation: prove tenant context using the actual reservation/cancellation transactions and connection pool. Keep all policy-dependent statements on the same transaction client. Do not adopt an automatic filter extension as the sole boundary.

Sources: [Prisma v7 query extensions](https://www.prisma.io/docs/orm/v7/prisma-client/client-extensions/query), [Prisma RLS example and limitations](https://github.com/prisma/prisma-client-extensions/blob/main/row-level-security/README.md).

The example uses transaction-local database configuration. This requires a documented narrow exception to the API repository's no-raw-query convention if implemented through parameterized set_config. Policy DDL is already covered by the migration-DDL exception. Resolve the runtime convention explicitly in milestone M0.

### R4. Existing data calls for staged migration

Prisma's version-specific expand-and-contract guide separates introducing a new representation, moving data, and removing old assumptions.

Project recommendation: add fields, migrate existing ownership, deploy compatible services and jobs, drain old writers, reconcile, and only then enforce required ownership and policies. New tenant onboarding stays disabled until enforcement passes.

Source: [Prisma ORM v7 expand-and-contract guide](https://www.prisma.io/docs/guides/v7/database/data-migration).

The installed project uses Prisma 7. Keep its migration commands and lockfile; current unversioned documentation may describe Prisma 8. A dependency upgrade is a separate change.

### R5. One frontend can support the agreed domain model

Vercel supports hostname routing and wildcard/custom-domain configuration. Wildcard certificates require DNS challenge access through Vercel DNS or supported external-DNS delegation. Custom domains need ownership verification.

Project recommendation: use one frontend deployment, reserve platform hostnames, keep a verified hostname registry, and reject unknown hosts. Add custom customer domains after the subdomain pilot.

Sources: [Vercel domain configuration](https://vercel.com/docs/platforms/multi-tenant-platforms/configuring-domains), [Vercel proxy and routing](https://vercel.com/docs/platforms/multi-tenant-platforms/proxy-and-routing).

### R6. Sessions must respect the domain boundaries

An omitted cookie Domain attribute produces a host-only cookie. The \_\_Host- prefix also constrains cookie attributes in supporting browsers. Cookie scope does not establish API authorization.

Project recommendation: separate platform, staff, and tenant-customer session audiences; host-only production cookies; Origin/CSRF checks for mutations. Do not require shared cookies across customer custom domains.

Source: [MDN Set-Cookie reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie).

### R7. Tenant identity must participate in cached representations

Next.js documents serialized arguments as part of use-cache keys. The project currently uses fetch caching, not an enabled Cache Components migration.

Project recommendation: retain the current caching mechanism initially, with explicit tenant-specific fetch URLs, cache keys, and invalidation tags. Review complete HTML, metadata, image, and domain caches as well as data fetches.

Source: [Next.js cache key documentation](https://nextjs.org/docs/app/api-reference/directives/use-cache).

This is a cache-design requirement, not a proposal to enable a new caching feature during migration.

### R8. Software subscriptions and customer booking payments are separate integrations

Stripe distinguishes selling software subscriptions from extending payment processing to merchants through Connect.

Project recommendation: build separate subscription invoices, receipts, and events. Preserve booking money in the existing booking/payment domain. New businesses must never silently use the existing venue's card account.

Source: [Stripe SaaS payment models](https://docs.stripe.com/connect/saas).

### R9. Provider eligibility is an unresolved product dependency

Stripe's supported-country list did not include Bangladesh when checked on the research date. The operator's legal business country is not confirmed; the Asia/Dhaka timezone alone does not establish eligibility.

Project recommendation: confirm legal merchant country, recurring-payment support, settlement currency, onboarding, and refund capability before selecting SaaS billing or merchant card processing. Manual invoicing can be a separately approved pilot option; it is not automatic renewal.

Source: [Stripe global availability](https://stripe.com/global).

No conclusion about bKash/Nagad automatic recurring capabilities is made here; this code currently records those booking payments manually.

### R10. Billing access cannot depend on the checkout return page

Stripe subscription state changes asynchronously. Webhook deliveries can repeat and arrive out of order.

Project recommendation: verify signatures, persist deduplication state, make processing retryable, and reconcile with current provider state. Derive entitlements on the server and test renewal failure and recovery.

Sources: [Subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks), [Webhook ordering and duplicates](https://docs.stripe.com/webhooks).

### R11. The checked-in hosting setup needs a paid-pilot readiness review

Render documents idle spin-down and ephemeral storage for free web services. The repository's blueprint selects that service class; actual production settings were not queried.

Project recommendation: verify actual capacity, durable asset storage, and an always-running or externally triggered scheduler before promising timely expirations/reminders to paying tenants. Test multi-instance execution.

Source: [Render free-service behavior](https://render.com/docs/free).

## 4. Architecture decision record

These are project-specific engineering recommendations, not additional user-approved product requirements.

| Decision                | Recommendation                                                                     | Reason and tradeoff                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Frontend organization   | One Next.js project with separate area layouts                                     | Reuses existing UI and deployment; all areas share a release cycle                                          |
| API organization        | One NestJS API with platform, staff, public, and customer authorization boundaries | Existing booking transactions remain local; quotas and isolation need consistent enforcement                |
| Data tenancy            | Shared PostgreSQL database/schema with explicit tenant ownership and RLS           | Fits this codebase; per-tenant restore is more involved and requires a tested procedure                     |
| Alternative data models | Defer schema-per-tenant/database-per-tenant                                        | Stronger operational separation may justify them later, with additional connection and migration management |
| Staff identity          | Global User plus tenant memberships                                                | One staff identity can serve several businesses; business roles move out of global User.role                |
| Customer identity       | Tenant-specific customer profile and customer session                              | The same phone can book at different businesses without sharing private notes or history                    |
| Staff tenant selection  | Explicit tenant in dashboard URL and API resource path                             | Supports two business tabs without a shared last-selected cookie silently changing write scope              |
| Platform access         | Explicit platform grant and dedicated session audience                             | A business admin is not a platform administrator                                                            |
| Payments                | Separate platform billing and business merchant configuration                      | Financial records, webhook routing, and reported revenue remain distinguishable                             |
| Launch order            | Internal two-tenant staging, invited pilot, then paid self-service                 | Tests isolation and migration before opening automatic tenant creation                                      |

Domain recommendation:

| Host                     | Audience and scope                                                 |
| ------------------------ | ------------------------------------------------------------------ |
| yourbrand.com            | Marketing, pricing, signup                                         |
| manage.yourbrand.com     | Platform administrators                                            |
| app.yourbrand.com        | Staff login, business selector, tenant dashboard                   |
| greenfield.yourbrand.com | One business's public booking website and customer account         |
| api.yourbrand.com        | API origin; browsers normally use the frontend's same-origin proxy |

yourbrand.com is a placeholder. DNS setup is not part of creating this plan.

## 5. Open decisions and delivery effects

| Decision                                                   | Needed before                            | Work that can proceed                                |
| ---------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------- |
| Actual base domain and DNS owner                           | Production domain rollout                | Local hostname routing and tenant foundation         |
| Legal merchant country and subscription provider           | Automated paid onboarding                | Provider-neutral billing model and test adapter      |
| Prices, currency, trial/grace periods, plan limits         | Paid plan activation                     | Plan/version model and enforcement interfaces        |
| Tenant card-payment account model and supported regions    | Offering card payments to a new business | Cash/manual wallet pilot                             |
| RLS context implementation and narrow query-rule exception | Database enforcement                     | Data ownership inventory and proof-of-concept design |
| Durable storage and scheduler hosting                      | External pilot                           | Local adapters and deterministic job tests           |
| Retention, export, and closure policy                      | Paid launch/offboarding                  | Export and audit interfaces                          |
| Support access and platform MFA/recovery design            | External platform-admin access           | Role model and dedicated platform session            |

## 6. Research limits

Provider eligibility remains unverified until the operator's merchant country and provider onboarding are confirmed.
No production data, gateway credentials, billing account, DNS records, or hosting subscription was accessed or modified.
No latency, capacity, or implementation-duration claim is made without measurement.
Source findings should be rechecked when implementing provider-specific integrations.
