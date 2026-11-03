# Existing turf-admin dashboard audit

Static code audit of `turf-admin` at commit `bd64a98`, done 2 Nov 2026. Sources are local files, cited as backticked paths relative to `/Users/mdziaulhoque/Desktop/turf-admin`; a `turf-api/` prefix means `/Users/mdziaulhoque/Desktop/turf-api`. `D/` means `src/app/(admin)/dashboard/`. The app was not run and no live API was called, so "wired" means the UI code calls an endpoint that exists in the turf-api source. It does not mean the behaviour was observed.

Status labels: **Wired** (real API, working UI code), **Read-only** (real data, no editing by design), **Static** (hardcoded content), **Stub** (UI with no behaviour).

## What does the main dashboard home page show?

### Takeaway
The home page is a live operations board, not a placeholder. It has 5 attention cards, 4 KPIs, a per-ground timeline for today, upcoming bookings with payment collection, a cash summary, 2 charts and an activity feed, all from turf-api. Its gaps are in depth (no drill-downs, no date picker, weak error states), not in missing basics.

### Cited Findings

**Quick actions (4 links, shown to every role)** — `D/page.tsx:21-26`
- New Booking, Add Ground, Add Customer (`?add=1` opens the drawer, `D/customers/page.tsx`), All Bookings.

**"Needs attention" cards (5)** — `src/components/features/dashboard/attention-cards.tsx:389-398`; endpoint `GET /admin/dashboard/attention`, refreshed every 60s (`src/hooks/useDashboard.ts:10,23-29`)

| Card | Shows | Links to |
|---|---|---|
| To confirm | count, number paying at venue | `/dashboard/bookings/confirmed` |
| Overdue | count, amount to collect | `/dashboard/bookings?due=overdue` |
| Due today | count, amount to collect | `/dashboard/bookings?due=today` |
| Starting soon | count, within N minutes | `#upcoming` anchor |
| Paying now | customers in card checkout | no link |

**KPI cards (4)** — `D/page.tsx:56-61`; endpoint `GET /admin/dashboard/stats`, no auto-refresh (`src/hooks/useDashboard.ts:15-20`)
- Today's Revenue, Today's Bookings, Total Customers, Active Grounds. Each has a trend labelled "vs last week", or "New" when the prior value was 0 (`src/components/features/dashboard/stat-card.tsx:710-717`).

**Today's Grounds** — `src/components/features/dashboard/today-grounds.tsx`; endpoint `GET /admin/dashboard/today`, 60s refresh
- One row per active ground: slot strip (free, paying, booked, blocked) with the current hour ringed, booked count, free hours left, revenue today, closed reason, who is playing now, who is next, and a Collect button when the next booking has money due (lines 796-854).

**Lists**
- Upcoming Bookings, limit 5 (`D/page.tsx:32`). Columns: booking, customer, ground, date, time, total, status, payment, Collect button (`src/components/features/dashboard/dashboard-data-table.tsx:564-611`). Phones get a stacked list (`upcoming-list.tsx`).
- Recent Activity, latest 10 booking events with actor or "Automatic", linking to the booking, 60s refresh (`src/components/features/dashboard/recent-activity.tsx:656-697`; `GET /admin/booking-events`).

**Money panel** — Today's Money: card, cash and bank transfer net of refunds, refunded today, net today, and a "what should be in the drawer" note (`src/components/features/dashboard/today-money.tsx:900-935`; `GET /admin/reports/summary`).

**Charts (2)** — `src/components/features/dashboard/dashboard-charts.tsx`
- Weekly Revenue: recharts area chart, last 7 days by day (lines 486-509).
- Bookings by Status, last 7 days: radial bar chart (lines 512-533).

**Inline action** — Collect payment opens the real dialog from the upcoming list and from Today's Grounds (`D/page.tsx:98-100`; `collect-by-id-dialog.tsx`).

### Inferences
- Attention cards, the ground timeline and the cash panel already cover much of the "today at a glance" idea. Competitor features of that type should be compared as depth, not as net-new.
- The page has no period selector. Everything is fixed to today or the last 7 days, and period analysis lives under Reports.

### Gaps
- `src/hooks/useBookings.ts` was not read at the `useUpcomingBookings` definition, so its refresh behaviour is unconfirmed.
- The exact trend calculation in `turf-api/src/dashboard/dashboard.service.ts` was only skimmed. "Vs last week" is taken from the UI label and the hook comment.

## What can an admin actually do in each section?

### Takeaway
Every section is wired to turf-api and no mock-data page was found in the admin area. The only clear UI stub found is the topbar bell. Staff > Roles is hardcoded and partly contradicts the API, while Settings > Access is generated from the API.

### Cited Findings

Navigation is defined in `src/components/sidebar-nav-data.ts:18-104`. Every nav link has a matching `page.tsx`. Pages outside the nav are reached by links: `bookings/new`, `profile`, and the detail and edit pages.

**Bookings — Wired**
- List (`D/bookings/page.tsx`): server-side search, filters for status, payment, ground and balance due, 20 per page, status count cards, cancel from the row, links to calendar and add. Filters from `?due=` are honoured.
- Confirm queue (`D/bookings/confirmed/page.tsx`): despite the route name, this lists **pending** bookings. Search, ground filter, confirm or decline, and stat cards for awaiting review, amount due and oldest request. Amount due and oldest are computed in the browser from at most 100 rows (`STATS_LIMIT`, and the label says so).
- Detail (`D/bookings/[id]/page.tsx`): confirm, edit, collect payment, cancel with optional refund and customer notification (`cancel-dialog.tsx:23,54,103`), resend confirmation (`booking-detail-sidebar.tsx:97-100`).
- New (`D/bookings/new/page.tsx`): ground and slot picker, customer search or new customer, payment of full, partial or none; offline methods are cash and bank transfer only (`src/types/booking.ts`, `OFFLINE_METHODS`).
- Calendar (`D/bookings/calendar/page.tsx`): month, week and day views, ground filter, cards for Booked Today, Available Today, Blocked (month) and Partial Payment (month). Slots link to bookings (`booking-calendar/day-panel.tsx:177`). It is a viewing tool: no create-from-calendar or drag-to-move code was found in the day panel; the month and week grids were not read for actions.

**Customers — Wired**
- List (`D/customers/page.tsx`): search, tag filter, due filter, sort, 10 per page, 5 stat cards, add drawer.
- Export CSV on this page exports **only the current page** (its `title` says so). The full export is at Reports > Export.
- Detail (`D/customers/[id]/page.tsx`): profile, stats, contact, due payments with collect, booking history, edit, new booking link, delete (admin only; copy says past bookings and payments are kept).
- The VIP, regular and new tags are derived from booking count, with VIP at 10 or more (`turf-api/src/customers/customer.dto.ts:8`).

**Grounds — Wired**
- List (`D/grounds/page.tsx`): grid or table view, browser-side search and filters, 4 stat cards, activate or deactivate with confirmation. Add and edit are admin only.
- Detail (`D/grounds/[id]/page.tsx`): today's slots, today's bookings, pricing including peak price and ranges (lines 204-216), edit link.
- Create and edit include hours, pricing, size and photos (`src/components/features/add-ground/*`). The API has no delete-ground route (`turf-api/src/grounds/admin-grounds.controller.ts`).

**Slots — Wired**
- All slots (`D/slots/page.tsx`): list, bulk bar, per-row History, View booking, Block and Unblock (`slot-row-actions.tsx`), Block drawer; Generate is admin only.
- Blocked (`D/slots/blocked/page.tsx`): list with reason filter and counts, unblock one slot or a whole day. The block form supports recurring weekly and whole day (`block-slot-form.tsx:25,184`).
- Closures (`D/slots/closures/page.tsx`, `closure-form-sheet.tsx`): date range, all or selected grounds, reason, note, public label; booked slots are skipped and reported; lift closure. Create and lift are admin only.
- Activity (`D/slots/activity/page.tsx`): audit of block, unblock, close and reopen, with filters for ground, action, staff (admin only) and date range.
- Settings (`D/slots/settings/page.tsx`): booking window, cancellation cutoff, auto-generate, hold minutes, service fee, portal cash, notification switches. Editing is admin only.

**Reports — Wired**
- Overview (`D/reports/page.tsx`): Revenue, Bookings, Avg Booking Value, Completion Rate with trends; revenue trend chart.
- Revenue (`D/reports/revenue/page.tsx`): Net Revenue, Avg Booking Value, Refunds, Top Ground; revenue and bookings chart; breakdown by payment method; revenue by ground chart; ground performance table.
- Bookings (`D/reports/bookings/page.tsx`): Bookings, Completion Rate, Cancellation Rate, venue Utilization; trends by status; status pie; ground utilization table.
- Date ranges are presets only: 7, 30, 90 days and 1 year (`src/hooks/useReports.ts:130-132`).
- Export (`D/reports/export/page.tsx`, `src/lib/report-export.ts`): revenue (by day or week), bookings, customers; CSV streamed from the API, Excel built in the browser; custom dates up to 366 days.

**Staff — Wired, admin only; Roles — Static**
- `D/staff/page.tsx`: search, paging, add and edit, reset password, deactivate (signs the user out everywhere). Guarded in the page and by `@Roles('admin')` (`turf-api/src/users/users.controller.ts:15`).
- `D/staff/roles/page.tsx`: hardcoded `ROLE_PERMISSIONS` list. Its text lists "Revenue reports and CSV export" under admin, but the API allows managers too (`turf-api/src/reports/reports.controller.ts:12`; `turf-api/docs/frontend-reports.md`, "Admin and manager") and Reports is not `adminOnly` in the nav.

**Settings**
- General — Wired: venue profile, logo upload and remove; locale is fixed (`D/settings/general/page.tsx`).
- Website — Wired: content editor with image upload and preview (`src/components/features/website-settings/*`, `src/hooks/useSettings.ts`).
- Booking — Wired: the same live settings as Slots > Settings (`D/settings/booking/page.tsx`, comment at top).
- Payments — Read-only plus one switch: Stripe keys, mode and webhook health; method availability; "pay at venue" toggle. Keys live in the API's `.env` (`stripe-status-card.tsx`, `payment-methods-card.tsx`).
- Notifications — Wired: sender, customer emails (confirmed and cancelled are locked on; refund and slot blocked toggle), staff emails and recipients, test email, email log (`D/settings/notifications/page.tsx`, `customer-emails-section.tsx:29-43`, `src/hooks/useSettings.ts`).
- Access — Read-only: staff list and a role table generated from API route lists (`src/lib/permission-groups.ts`, `GET /admin/auth/permissions`).
- System — Admin only: version, uptime, database, record counts, 5 background jobs' last run, integration status, reset settings (`D/settings/system/page.tsx`, `system/system-health.tsx`).

**Profile — Wired, narrow** (`D/profile/page.tsx`): shows name, email and role; the only change allowed is password.

**Shell**
- Global search covers pages, customers, bookings and grounds (`src/components/global-search.tsx:101-103`). Theme toggle present.
- **Stub:** the topbar bell button has no handler, badge or data (`src/components/topbar.tsx:40-42`).

### Inferences
- The bell is the most visible unfinished element, and the data for in-app alerts already exists in the attention endpoint.
- Slots > Settings and Settings > Booking edit the same data, so adding booking rules means deciding which screen owns them.

### Gaps
- Read by keyword or partially, not line by line: `booking-detail-sidebar.tsx` (event timeline display unconfirmed although `BookingDetail.events` exists in `src/types/booking.ts`), `edit-booking-dialog.tsx` (editable fields unconfirmed), `block-booked-slot-dialog.tsx`, the Website settings page, `customer-form-fields.tsx` (whether `adminNote` is editable), month and week calendar grids.
- `D/bookings/new/page.tsx` was not confirmed to consume the `?customer=` link used by the customer page (`customer-profile-cards.tsx:44`).
- `D/settings/page.tsx` is 4 lines and was not read; it is probably a redirect.

## What is backed by real API calls versus hardcoded?

### Takeaway
All admin data hooks call turf-api through a Next.js rewrite. `server/index.js` is a dead legacy mock that nothing in the app references.

### Cited Findings
- `src/lib/api.ts:4-8`: axios client using `/api/v1`, with 401 redirecting to login. `next.config.mjs` rewrites `/api/v1/*` to `API_PROXY_TARGET`, default `http://localhost:4000`.
- `src/lib/api-client.ts:89-101`: exposes only public grounds endpoints (list, get, slots), so it is the customer-side client, not the admin one.
- A grep of `src/hooks`, `components`, `app` and `lib` found calls only to `/admin/...` paths across bookings, grounds, slots, closures, customers, users, reports, settings and auth. No hook contains hardcoded data.
- `server/index.js`: in-memory data and 6 routes such as `/api/dashboard/stats` (lines 308-372). Grep found no reference to `:5001` or `server/` in app code, and `package.json` has no script for it. `.env.example` still has an orphan comment about it. `turf-api/docs/frontend-reports.md` lists "mock server removed" as a checklist item.
- turf-api is a NestJS project (`turf-api/nest-cli.json`). Confirmed endpoints:
  - Dashboard: `GET /admin/dashboard/stats|attention|today` (`turf-api/src/dashboard/dashboard.controller.ts:16-31`).
  - Reports: `GET /admin/reports/summary|revenue|grounds|bookings|export` (`turf-api/src/reports/reports.controller.ts:21-45`).
  - Activity: `GET /admin/booking-events`, `GET /admin/slot-events`.
- Hardcoded content in the admin area: `ROLE_PERMISSIONS` (Staff > Roles), job and integration labels (`system-health.tsx`), 4 cycled calendar ground colours (`D/bookings/calendar/page.tsx`).
- A search for TODO, FIXME, "coming soon", "not implemented", stub, mock, demo, sample and fake in `src` found nothing in admin pages. Hits were limited to `demo data` comments in `src/types/api.ts:27,34` and portal code. `src/lib/portal-stub-data.ts` holds only display labels.

### Inferences
- New dashboard widgets can often start as frontend work when the API already returns the data. Anything needing new metrics means a turf-api change as well, because the admin repo has no `src/app/api` and no database access.

### Gaps
- Whether the deployed environment uses the same endpoints was not checked. `.env.local` and Vercel configuration were not read.
- The API doc's claim that the reports are "covered by e2e tests" was not verified by running them.

## Which gaps or half-finished features are visible?

### Takeaway
There are few broken features. The gaps are unused data and API capability, weak error handling on the dashboard, and a set of operational features that do not exist at all.

### Cited Findings

**Stubs and inconsistencies**
- Topbar bell does nothing (`src/components/topbar.tsx:40-42`).
- Staff > Roles text conflicts with API access for reports (see section above).
- "Add Ground" quick action shows to managers, but the page returns NoPermission (`D/page.tsx:21-26`; `D/grounds/new/page.tsx:23`).
- Route `/bookings/confirmed` actually holds the pending queue (`D/bookings/confirmed/page.tsx`).

**API capability the UI does not use**
- Reports accept custom `from`/`to` and `groupBy` (`turf-api/docs/frontend-reports.md`), but report pages offer only presets and never pass `groupBy` (`D/reports/revenue/page.tsx`, `src/hooks/useReports.ts`).
- The bookings hook supports `from`, `to` and `sort` (`src/hooks/useBookings.ts:15-26`), but the list page has no date filter and passes neither (`D/bookings/page.tsx`, `bookings-filters.tsx`).
- `ActivityPage` returns `total` and `page` (`src/types/dashboard.ts:57-62`), but there is no "view all" or full booking activity page; only the 10 latest appear. Slots have a full activity page, bookings do not.

**Returned data not displayed**
- `TodayGround.bookedHours`, `openingHour`, `closingHour` and `slots.held` are not rendered as text in `today-grounds.tsx`.
- `RevenuePoint.received` and `refunds`, and `BookingPoint.total`, are not plotted (`report-charts.tsx:432-490`).
- Utilization exists only in the Reports area and is not on the home page (`D/reports/bookings/page.tsx`).

**Dashboard error and refresh behaviour**
- Attention cards and Today's Money show a skeleton on `isLoading || !data`, so a failed request appears to load forever (`attention-cards.tsx:385`, `today-money.tsx:910`).
- The charts branch only on `isLoading`, so a failure renders an empty chart or a "no bookings" message (`dashboard-charts.tsx:490,520`).
- KPI cards and Today's Money have no refetch interval, while the attention cards refresh every 60s, so numbers can disagree on a page left open (`useDashboard.ts:15-20`, `today-money.tsx:902`).

**Features with no code found** (case-insensitive search of the admin features, hooks, lib, types and `turf-api/src`, 0 hits in both repos)
- Waitlist, membership, invoice, no-show, check-in, heatmap, tournament or league, equipment or rental, expense, broadcast or campaign, coupon, discount or promo.
- Recurring appears in admin only for weekly slot blocks (`block-slot-form.tsx:25`), so no recurring-booking UI was found.
- Receipt hits I checked in admin are icons (`Receipt`, `ReceiptText`), so no customer receipt feature was seen in the UI.

**Engineering state**
- 0 test files in `src`, and no test script in `package.json`.
- 0 references to `ErrorBoundary`, and no `error.tsx` found.
- `jspdf`, `jspdf-autotable`, `papaparse`, `zustand` and `nuqs` are in `package.json` with 0 static imports in `src`; the README's "PDF generation (invoices)" is not implemented.

### Inferences
- Lowest-cost candidates are the ones using existing API support: custom report dates, booking date filter, a booking activity page, utilization on the home page, and a working notification bell.
- Attendance tracking (no-show, check-in) would need a schema and API change, because `BookingStatus` has only pending, confirmed, cancelled and completed (`src/types/booking.ts`).

### Gaps
- Keyword absence is not proof of absence: a feature under another name would be missed.
- `recurring` has 3 file hits in turf-api, `receipt` 1, `review` and `audit` several, and these API hits were not all inspected. Recurring-booking support in the API is therefore not ruled out.

## What constraints shape new features?

### Takeaway
The stack can support most dashboard additions without new libraries. The main constraint is that CLAUDE.md no longer matches the code on stack, analytics, pricing and payment methods, so a few scope rules need an owner decision before features are judged against them.

### Cited Findings

**v1 exclusions** (`CLAUDE.md`, "What Is NOT in v1")
- Do not implement: mobile app or native features; coupon or discount codes; SMS notifications (email only); loyalty or points; UPI, wallets or multiple payment methods; multi-vendor or multi-branch; advanced analytics beyond daily/weekly revenue CSV.
- Also from Key Business Rules: pricing is fixed per ground per hour with no dynamic pricing; cancellation is a full refund to the original method; soft delete only.

**Where the code already differs from those rules**

| Rule in CLAUDE.md | What the code does | Evidence |
|---|---|---|
| Analytics limited to daily/weekly revenue CSV | Charts, trends, utilization, completion and cancellation rates, bookings and customers export, Excel, monthly grouping | `D/reports/*`, `src/lib/report-export.ts` |
| No dynamic pricing | Peak price and peak hour ranges per ground | `turf-api/prisma/schema.prisma` (`peakPrice`, `peakRanges`), `D/grounds/[id]/page.tsx:204-216` |
| No multiple payment methods | Card, cash and bank transfer recorded; portal pay at venue | `src/types/booking.ts`, `payment-methods-card.tsx` |
| SMS notifications excluded | SMS is used for customer sign-in codes, not notifications, so this is not a direct conflict, but Twilio is present | `turf-api/src/customer-auth/customer-auth.controller.ts:14`, `turf-api/src/sms/sms-verify.service.ts` |
| Next.js 14, Express | Next `^16.2`, React 19, NestJS API | `package.json`, `turf-api/nest-cli.json` |
| Server Components by default | 31 files in the admin route group use `"use client"`, against 33 `page.tsx` files; data fetching is client-side react-query | `src/app/(admin)`, `src/hooks/*` |
| Unit and integration tests, error boundaries | None in this repo; turf-api has spec files | see gaps section; `turf-api/src/dashboard/*.spec.ts` |

**Role model**
- Two roles only, admin and manager (`CLAUDE.md` section 7; `src/types/settings` via `USER_ROLES`).
- Dashboard and report endpoints use `AuthGuard` with no role restriction, so both roles see all of them, including revenue (`turf-api/src/dashboard/dashboard.controller.ts:7-8`, `turf-api/src/reports/reports.controller.ts:12-14`).
- Admin only: staff, settings changes, grounds create and edit, slot generation, closures, customer delete, system status (`@Roles('admin')` in the matching turf-api controllers).
- `src/proxy.ts` checks only that the cookie exists. Real authorization is in turf-api, and the UI hides controls by `me?.role`.

**Stack actually in use** (`package.json`; import counts from `src`)
- recharts 2 files, `@tanstack/react-table` 3, `@tanstack/react-query` throughout `src/hooks`, `xlsx` 1, `cmdk` 1 (global search), plus react-hook-form with zod and date-fns.

**Conventions a new feature must fit**
- Money is in minor units, currency is taka, dates are Asia/Dhaka, and weeks start on Saturday (`turf-api/docs/frontend-reports.md`).
- Reports allow at most 366 days (same doc).
- File limit 300 lines, function limit 40, named exports (`CLAUDE.md`).

### Inferences
- Under a literal reading of the exclusion, any new analytics widget is out of scope, yet Reports already exceeds it. Owner input is needed: treat the rule as superseded, or freeze analytics.
- Excluded items in competitor findings (coupons, loyalty, SMS reminders, mobile app, online wallets, multi-branch) should be marked out of scope for v1, not simply as gaps.
- Because all roles can read revenue, any owner-only financial widget would be a new access rule and would need API changes.

### Gaps
- No document explains whether the differences from CLAUDE.md were deliberate. Commit history was not reviewed for this, so CLAUDE.md may simply be out of date.
- Exact manager rights for bookings and refunds were checked only by the absence of `@Roles` in `turf-api/src/bookings/admin-bookings.controller.ts`, not by testing.
