# Open-source turf and court booking projects: admin dashboard features

Research date: 2 Nov 2026. Stars and last-push dates come from the public GitHub API on that date. Line-number links point at the moving default branch, so they may drift.

Scope labels used throughout:
- **[OUT: v1]** is excluded by the v1 scope (mobile app, coupons/discounts, SMS, loyalty/points, multiple payment methods, multi-vendor/multi-branch, analytics beyond daily/weekly revenue CSV). Dynamic pricing is also marked this way because the project's CLAUDE.md rules it out ("fixed, no dynamic pricing in v1").
- **[NOT IN SPEC]** is not excluded, but is not in the v1 spec either, so it needs a product decision.

Evidence labels:
- **Code**: I read the source.
- **Docs**: only the README or docs claim it.
- **Search only**: seen in a search summary, repository not read.

## Which GitHub or GitLab projects are most relevant?

### Takeaway
Only about four turf projects are worth studying: oyun, TurfHub, Bookit 5s Arena, and to a lesser degree TurBD. All have very low star counts, so none is proven by adoption. The mature references are adjacent products (Easy!Appointments, LibreBooking, Cal.com/Cal.diy), and the turf repositories are mostly student or portfolio work.

### Cited Findings

**Turf, futsal and court projects**

| Project | Stars | Last push | Stack | Status assessment | Evidence |
|---|---|---|---|---|---|
| [devcnisham/oyun](https://github.com/devcnisham/oyun) | 1 | 2026-11-02 | Next.js 16, React 19, Supabase Postgres, Clerk, Vitest, Playwright | Actively developed, with CI and detailed docs, but no adoption signal. Multi-vendor marketplace. | Code + Docs |
| [rahat9016/turf-booking-management](https://github.com/rahat9016/turf-booking-management) (TurfHub) | Not retrieved | Not retrieved | Next.js, React, Tailwind; localStorage backend | Front-end demo with good admin UX. Single venue. | Code + Docs |
| [Kopano-Labs/Bookit-5s-Arena](https://github.com/Kopano-Labs/Bookit-5s-Arena) | 9 | 2026-11-02 | Next.js 16, MongoDB/Mongoose, NextAuth, Stripe | Active portfolio project, broad but uneven. At least one admin screen is mock data. | Code + Docs |
| [Azad-2025/TurBD](https://github.com/Azad-2025/TurBD) | 0 | 2026-10-30 | React 19, Express, Postgres, Drizzle | Active, unproven, marketplace-style. | Docs only |
| [RijoKsd/TurfSpot](https://github.com/RijoKsd/TurfSpot) | 22 | 2025-06-09 | MERN, Redux, Razorpay | Highest-starred turf repo found. Portfolio/demo. | Docs |
| [Mukesh1203MT/Turf_Booking_System](https://github.com/Mukesh1203MT/Turf_Booking_System) | 18 | 2026-07-27 | pnpm monorepo, Next.js web + API | Its README calls it a "scaffold" and lists no features. | Docs |
| [muhazmi/futsal](https://github.com/muhazmi/futsal) | 33 | 2024-12-06 | PHP 7.2, SQLite/MySQL, AdminLTE 2 | Dated Indonesian tutorial-style project. Highest-starred futsal result. | Docs |
| [adroste/tennis-court-reservation-system-v2](https://github.com/adroste/tennis-court-reservation-system-v2) | 17 | 2021-10-03 | React SPA, PHP 7, MySQL; AGPL | Dormant; its README says "still in development". | Docs |
| [ani1100/turfers](https://github.com/ani1100/turfers) | 10 | 2023-11-05 | MERN | Student/demo. | Docs |
| [kalytamykhailo18-cyber/Multi-tenant-sports-facility-booking-platform](https://github.com/kalytamykhailo18-cyber/Multi-tenant-sports-facility-booking-platform) | 6 | 2026-02-04 | NestJS, Next.js 14, Prisma, Redis, BullMQ | Multi-tenant; README lists no dashboard features. | Docs |
| [soham7391/Turf-Arena](https://github.com/soham7391/Turf-Arena) | 3 | 2026-06-22 | React, Flask, Postgres | Student/portfolio. | Docs |
| [niyati34/box_cricket](https://github.com/niyati34/box_cricket) | 2 | 2025-08-20 | PHP, MySQL, PHPMailer | Small demo. | Docs |
| [AbijithT7/turf-booking](https://github.com/AbijithT7/turf-booking) | 0 | 2026-10-25 | HTML front end + API | Its README calls itself a "demo". | Docs |
| [TANISHA3665/turf-flow](https://github.com/TANISHA3665/turf-flow) | 0 | 2026-08-16 | Next.js, NestJS, Postgres, Prisma (topic tags) | Closest stack match, but no README at the root and contents not retrieved. Not assessed. | Metadata only |

**Mature adjacent projects**

| Project | Stars | Last push | Stack | Status | Evidence |
|---|---|---|---|---|---|
| [alextselegidis/easyappointments](https://github.com/alextselegidis/easyappointments) | 4,473 | 2026-10-26 | PHP; GPL-3.0 | Maintained | Code + Docs |
| [LibreBooking/librebooking](https://github.com/LibreBooking/librebooking) | 842 | 2026-11-01 | PHP, Bootstrap 5; GPL-3.0 | Maintained | Code + Docs |
| [calcom/cal.diy](https://github.com/calcom/cal.diy) | 49,632 | 2026-11-02 | Next.js, tRPC, Prisma; MIT | Maintained community edition. The API's `calcom/cal.com` path now redirects here. | Code + Docs |

- Cal.diy is "a fork of Cal.com with all enterprise/commercial code removed". Teams, Organizations, Insights and Workflows were removed, and it is "strictly recommended for personal, non-production use" — [Cal.diy README](https://github.com/calcom/cal.diy/blob/main/README.md)
- LibreBooking warns that all versions before 7.1.0 have a critical vulnerability — [LibreBooking docs](https://librebooking.readthedocs.io/en/latest/)
- oyun's own tracker rates its gateway "Not started (advance is recorded, not charged)" and notifications "Not started", and notes a single env credential for admin — [FEATURE-LIST.md](https://github.com/devcnisham/oyun/blob/main/docs/FEATURE-LIST.md)
- TurfHub describes itself as a "Demo backend ... one JSON document in localStorage" — [store.ts](https://github.com/rahat9016/turf-booking-management/blob/main/src/lib/turf-store/store.ts)
- The Pasio Padel Club default branch is a "static showcase site (no backend, no auth, no payments)"; its fuller `main` branch was not inspected — [pasiopadelclub](https://github.com/viclafouch/pasiopadelclub/tree/production-v1-vercel)

### Inferences
- Star counts say little in this niche. The best-engineered turf repo (oyun) has 1 star and the highest-starred (futsal, 33) is a dated tutorial-style project. Read these as pattern sources, not validated products.
- TurfHub is the nearest functional match to this project (single venue, front desk). oyun is the nearest technical match (Next.js + Postgres). Neither matches on payment: TurfHub uses bKash/Nagad/cards as a demo, and oyun's gateway is Razorpay and unfinished.

### Gaps
- GitLab was not searched, so this covers GitHub only. `gh` was not installed, so I used the unauthenticated GitHub API, raw file fetches and web search.
- The "court booking" and "badminton court booking" API searches failed with unparseable responses and were not re-run, so generic court projects are under-sampled. A web search only partly covered them.
- TurfHub's stars and last-push date could not be retrieved: its API lookups failed.
- [wlong0711/SportHall](https://github.com/wlong0711/SportHall) (0 stars, pushed 2026-02-02) was confirmed to exist, but its features were seen in a search summary only. PadelClub, SmartCourt and the WordPress court plugins were also search-only, so they are not assessed here.
- [Qloapps/QloApps](https://github.com/Qloapps/QloApps) (14,457 stars, hotel reservations) was checked for metadata only.

## What does each admin dashboard include?

### Takeaway
Turf dashboards reliably cover bookings, slot blocking and basic settings. KPIs and CSV exports are less common, and I found no working audit log in any turf project I could read. Bookit's audit page looks complete but runs on hard-coded mock data.

### Cited Findings

**Feature matrix.** Y = confirmed in code, D = claimed in docs/README, M = mock UI only, – = not found in what I inspected (this is not proof of absence).

| Feature | oyun | TurfHub | Bookit | TurfSpot | Easy!Appt | LibreBooking | Cal.com (hosted) |
|---|---|---|---|---|---|---|---|
| KPI cards | Y | Y (money) | Y | D | – | – | D |
| Charts | Y (7-day data) | – | Y (trend data) | D | – | – | D |
| Calendar view | Y (day/week) | – | – | – | Y | D | – |
| Booking list + filters | Y | Y | Y | – | Y | Y | D |
| Walk-in/manual booking | D | Y | – | – | Y | D | – |
| Customer management | D | – | D | D | Y | Y | – |
| Reports | D | Y (ledger) | Y | D | – | Y | D |
| CSV export | Y | – | M | – | – | Y | D |
| Audit log | – (see below) | – | M | – | – | – | D |
| Slot/time blocking | D | Y | – | – | Y | Y | – |
| Settings | Y | Y | D | – | Y | Y | – |
| Staff roles | Y | – | Y | D | Y | D | D |

**Per-project detail**

**oyun** (partner dashboard is the relevant part)
- Partner pages include bookings, calendar, check-in, courts, pricing, slots, staff, payouts, reviews and analytics — [partner routes](https://github.com/devcnisham/oyun/tree/main/src/app/partner/%28dashboard%29)
- The home page computes monthly revenue, today's list, today's occupancy, no-shows, attendance rate, a 7-day revenue trend, daily average and a next-booking spotlight — [partner page.tsx](https://github.com/devcnisham/oyun/blob/main/src/app/partner/%28dashboard%29/page.tsx)
- The calendar has day and week views with free/past/blocked/held cell states, and navigation is link-based. I found no drag code in the grep — [calendar page.tsx](https://github.com/devcnisham/oyun/blob/main/src/app/partner/%28dashboard%29/calendar/page.tsx)
- Staff permissions: "front desk = bookings, checkin, slots; manager adds pricing, offers, addons, turf; owner adds staff and payouts" — [AUTHORIZATION.md](https://github.com/devcnisham/oyun/blob/main/docs/AUTHORIZATION.md)
- Tracker claims: manual blocking, walk-ins, QR check-in desk, no-show marking, refunds and disputes queue, review moderation — [FEATURE-LIST.md](https://github.com/devcnisham/oyun/blob/main/docs/FEATURE-LIST.md)
- Out of scope: promo codes **[OUT: v1]**, wallet/referrals **[OUT: v1]**, dynamic pricing **[OUT: v1]**, turf verification and commission **[OUT: v1]**, multi-language **[NOT IN SPEC]** — [FEATURE-LIST.md](https://github.com/devcnisham/oyun/blob/main/docs/FEATURE-LIST.md)

**TurfHub**
- Routes: bookings list, front-desk new booking, booking detail with payment recording and cancellation, payments, content/pricing, gallery, settings — [README](https://github.com/rahat9016/turf-booking-management/blob/main/README.md)
- Booking search covers name, phone, code and team, with saved views and counts — [BookingsList.tsx](https://github.com/rahat9016/turf-booking-management/blob/main/src/components/turf/admin/BookingsList.tsx)
- The payments page has transactions/due/refunds tabs, "To collect" and "To refund" money cards, and advance/balance/refund entry kinds — [Payments.tsx](https://github.com/rahat9016/turf-booking-management/blob/main/src/components/turf/admin/Payments.tsx)
- Out of scope: bKash/Nagad **[OUT: v1]** and "dynamic pricing" **[OUT: v1]** — [README](https://github.com/rahat9016/turf-booking-management/blob/main/README.md)

**Bookit 5s Arena**
- The stats API returns total/upcoming bookings, total and paid revenue, a revenue trend, peak hours, court breakdown, status counts, average booking value, paid/unpaid/refunded counts and recent bookings — [stats route](https://github.com/Kopano-Labs/Bookit-5s-Arena/blob/main/app/api/admin/stats/route.js)
- The audit page filters a `MOCK_LOG_ENTRIES` constant, and its stats and "Export CSV" button sit on the same page. The file also hard-codes a super-admin email in a client component — [audit page](https://github.com/Kopano-Labs/Bookit-5s-Arena/blob/main/app/admin/audit/page.jsx)
- The admin bookings route filters by date, status and court but applies no limit or pagination — [bookings route](https://github.com/Kopano-Labs/Bookit-5s-Arena/blob/main/app/api/admin/bookings/route.js)
- Out of scope: "Referral System & Loyalty Points" **[OUT: v1]** and AI venue analytics **[OUT: v1]** — [README](https://github.com/Kopano-Labs/Bookit-5s-Arena/blob/main/README.md)
- It also has competitions/leagues and a WhatsApp integration route **[NOT IN SPEC]** — [admin routes](https://github.com/Kopano-Labs/Bookit-5s-Arena/tree/main/app/api/admin)

**Smaller turf projects** (Docs only)
- TurfSpot: owner dashboard with transaction and booking graphs; admin handles owner approval, user/owner lists and monthly transaction graphs. Owner approval is **[OUT: v1]** (multi-vendor) and Razorpay does not match the Stripe-only scope — [README](https://github.com/RijoKsd/TurfSpot)
- TurBD: its file tree lists an `AdminPanel` with "venue verification & audits" and a `reports.ts` for "business analytics & revenue reports". bKash, Nagad and SSLCommerz are **[OUT: v1]** — [README](https://github.com/Azad-2025/TurBD)
- turfers: owners register turf details, schedule slots and check per-day bookings with customer details — [README](https://github.com/ani1100/turfers)
- box_cricket: admin manages grounds, slots and bookings; superadmin manages users and roles; QR check-in — [README](https://github.com/niyati34/box_cricket)
- AbijithT7/turf-booking: admin blocks/unblocks slots and reviews bookings; holds and refunds are explicitly not implemented — [README](https://github.com/AbijithT7/turf-booking)
- Turf-Arena: admin turf deletion "scrubs" associated reservation records first, which conflicts with this project's soft-delete rule — [README](https://github.com/soham7391/Turf-Arena)
- tennis-court-reservation-system-v2: kiosk mode with an auto-refreshing reservation table, plus page and reservation analytics — [README](https://github.com/adroste/tennis-court-reservation-system-v2)

**Adjacent products**
- Easy!Appointments lists "Appointment and customer management", "Working plans and booking rules", Google Calendar sync and email notifications — [README](https://github.com/alextselegidis/easyappointments)
- Its controllers include Calendar, Customers, Blocked_periods, Unavailabilities, Webhooks, Booking_settings, Ldap_settings, Admins, Providers and Secretaries — [controllers](https://github.com/alextselegidis/easyappointments/tree/develop/application/controllers)
- LibreBooking covers schedules, resources, blackouts, accessories, quotas, approvals, credits, saved and emailed reports, reservation CSV export, and application/group/resource/schedule administrators — [Administration docs](https://librebooking.readthedocs.io/en/latest/ADMINISTRATION.html)
- Its admin pages include ManageReservations, ManageBlackouts, ManageQuotas, ManageEmailTemplates, ManagePayments and CreditLog — [Pages/Admin](https://github.com/LibreBooking/librebooking/tree/develop/Pages/Admin)
- Cal.com Insights has Events KPIs (total, completed, rescheduled, cancelled) and Performance KPIs (average rating, host and guest no-show rates, CSAT), plus trend charts, popular events and top cancellation/reschedule reasons. CSV download reflects the current filters — [Insights help](https://cal.com/help/bookings/insights)
- Cal.com audit logs cover booking events, routing form edits with before/after values, and security events including failed logins. They are viewable only in-app: "Export functionality is not available at this time" — [Audit logs help](https://cal.com/help/enterprise/audit-logs)

### Inferences
- The minimum dashboard shared by the credible single-venue examples is: today's bookings and KPIs, a searchable booking list, booking detail with cancel/refund, manual booking, slot blocking, and venue settings.
- A screen existing does not mean the feature works. Bookit's audit page shows this, so the README claims for TurBD's "audits" and similar should be treated as unverified.
- The matrix understates the smaller repositories because they were assessed on README text alone.

### Gaps
- Screenshots were not reviewed; assessment comes from text and code.
- oyun has `src/modules/partner/database/activity.ts`, which I did not read. It may be an activity feed, so oyun's audit status is unconfirmed.
- Bookit's real analytics page and its calendar capability were not fully read.
- Customer management in Cal.com and calendar views in LibreBooking were not confirmed from primary pages.

## Which features recur, and which implementation patterns are worth borrowing?

### Takeaway
The most valuable patterns to borrow are database-enforced double-booking protection, expiring slot holds, a payment ledger with "to collect/to refund" totals, and formula-safe CSV export. Drag-to-reschedule is proven in Easy!Appointments but is optional for v1.

### Cited Findings

**Recurring features**
- Manual slot blocking appears in oyun, TurfHub (`Block` type), AbijithT7/turf-booking and, as blackouts or blocked periods, in LibreBooking and Easy!Appointments — sources in the previous section.
- QR check-in appears in oyun, box_cricket and TurfSpot's confirmation email **[NOT IN SPEC]** — [oyun](https://github.com/devcnisham/oyun/blob/main/docs/FEATURE-LIST.md); [box_cricket](https://github.com/niyati34/box_cricket); [TurfSpot](https://github.com/RijoKsd/TurfSpot)

**Conflict detection and slot locking**
- oyun's live store uses a partial unique index on `(turf_id, slot_date, slot_hour)` where status is `confirmed` or `checked_in`, so cancelled rows do not block a slot — [migration, L41](https://github.com/devcnisham/oyun/blob/main/supabase/migrations/20261006000000_oyun_store.sql#L41)
- oyun's v2 design uses a Postgres exclusion constraint on resource and time range, plus `pg_advisory_xact_lock` on each resource in a fixed order. Without the lock, 2 of 10 race runs ended in deadlock errors; with it, 14 of 14 had exactly one winner — [SLOT-BOOKING-DB.md](https://github.com/devcnisham/oyun/blob/main/docs/SLOT-BOOKING-DB.md)
- oyun holds slots for 8 minutes per device, and its v2 design moves online bookings through `pending_payment` for 15 minutes. A late payment re-claims the slot if free, otherwise it returns `refund_needed` — [FEATURE-LIST.md](https://github.com/devcnisham/oyun/blob/main/docs/FEATURE-LIST.md); [SLOT-BOOKING-DB.md](https://github.com/devcnisham/oyun/blob/main/docs/SLOT-BOOKING-DB.md)
- oyun's admin dashboard shows a blocking banner when production storage is not Supabase, and a test fails if a server action loses its guard — [FEATURE-LIST.md](https://github.com/devcnisham/oyun/blob/main/docs/FEATURE-LIST.md); [AUTHORIZATION.md](https://github.com/devcnisham/oyun/blob/main/docs/AUTHORIZATION.md)
- Cal.diy keeps temporary reservations in a `SelectedSlots` table with a `releaseAt` timestamp — [schema.prisma, L1437](https://github.com/calcom/cal.diy/blob/main/packages/prisma/schema.prisma#L1437)
- Bookit does a read-then-check overlap test in application code and returns 409, alongside an unconditional unique index on court, date and start time — [bookings route](https://github.com/Kopano-Labs/Bookit-5s-Arena/blob/main/app/api/bookings/route.js); [Booking model](https://github.com/Kopano-Labs/Bookit-5s-Arena/blob/main/models/Booking.js)
- Easy!Appointments checks overlap with `existing_start < new_end AND existing_end > new_start`, and exposes a pre-save conflict endpoint so the question comes before notifications. It also allows a `force_save` override — [Appointments_model.php, L734](https://github.com/alextselegidis/easyappointments/blob/develop/application/models/Appointments_model.php#L734); [Calendar.php, L289](https://github.com/alextselegidis/easyappointments/blob/develop/application/controllers/Calendar.php#L289)

**Calendar and drag-to-reschedule**
- Easy!Appointments uses FullCalendar-style day, week and month views, defaulting to day view on narrow screens and week otherwise, and also ships a table view — [calendar_default_view.js, L1309](https://github.com/alextselegidis/easyappointments/blob/develop/assets/js/utils/calendar_default_view.js#L1309); [calendar_table_view.js](https://github.com/alextselegidis/easyappointments/blob/develop/assets/js/utils/calendar_table_view.js)
- Its drag handler asks whether to notify users, reverts if that is declined, and offers an undo after saving — [onEventDrop, L559](https://github.com/alextselegidis/easyappointments/blob/develop/assets/js/utils/calendar_default_view.js#L559)

**Payments ledger and exports**
- TurfHub models money as signed advance/balance/refund entries and derives what is due and what is owed back — [Payments.tsx](https://github.com/rahat9016/turf-booking-management/blob/main/src/components/turf/admin/Payments.tsx)
- oyun's bookings CSV neutralises leading `= + - @` so a customer name cannot run as a spreadsheet formula, checks permission before export, and sets `no-store` — [export route](https://github.com/devcnisham/oyun/blob/main/src/app/partner/%28dashboard%29/bookings/export/route.ts)
- LibreBooking exposes reservation CSV export from its filtered list — [ManageReservationsPage.php](https://github.com/LibreBooking/librebooking/blob/develop/Pages/Admin/ManageReservationsPage.php)

**Audit trail**
- Cal.diy stores `cancellationReason`, `cancelledBy`, `rescheduledBy` and `noShowHost` directly on bookings — [schema.prisma, L880](https://github.com/calcom/cal.diy/blob/main/packages/prisma/schema.prisma#L880)

### Inferences

Suggested priorities for this project (my judgement, not sourced):

| Pattern | Recommendation | Reason |
|---|---|---|
| DB-enforced slot uniqueness | Borrow now | Directly supports the no-double-booking rule; application checks alone can race |
| Expiring hold during Stripe Checkout | Borrow now | Also needs a late-payment path, like oyun's `refund_needed` |
| Late-payment refund handling | Borrow now | A Stripe webhook can arrive after a hold expires |
| Payment ledger with to-collect/to-refund | Borrow, simplified | Fits Stripe refund tracking; advance/balance only applies if pay-at-venue is allowed |
| Formula-safe, permission-checked CSV | Borrow now | Fits the revenue CSV, which is in scope |
| Booking search by name/phone/code | Borrow now | Cheap and core to front-desk use |
| `cancelledBy` / reason fields | Borrow now | Low-cost start to an audit trail |
| Append-only audit table | Consider for v1 | No turf example to copy; the Bookit screen is a useful warning |
| Day/week calendar, read-only | Consider for v1 | oyun shows that link-based navigation is enough |
| Drag-to-reschedule | Defer | Interacts with Stripe, notifications and conflicts |
| Conflict `force_save` override | Do not borrow | Would break the no-double-booking rule |
| Hard deletes (Turf-Arena) | Do not borrow | Violates the soft-delete rule |
| Unpaginated admin lists (Bookit) | Do not borrow | Violates the pagination rule |

Two project-specific tensions need a decision:
- Partial unique indexes and exclusion constraints generally need hand-written SQL in a Prisma migration, while CLAUDE.md says not to use raw SQL. That rule appears aimed at queries, so confirm that migration SQL is acceptable.
- CLAUDE.md's array-style `$transaction` example does not itself check `status === 'available'`. The check needs to be part of the write (for example a conditional update whose affected-row count is verified) or be backed by a DB constraint. I did not review this repository's current booking code, so it may already handle this.

An unconditional unique index like Bookit's would appear to keep a cancelled slot blocked unless the row is removed. oyun's partial index avoids that. I did not test Bookit's behaviour, and it may handle this elsewhere.

### Gaps
- oyun's `SLOT-BOOKING-DB.md` says v2 is "not wired into the app yet", but later migrations named `v2_*` exist. Which path runs in production was not established, and the race-test figures are the author's own, not independently reproduced.
- I did not trace how Cal.diy enforces hold expiry at booking time, only that the table exists.
- I found no turf project with drag-to-reschedule, though the search was not exhaustive.

## Which features do mature adjacent projects have that small turf projects usually lack?

### Takeaway
Mature systems are stronger on operational controls rather than on more charts: booking rules, approvals, notification templates, webhooks/API, access scoping and history. Only a few of these belong in a single-venue v1, and several of the most visible ones are out of scope.

### Cited Findings

| Mature feature | Where | Turf projects | v1 relevance |
|---|---|---|---|
| Lead times, buffers, min/max duration | [LibreBooking](https://librebooking.readthedocs.io/en/latest/ADMINISTRATION.html) | Partial (oyun's booking window) | Useful, as simple settings |
| Blackouts for maintenance and recurring closures | [LibreBooking](https://librebooking.readthedocs.io/en/latest/ADMINISTRATION.html); [Easy!Appointments](https://github.com/alextselegidis/easyappointments/blob/develop/application/controllers/Blocked_periods.php) | Single-slot blocking is common; ranges are rarer | Useful: date-range blocking |
| Working-plan exceptions | [Easy!Appointments API](https://github.com/alextselegidis/easyappointments/blob/develop/application/controllers/api/v1/Working_plan_exceptions_api_v1.php) | Not seen | Useful for holiday hours |
| Editable email templates | [LibreBooking](https://github.com/LibreBooking/librebooking/blob/develop/Pages/Admin/ManageEmailTemplatesPage.php) | Not seen | **[NOT IN SPEC]**, later |
| Saved, scheduled and ad-hoc reports | [LibreBooking](https://librebooking.readthedocs.io/en/latest/ADMINISTRATION.html) | Not seen | **[OUT: v1]** beyond the revenue CSV |
| Period comparison, no-show rate, cancellation reasons | [Cal.com Insights](https://cal.com/help/bookings/insights) | oyun has no-shows and attendance | **[OUT: v1]** as analytics; capturing the reason field is cheap |
| Filtered CSV matching the current view | [Cal.com Insights](https://cal.com/help/bookings/insights) | oyun exports all rows | Useful for the revenue CSV date range |
| Audit logs with security events | [Cal.com](https://cal.com/help/enterprise/audit-logs) | Bookit mock only | Useful, in reduced form |
| Scoped administrators | [LibreBooking](https://librebooking.readthedocs.io/en/latest/ADMINISTRATION.html) | oyun has a three-level staff model | Two roles only in v1 |
| Approval workflow | [LibreBooking](https://librebooking.readthedocs.io/en/latest/ADMINISTRATION.html) | Not seen for bookings | **[NOT IN SPEC]**; instant booking fits better |
| Waitlists | [LibreBooking](https://github.com/LibreBooking/librebooking) | Planned, unbuilt in oyun | **[NOT IN SPEC]** |
| Quotas per user | [LibreBooking](https://librebooking.readthedocs.io/en/latest/ADMINISTRATION.html) | Not seen | **[NOT IN SPEC]** |
| Outbound webhooks and REST API | [Easy!Appointments](https://github.com/alextselegidis/easyappointments/blob/develop/docs/rest-api.md) | Not seen | **[NOT IN SPEC]** |
| Google Calendar sync, ICS | [Easy!Appointments](https://github.com/alextselegidis/easyappointments); [LibreBooking](https://github.com/LibreBooking/librebooking) | oyun offers a customer calendar file | **[NOT IN SPEC]** |
| LDAP, SAML, OAuth | [LibreBooking docs](https://librebooking.readthedocs.io/en/latest/) | Not seen | **[NOT IN SPEC]**, unnecessary |
| Usage credits with peak/off-peak rates | [LibreBooking](https://librebooking.readthedocs.io/en/latest/ADMINISTRATION.html) | Wallets in oyun | **[OUT: v1]** |

The reverse also holds. Turf projects often have domain features the mature tools lack in my inspection, such as walk-in desks, due/refund money views, QR check-in and no-show desks — [oyun](https://github.com/devcnisham/oyun/blob/main/docs/FEATURE-LIST.md); [TurfHub](https://github.com/rahat9016/turf-booking-management). A filename search of Easy!Appointments' controllers, page views and models also found no report, CSV export or audit files; the only "analytics" matches were Google and Matomo settings — [controllers](https://github.com/alextselegidis/easyappointments/tree/develop/application/controllers). So a mature project is not automatically ahead on reporting.

Availability caveat: Cal.com's Insights and audit logs are not in the MIT Cal.diy code, so they can be used as product references but not as code to study — [Cal.diy README](https://github.com/calcom/cal.diy/blob/main/README.md). Audit logs are "included with every Cal.com organization plan" — [Audit logs help](https://cal.com/help/enterprise/audit-logs). A Cal.com blog says Insights is "exclusive to paid subscribers", but that page shows conflicting dates (Jul 2024 byline vs Oct 2026 metadata), and the current help page does not state a plan — [Cal.com blog](https://cal.com/blog/how-cal-com-s-insights-dashboard-drives-organizational-success); [Insights help](https://cal.com/help/bookings/insights).

### Inferences
- The best v1 additions from this list are date-range blocking, holiday-hours exceptions, a cancellation reason field, date-filtered revenue CSV, and a small append-only audit table for admin actions (cancel, refund, block, settings changes, login failures).
- A useful differentiator for this project would be a real audit log. Of the turf projects I could read, none demonstrably has one.
- Most of what makes Cal.com large (teams, routing, round robin) does not map to one venue with fixed hourly slots, so it is a weak model for scope. LibreBooking's resource and schedule admin is a closer conceptual fit, and Easy!Appointments is the best reference for calendar interaction.

### Gaps
- "Turf projects" column entries mean not seen in the projects I inspected, not a census.
- The absence of reports and audit logging in Easy!Appointments is based on filenames only, not on reading the whole application. LibreBooking's docs page did not describe an activity log, but I did not search its full code for one.
- Cal.com's current open or closed source status beyond the Cal.diy README was not researched.
- I found no reliable data on which admin features turf operators actually use. Adoption data is absent for all of these repositories.
