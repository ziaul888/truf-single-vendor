# Turf onboarding and manual SaaS billing

17 November 2026. Both repositories remain on `feat/tenant-foundation`.

## Usage

Sign in at `http://localhost:3000/platform/login` with the existing platform administrator account.

1. **Plans → Create plan:** enter your own name, unique code, monthly price and yearly price in BDT. There are no default prices or sample plans in the development database.
2. **Turf businesses → Add turf:** enter business name, unique handle and owner details. Each owner can be assigned to one turf business. An existing owner's identity and sign-in settings are preserved.
3. Open the turf account and **Assign plan**. Choose monthly/yearly billing, the start date and payment due date. This creates the initial unpaid invoice atomically.
4. Open the invoice and **Record payment** only after checking your receiving bKash, Nagad or bank account. Enter the transaction/reference, received date and explicitly confirm that the full amount arrived.
5. Use **Create renewal invoice** on the turf account for the next billing period. **Cancel renewal** preserves any paid period and voids unpaid invoices; it does not refund money.

Invoices and subscriptions have separate searchable, paginated directories and status filters. The turf detail includes recent invoices and account activity with the administrator responsible for each action.

## Scope and boundaries

New businesses start in setup (`draft`). New owner identities remain inactive with an unusable random password; no invitation, password or automatic platform grant is issued. Existing active identities retain their current access. Paying an invoice changes SaaS billing state only; it does not activate a business or owner. Existing operational APIs still need tenant-aware conversion before additional turf businesses can safely transact. The removed Workspace/My turf interface stays removed.

This slice records full manual receipts; it does not initiate transfers, connect a wallet API, charge a card, send payment messages, accept partial payments or perform automatic refunds. All SaaS fee records are separate from booking payments and booking revenue. Provider automation and owner self-service are later work.

## Integrity

- Dedicated platform authorization and trusted browser Origin checks protect all mutations. The grant and both session versions are rechecked inside the write transaction.
- Commands use serializable transactions, bounded conflict retries, audit records and request UUIDs. Unchanged retries return the original resource. Reusing a UUID with another actor/action/resource/input returns a conflict.
- Prices are positive integer poisha; input text supports two decimal places without fractional floating-point multiplication. Currency is BDT. Subscriptions retain an immutable price-version snapshot, and invoice/payment amounts are server-owned.
- Database uniqueness enforces one turf per active owner, one current agreement per turf, one open invoice per agreement, one invoice per billing period and one receipt per invoice. Normalized references are unique per payment method.
- Monthly/yearly periods use the original calendar anchor, preserving month-end and leap-day behavior. Paid-through dates are exclusive boundaries. Renewal extends the paid period only after its invoice is paid, in period order.
- Current status is derived from the Bangladesh calendar date, so expiry does not depend on a scheduled job. Cancellation preserves a prepaid period until its end.
- Subscription → invoice → receipt relations include tenant IDs in composite foreign keys. No tenant-owned booking/customer API is exposed through the console.

## API additions

All endpoints use `/api/v1/platform` and the dedicated platform session.

| Method and path                                | Purpose                                                 |
| ---------------------------------------------- | ------------------------------------------------------- |
| `POST /tenants`                                | Draft turf and owner assignment                         |
| `GET/POST /plans`                              | Paginated plan list and initial immutable price version |
| `GET /subscriptions`, `GET /subscriptions/:id` | Billing agreement list/detail                           |
| `GET /tenants/:id/billing`                     | Current/latest subscription and recent invoices         |
| `GET /tenants/:id/activity`                    | Safe audit history with administrator identity          |
| `POST /tenants/:id/subscription`               | Agreement and first invoice                             |
| `POST /subscriptions/:id/renewal-invoice`      | Next period invoice                                     |
| `POST /subscriptions/:id/cancel`               | Stop renewal and void open invoices                     |
| `GET /invoices`, `GET /invoices/:id`           | Invoice list/detail and receipt                         |
| `POST /invoices/:id/record-payment`            | Full confirmed manual receipt                           |

Writes require a UUID `requestId`; payment requires `confirmed: true`. The browser retains the request UUID when an unchanged failed request is retried.

## Local database

Migration `20261117120000_platform_onboarding_billing` adds six billing/audit tables and enums, foreign keys, amount checks and partial unique indexes. It was first applied to the isolated `turf_test` database, then applied with `prisma migrate dev` to the verified local `turf_dev` after integration tests passed. The preflight found no owner assigned to multiple businesses. Existing grounds, bookings, customers, payments, users and tenant counts were unchanged; the platform administrator grant was preserved. No production database was changed.

## Verification

| Check | Result |
| --- | --- |
| Backend unit suite | 660 passed, including calendar billing and transaction/revocation failure cases |
| Full API integration suite | 332 passed, including 25 new onboarding/billing cases, 19 platform cases and 35 tenant cases |
| Frontend price/date and navigation tests | 4 passed |
| Frontend/API production builds | Passed; final frontend uses the ordinary localhost:4000 target |
| Focused backend source/test types | Passed |
| API and new frontend lint | Passed; full frontend lint has 12 pre-existing warnings and no errors |
| Isolated database migration diff | Empty; existing booking payment index and CHECKs preserved |
| Local migration/proxy | Business counts unchanged, grant preserved, new endpoint reachable through localhost:3000 |

Browser QA used the real API and synthetic accounts only in `turf_test`, covering plan/onboarding forms, monthly/yearly prices, payment confirmation, unchanged-request network retries, renewal and cancellation. Layout checks covered widths 320/375/390/430/768/1024/1440, including scrollable dialogs and all three themes for the plan form. Invoice/subscription pagination, search and status/tenant filters, loading/error/retry/empty/missing states also passed with no browser runtime exceptions.

Temporary browser, API/frontend preview services and their synthetic fixtures are cleaned up after verification. The ordinary frontend/backend on ports 3000/4000 remain available. No commit, push or deployment is part of this slice.
