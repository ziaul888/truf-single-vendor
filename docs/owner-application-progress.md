# Turf-owner application and activation

## User flow

1. A prospective turf owner opens `/saas` and selects **Apply for owner access**.
2. They choose an active monthly or yearly plan and submit the form at `/saas/apply`, including the password they will use after approval.
3. The application appears in **SaaS Admin → Applications** at `/platform/applications`.
4. The SaaS admin can activate or reject it.
5. Activation creates the owner account, a single turf business, the selected subscription and its first unpaid invoice. The turf remains **Setting up**.
6. The owner signs in from the shared `/login` page. A `Setting up` turf is routed to `/dashboard/settings`; an active turf goes to `/dashboard`.
7. The owner saves tenant-scoped business, first-ground, booking, payment and website onboarding settings. Incomplete progress can be resumed later.

## Security and lifecycle

- An application does not create an active user or tenant before SaaS-admin approval.
- Passwords are hashed by the API and never returned to the frontend or written to audit events.
- The saved password hash is removed from the application after activation or rejection.
- Public submissions are origin checked, validated, idempotent, and limited to five attempts per hour per IP.
- Pending applications enforce unique owner email and turf handle. A rejected applicant may apply again.
- The selected immutable plan version and billing interval are saved with the application, so a later price change cannot change the applicant's agreed price.
- Activation and rejection require a valid platform-admin session and are audited idempotent commands.
- Activation creates an owner-only session identity; it does not grant legacy staff API access.
- Turf status remains `draft` (`Setting up`) until the separate turf onboarding work is complete.
- Owner onboarding is stored per tenant and never opens the legacy global settings tables.

## Local URLs

- SaaS landing page: `http://localhost:3000/saas`
- Application form: `http://localhost:3000/saas/apply`
- SaaS-admin review: `http://localhost:3000/platform/applications`
- Approved owner login: `http://localhost:3000/login`

The old `/owner/login` and `/owner/activate` frontend routes are removed. Owner security still uses
the dedicated backend owner session, while all owner sign-in starts from the shared `/login` page.

## Verification completed

- Frontend TypeScript, targeted ESLint, platform navigation tests, and production build pass.
- Responsive layout checked at 320, 375, 390, 430, 768, 1024, and 1440 pixels with no horizontal overflow.
- Backend build and focused lint pass.
- Backend unit suite: 674 tests pass.
- Focused owner-application e2e suite: 5 tests pass. Four unrelated suites that collided in the shared database during the parallel full run also pass serially (64 tests).
- Additive migrations `20261118090000_owner_applications` and `20261118110000_owner_application_plans` are applied to local `turf_test` and `turf_dev` only.
- No production deployment was performed.
