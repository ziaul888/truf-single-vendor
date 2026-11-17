# SaaS owner dashboard: first implementation

Date: 17 November 2026, Asia/Dhaka. Branch: `feat/tenant-foundation` in both repositories.

## Available

- `/platform/login`: dedicated platform sign-in using an explicitly granted account.
- `/platform`: real tenant lifecycle totals, active owner count and recently registered turf businesses.
- `/platform/tenants`: paginated directory with name/handle search, lifecycle filtering, owner identity and active staff count.
- `/platform/tenants/[id]`: business metadata, owner contact and active staff count. Includes paused, setup and archived accounts for platform oversight.
- Responsive platform navigation, mobile drawer, theme switcher, loading/error/empty states and platform-only sign-out.
- Platform-specific metadata and icon; private pages and API responses excluded from indexing/shared caching.

The turf owner still uses the existing `/dashboard` and Settings. The removed workspace/My turf pages remain removed; old business bookmarks redirect to the dashboard.

## Access boundary

The additive `20261117103000_platform_grants` migration introduces PlatformGrant with an explicit user relation, active flag and session version. Global staff roles and tenant memberships do not grant platform access.

Platform sessions use the separate HttpOnly `platform_token` cookie, host-only cookies, a domain-separated signing key, HS256, a dedicated JWT audience/issuer, and both grant/user session versions. Every platform API request checks current user and grant state. A renamed staff/platform cookie does not cross audiences. Platform logout revokes platform sessions while preserving a valid staff session; global identity revocation invalidates platform sessions too.

Platform login/logout validate browser Origin against configured CORS origins. Login is limited to five attempts per minute per IP/email. Platform responses, including guard errors, use `Cache-Control: private, no-store`.

The frontend verifies platform identity before mounting data pages. Data query keys include the platform user ID; requests consume AbortSignal. Successful platform sign-in cancels outstanding requests and clears old query data. Login return paths are limited to the platform console.

## API

| Endpoint                            | Purpose                                                              |
| ----------------------------------- | -------------------------------------------------------------------- |
| `POST /api/v1/platform/auth/login`  | Verify password and explicit platform grant; set the platform cookie |
| `GET /api/v1/platform/auth/me`      | Verify the current platform administrator                            |
| `POST /api/v1/platform/auth/logout` | Revoke platform sessions and clear the platform cookie               |
| `GET /api/v1/platform/overview`     | Tenant status counts, distinct active owners and six recent accounts |
| `GET /api/v1/platform/tenants`      | Bounded pagination, search and lifecycle filtering                   |
| `GET /api/v1/platform/tenants/:id`  | Safe account/owner metadata for one business                         |

The initial dashboard was read-only. Draft onboarding and manual SaaS subscription billing are now implemented; see [onboarding and billing progress](./platform-onboarding-billing-progress.md). Customer bookings/payments, impersonation and tenant activation remain outside this platform console. Tenant lifecycle status is independent of subscription status.

## Local development setup

Requested platform owner: `ziaul935@gmail.com`, using the existing active local identity. Its local password was subsequently reset at the user's explicit request, rotating both staff and platform session versions. Credentials are not stored in this document or the repository.

The local development database was behind by three earlier additive settings/refund migrations. Review confirmed that no refunded wallet payments matched the historical refund backfill. Those pending migrations, the tenant foundation and PlatformGrant migration were applied to the verified local `turf_dev` database. Ground, booking, customer and payment record counts were checked before and after migration/grant setup and were unchanged. No external notification/payment providers were configured in this local backend.

The explicit local-only bootstrap command was run:

```sh
yarn platform:grant --email ziaul935@gmail.com
```

This command requires an existing active identity, rejects non-local/non-development databases, creates or reactivates one grant, and rotates its session version on reactivation. It does not change the user's staff role or create tenant memberships.

The frontend's ignored `.env.local` now points to `http://localhost:4000` for development. Its Next config reload was checked. The local backend runs with `yarn start:dev`; the existing frontend runs on port 3000. Platform sign-in is available at `http://localhost:3000/platform/login`.

Production release still requires controlled migration/grant provisioning and the broader tenant-isolation gates before external tenant operations are enabled. The bootstrap CLI deliberately supports local development only.

## Verification

| Check                              | Result                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| Backend unit suite                 | 639 passed; seven platform auth boundary and three availability cases added                 |
| Complete API integration suite     | 307 passed, including 19 platform cases and 35 tenant proof/account cases                   |
| Platform sign-in navigation tests  | 2 passed                                                                                    |
| Frontend production build/types    | Passed with the normal localhost:4000 API target                                            |
| API production build               | Passed                                                                                      |
| Focused source/test types          | Passed                                                                                      |
| New frontend/API lint              | Passed                                                                                      |
| Isolated test database schema diff | Empty                                                                                       |
| Local API/proxy                    | Updated platform endpoint responds through localhost:3000; expected 401 without its session |
| Browser QA                         | Passed against the isolated real API                                                        |

The first concurrent unit run hit an existing password-hashing test's five-second timeout while a build and integration suite were also running. Running the unit suite without parallel files passed all 639 tests; no hashing parameters or test timeouts were changed.

Browser QA used synthetic identities and 27 businesses in `turf_test`. Overview layouts passed at 320/375/390/430/768/1024/1440 px in all three themes; login, directory and detail layouts also passed at those widths. Checks covered mobile drawer navigation, real counts, owner denial, separate staff/platform cookies, neutral metadata/icon, pagination, search, status filters, missing accounts, loading/error/retry/setup/empty states, account cache clearing and platform logout preserving the staff session. No legacy business-data calls or runtime exceptions occurred. All synthetic identities, grants and businesses were removed and verified absent. Temporary QA servers/browser were closed; the user's development frontend/backend remain available on ports 3000/4000.

## Next

1. Draft onboarding, configurable monthly/yearly plans and manual billing: implemented in the next slice; see the linked progress document.
2. Tenant-aware conversion of existing booking/services/jobs and production isolation enforcement before additional businesses can transact.
3. Controlled owner invitation and turf activation after the tenant isolation gates are complete.
