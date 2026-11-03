# Admin/Owner Dashboard Features of Commercial Turf and Sports-Venue Booking Products

Researched 2026-11-02. Read this before relying on any finding.

**Evidence tags used on every product finding:**
- **[DOC]**: vendor help-center page opened and read through a fetch tool, which returns a model-written summary of the page. Treat quotes as close paraphrase.
- **[DOC-TITLE]**: only the help-center article title was seen. The feature exists, but its behaviour is unverified.
- **[DOC-SEARCH]**: vendor help page seen only as a search-tool summary. The page itself could not be opened.
- **[MKT]**: vendor marketing page, app-store listing, or an agency or procurement listing written from vendor claims. Marketing claim only.
- **[REV]**: user review, seen only through a search-tool summary. Capterra review pages returned HTTP 403, so individual reviews and their dates are not verified.
- **[3P]**: third-party summary. Biased sources are labelled.

**Access failures that limit this research:**
- All `helpmanager.playtomic.com` pages returned 403.
- Capterra product and review pages returned 403.
- The Bookteq G-Cloud listing returned 410 Gone.
- The Hudle Partner App Store page timed out.
- Search summaries did not always say which result a claim came from. Links on [REV], [3P] and search-summary findings for EZFacility, Omnify, Pitchbooking and CourtReserve are the best match within that result set, so check the page before quoting a specific claim.

**Scope tags:** `[OUT: mobile]`, `[OUT: coupons]`, `[OUT: SMS]`, `[OUT: loyalty]`, `[OUT: payment methods]`, `[OUT: multi-branch]` and `[OUT: analytics]` mark exclusions from the brief. `[OUT: dynamic pricing]` comes from the project's CLAUDE.md ("no dynamic pricing in v1"). `[UNCLEAR]` marks a feature neither list mentions.

## What does the admin dashboard home show, and what KPIs, calendar views and operational tools does each product offer?

### Takeaway
Published evidence for the actual landing screen is thin: only a few products describe a KPI set, and none of the sources read documents a home screen widget by widget. The best-documented KPI models are Skedda (utilisation definition and heat map), Playtomic (Revenue, Occupancy, Players and Payment Collection tabs) and, among turf-specific apps, Turf Manager (gross sales through cash-in-hand).

### Cited Findings

**Playtomic Manager (padel/racket, turf-adjacent)**
- [DOC-SEARCH] Reports sit in the left main menu. The club view has five tabs and the organisation view has three: Revenue, Occupancy, Players. The title also names Payment Collection. The fifth tab's name was not visible. — [Playtomic Help: Reports](https://helpmanager.playtomic.com/hc/en-gb/articles/43127115602961-Reports-in-Playtomic-Manager)
- [DOC-SEARCH] The Occupancy report counts tournaments and blocked hours as used court time. It adds average occupied hours per court per day and the number of courts with activity. An older article describes a "Max Capacity" chart that sets the occupancy denominator; the older Bookings and Others reports are retired. The sources differ on structure, and the newer pages are probably current. — [Playtomic Help: Reports](https://helpmanager.playtomic.com/hc/en-gb/articles/43127115602961-Reports-in-Playtomic-Manager); [Playtomic Help: Other reports](https://helpmanager.playtomic.com/hc/en-gb/articles/20534970068881-Other-reports)
- [DOC-SEARCH] Reports are downloadable, and the API is recommended for large extracts. Reports show aggregates by date, court, sport or product. Player-level detail lives in the Payments section. — [Playtomic Help: Reports](https://helpmanager.playtomic.com/hc/en-gb/articles/43127115602961-Reports-in-Playtomic-Manager)
- [DOC-SEARCH] The Schedule is the main calendar. Booking types are regular, recurring, open match, league match, private class, course class, holiday and blocking, each with its own configurable colour. — [Playtomic Help: Schedule basics](https://helpmanager.playtomic.com/hc/en-gb/articles/20560058451985-Schedule-basics)
- [DOC-TITLE] Staff can add, edit and remove customers. — [Playtomic Help: Customers](https://helpmanager.playtomic.com/hc/en-gb/articles/20535413988113)
- [MKT] Vendor claims 6,700+ clubs. — [Playtomic](https://playtomic.com/nl/playtomic-manager)

**CourtReserve (racket clubs)**
- [DOC] Admin settings cover organisation, courts and resources, billing, members, portal, reservations, bookings, instructors, events, widgets, notifications, additional features (POS, packages, integrations) and reports. The guide does not describe an admin dashboard home. — [CourtReserve New Admin Guide](https://help.courtreserve.com/en/articles/11164239-new-admin-guide)
- [DOC] Custom schedulers are visual calendars of courts, events, lessons and reservations. They can be filtered and shown to players, system users or both. — [CourtReserve New Admin Guide](https://help.courtreserve.com/en/articles/11164239-new-admin-guide)
- [DOC] Court Waitlisting notifies players when spots open. Auto-Refund supports thresholds that require manual approval. Admins can refund when courts are closed. Self check-in kiosks run on a tablet or desktop. System users include admins and sub-admins, with optional mandatory 2FA. The Attendance Tracker add-on "tracks attendance, not check-ins". — [CourtReserve New Admin Guide](https://help.courtreserve.com/en/articles/11164239-new-admin-guide)
- [DOC-TITLE] Scheduler articles cover Drag & Drop, Process Payments from the Scheduler, Enable Check-Ins, Changing Time Intervals, Hide Court Types, Display Custom Fields, Consolidated Scheduler Auto-Assign, Booking Courts on the Admin Panel, Reschedule a Court Booking, and Recurring Reservations and Lessons. — [CourtReserve Schedulers collection](https://help.courtreserve.com/en/collections/9210267-schedulers-on-admin-panel)
- [DOC-SEARCH] Refunds can be issued from the scheduler. — [CourtReserve Schedulers overview](https://help.courtreserve.com/en/articles/1503299-overview-schedulers)

**Skedda (generic space booking)**
- [DOC] The Insights Utilization dashboard has these KPIs: Utilization %, Bookings, Users, Busiest Time, and Check-in rate (only if check-in rules exist). Charts cover utilisation by weekday, a time-of-week heat map, a timeline and duration breakdown. Tables list top users and top spaces. — [Skedda Insights](https://support.skedda.com/en/articles/5807358-insights)
- [DOC] Utilisation = (regular user and internal booking time) / (hours of availability minus unavailable-type bookings, space-sharing blocks and buffers). Bookings outside availability hours are ignored. — [Skedda Insights](https://support.skedda.com/en/articles/5807358-insights)
- [DOC] Filters are date range (custom range up to 6 months), day of week, time of day, and space and user tags. Export is XLSX or CSV, with PDF via print. By default only Owners and System Admins can see Insights. — [Skedda Insights](https://support.skedda.com/en/articles/5807358-insights)
- [3P] A check-in analytics addition is reported as dated May 2026. It comes from a third-party summary that I could not tie to a confirmed Skedda release note. The KPI itself is confirmed by the help page above. — [Skedda Insights](https://support.skedda.com/en/articles/5807358-insights)

**Hudle Partner (India, multi-sport turf)**
- [MKT, search summary; store page timed out] Sport-wise occupancy dashboard, filterable by facility, booking type or time, with downloadable reports. `[OUT: mobile]` for the app form factor. — [Hudle Partner, App Store](https://apps.apple.com/us/app/-/id1569130632)
- [MKT] Slot system, "complex booking rules", payment collection and invoicing, staff roles and access control, exportable booking reports, real-time analytics on bookings, engagement and revenue trends, and memberships with billing reports. The page shows a "0% Commission" offer. The dashboard appears only as an image, with no capabilities described. — [Hudle: List your venue](https://hudle.in/list-your-sports-venue)
- [3P, vendor's development agency] The partner app handles walk-in customers who book at the venue. — [SquareBoat: Hudle](https://www.squareboat.com/clients/hudle)

**Playo Venue Partner Interface (India; developer TechMash, which also publishes the Playo consumer app)**
- [MKT] Facility scheduler, pricing engine by court, time, day and sport with discounts and promotions `[OUT: dynamic pricing, coupons]`, membership manager, real-time confirmations and reminders, and cloud analytics on engagement and utilisation. Version 1.5.1 dated 2025-09-09; no ratings or reviews. — [Venue Partner Interface, App Store](https://apps.apple.com/us/app/-/id1057092085)
- [MKT, search summary] The scheduler switches between sport categories and shows hourly reservations, with booking-status and revenue visualisations. — [Venue Partner Interface, mwm.ai](https://mwm.ai/apps/venue-partner-interface/1057092085)

**BookYourTurf Partner (turf-specific; weak market signal: first released 2026-06-13, 1 rating, under 1,000 downloads)**
- [MKT] Revenue dashboard, availability calendar, and book, block or unblock by venue and date. Booking approval and real-time alerts. Staff and expense tracking. Peak/off-peak pricing `[OUT: dynamic pricing]`, promo codes `[OUT: coupons]`, GST invoices, partner wallets `[OUT: payment methods]`, channel-partner commissions and multi-location `[OUT: multi-branch]`. Sports named are football, box cricket, badminton and pickleball. — [BookYourTurf Partner](https://mwm.ai/apps/bookyourturf-partner/6763787322)

**Turf Manager (turf-specific; weak signal: first released 2026-05-05, 0 ratings)**
- [MKT] The dashboard shows gross sales, discounts, net sales, profit, dues and cash-in-hand. Day/night session slot calendar. Bookings record paid, discounted and due amounts. Daily expense and monthly salary tracking, monthly PDF reports, and staff/user management. Walk-ins are not mentioned. `[OUT: mobile]` for the form factor. — [Turf Manager](https://mwm.ai/apps/turf-manager/6766165177)

**Bookteq (UK venues)**
- [MKT, search summary] Online bookings, payments, invoicing, block bookings and recurring payments. — [Capterra: Bookteq](https://www.capterra.com/p/211620/Bookteq/); [GetApp: Bookteq](https://www.getapp.com/customer-management-software/a/bookteq)
- [MKT, search summary of a UK government procurement document] In-system dashboards and ready-made booking and finance reports, CSV export of customers and bookings, availability blocking and double-booking prevention. Multi-venue `[OUT: multi-branch]` and multiple access levels are also listed. The second listing's claims could not be matched to a single URL. — [G-Cloud service definition](https://assets.applytosupply.digitalmarketplace.service.gov.uk/g-cloud-15/documents/705623/806807843973490-service-definition-document-2026-01-29-1550.pdf); [G-Cloud listing](https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/441138465132245)

**Pitchbooking (UK sports facilities)**
- [MKT, search summary] A manager dashboard handles configuration and financial reconciliation. Staff enter phone and email bookings manually. Facilities can be split into halves or thirds. Access is restricted by role (grounds, booking, finance), and grounds teams can view bookings on phones. Also memberships, reporting and marketing campaigns. Listed from about £15 per user per month, with a vendor claim of 1,000+ facilities. The search tool did not tie each fact to one URL, so these links are the result set. — [G-Cloud: Pitchbooking](https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/578712559994936); [GetApp: Pitchbooking](https://www.getapp.com/all-software/a/pitchbooking/); [Capterra: Pitchbooking](https://www.capterra.co.uk/software/1029863/pitchbooking)

**EZFacility (multi-sport facility)**
- [3P] Court, field and resource scheduling shares one calendar with league registration and memberships, with conflict detection. — [FitGap: EZFacility](https://us.fitgap.com/products/022788/ezfacility)
- [REV] Daily reports include deposit reports and expiring memberships. — [Capterra: EZFacility reviews](https://www.capterra.com/p/54308/EZFacility-Club-Management/reviews/?page=5)

**Upper Hand (sports training and facility)**
- [REV] Covers calendar, scheduling, income tracking, memberships, camps, POS and email lists. — [Capterra: Upper Hand reviews](https://capterra.com/p/151570/Upper-Hand/reviews/)

**Omnify (programs and facility rental)**
- [MKT] Multiple facilities by sport or schedule, recurring slot blocking, cancellation policies and waivers, automated updates to waitlisted members, participation and financial reports. The vendor's changelog says more waitlist reports are still in development. — [Omnify: Facilities](https://www.getomnify.com/solutions/facilities); [Omnify: Membership](https://www.getomnify.com/schedule-a-demo-2/membership-management); [Omnify changelog](https://getomnify.olvy.co/)

**MATCHi (racket sports)**
- [MKT] Booking, memberships, kiosk and digital signage, and automated light and entrance control. Vendor claim of about 3,000 venues appears in a secondary source. — [MATCHi Kiosk](https://playmore.matchi.com/en/matchi-insights/shaping-the-racket-sports-ecosystem-through-technology); [MATCHi About](https://www.matchi.se/about?lang=en)

**Mindbody (adjacent: appointments and classes)**
- [MKT, search summary] Cancellation windows are set per service category. Appointments change automatically to no-show 10 minutes after start. Late-cancel and no-show fees can be a percentage of the price. A no-show does not count as a visit in reports. — [Mindbody: Scheduling](https://www.mindbodyonline.com/en-gb/business/scheduling); [Mindbody: Product updates](https://www.mindbodyonline.com/business/product-updates?page=7); [Mindbody: Reporting](https://www.mindbodyonline.com/en-au/business/reporting)

### Inferences
- Treating the schedule as the primary work surface and reports as a separate area is the visible pattern in Playtomic and CourtReserve. This is inferred from menu structure, not from documented landing behaviour.
- Two KPI models emerge. Utilisation-led products (Skedda, Playtomic, Hudle) measure how full the courts are. Cash-led turf apps (Turf Manager, BookYourTurf) measure takings, dues and profit.
- Occupancy needs an explicit denominator definition. Skedda and Playtomic both document theirs, and they differ: Skedda removes blocked time from the denominator, while Playtomic counts blocked hours as used time. The same data can therefore give different percentages.

### Gaps
- No source shows a widget-level inventory of any product's home screen. Screenshots and demo videos were not examined.
- CourtReserve has an [Enterprise Dashboard article](https://intercom.help/courtreserve/en/articles/10113068-enterprise-dashboard) that was not opened.
- **Not researched:** Book A Court and any "Sportsbook/Sportskeeda-style" venue tools. No searches were run on them.
- **TurfTown:** only the consumer app was found ([App Store](https://apps.apple.com/app/id1490231308)). No owner-side tool was identified.
- **Skedda calendar views and recurring bookings:** not checked, because only the Insights article was read.

## Which features recur across most products, and which are differentiators?

### Takeaway
Across the 14 products compared, a resource calendar, revenue or finance reporting and memberships are the most widely evidenced. Slot blocking and staff access control are common. No product was shown to have a staff audit log, and no-show tracking was documented explicitly only in Mindbody. Both could be differentiators or documentation gaps, because this research did not read each product's full docs.

### Cited Findings

Each cell summarises the per-product findings and links in the section above, so links are not repeated here. `Y` = evidence found. `P` = partial or inferred. A blank cell means **not found in the sources read, not confirmed absent**.

| Feature | Playtomic | CourtReserve | Skedda | Hudle | Playo | BookYourTurf | Turf Manager | Bookteq | Pitchbooking | EZFacility | Upper Hand | Omnify | MATCHi | Mindbody | Count (Y+P) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Resource/time calendar | Y | Y | | Y | Y | Y | Y | P | Y | Y | Y | | | | 10 |
| Revenue/finance reports | Y | Y | | Y | Y | Y | Y | Y | Y | Y | P | Y | | | 11 |
| Memberships `[UNCLEAR]` | | Y | | Y | Y | | | | Y | Y | Y | Y | Y | | 8 |
| Blocks/maintenance/closures | Y | P | Y | | | Y | | Y | | | | Y | | | 6 |
| Staff roles/access | | Y | P | Y | | P | Y | Y | Y | | | | | | 7 |
| Staff-created bookings | P | Y | | Y | | Y | P | | Y | | | | | | 6 |
| Report export | Y | | Y | Y | | | Y | Y | | | | | | | 5 |
| Occupancy/utilisation `[OUT: analytics]` | Y | | Y | Y | Y | | | | | | | | | | 4 |
| Recurring/block bookings | Y | Y | | | | | | Y | | P | | | | | 4 |
| Payment taken or marked at venue | Y | Y | | | | | Y | | | | P | | | | 4 |
| Reconciliation/deposit reports | Y | | | | | | | | Y | Y | P | | | | 4 |
| Customer records | Y | Y | | | | | | P | | | P | | | | 4 |
| Check-in | | Y | Y | | | | | | | | | | | | 2 |
| Waitlist | | Y | | | | | | | | | | P | | | 2 |
| Split or shared pitch | | | Y | | | | | | Y | | | | | | 2 |
| Drag-and-drop rescheduling | | Y | | | | | | | | | | | | | 1 |
| Refund from calendar | | Y | | | | | | | | | | | | | 1 |
| Automatic no-show status | | | | | | | | | | | | | | Y | 1 |
| Staff audit log | | | | | | | | | | | | | | | 0 |

Cell notes:
- **Omnify's waitlist** is for programs and memberships, not court slots.
- **Skedda** has no revenue row because the Insights article lists no revenue KPI.
- **Bookteq's calendar** is "P" because the source describes availability management rather than a calendar view.
- **Bookteq's customer records** is "P", inferred only from its CSV export of customer data.
- **Upper Hand's customer records** is "P", inferred from a review complaint that mentions client profiles.

Other findings:
- CourtReserve's admin guide does not cover audit logging. — [CourtReserve New Admin Guide](https://help.courtreserve.com/en/articles/11164239-new-admin-guide)
- Skedda searches found no booking audit log. A G2 audit reference appeared to relate to visitor management rather than bookings, per a search summary. — [G2: Skedda features](https://g2.com/products/skedda/features)
- [DOC-TITLE, unverified] Smaller products also expose occupancy reporting, which adds weak support for it being common. — [Bookaball: court occupancy](https://knowledge-base.bookaball.com/en/how-do-i-use-court-occupancy); [OpenResa: occupancy rates](https://openresa.com/be-by/blog/post/id/366)

### Inferences
- **Likely table stakes for this project:** resource/time calendar, staff-created bookings, slot blocks, revenue reporting with export, role-based access, and customer records. Staff bookings and customer records have lower counts, but they are prerequisites for running a venue, so the low counts probably reflect thin documentation.
- **Common but outside v1:** occupancy reporting is a headline feature in the best-documented products, yet the v1 scope limits analytics to a daily/weekly revenue CSV. A decision is needed on whether a simple "booked hours / open hours" figure counts as excluded analytics.
- **Differentiators in this sample:** split-pitch modelling, calendar drag-and-drop, refunds from the calendar, automatic no-show marking, approval thresholds for automatic refunds, and kiosk or hardware integration.
- **Not established:** that audit logs are rare. Enterprise-oriented products may document them on pages not read here. An audit log would still suit this project, because its two-role model makes "who cancelled or refunded this" a practical question.
- The counts are floors that depend on documentation depth. They should not be quoted as market percentages, and the sample mixes racket clubs, generic space booking and very new turf apps.

### Gaps
- No product's complete documentation was read, so blank cells are weak evidence.
- Payout and settlement terms (timing, fees, statements) were not found for any marketplace product. Hudle's FAQ raises settlement frequency, but the answers were not visible on the fetched page. — [Hudle: List your venue](https://hudle.in/list-your-sports-venue)

## How do these products present booking calendars and walk-in or manual booking flows for staff?

### Takeaway
The documented pattern is a resource-by-time grid with colour-coded booking types and actions taken in place: book, block, reschedule, check in, collect payment, refund. Walk-in handling is usually an ordinary staff booking plus a payment status, and step-by-step flows were not verified for any product.

### Cited Findings
- [DOC-SEARCH] Playtomic separates booking types by colour on the Schedule, including blocking and holiday types. — [Playtomic Help: Schedule basics](https://helpmanager.playtomic.com/hc/en-gb/articles/20560058451985-Schedule-basics)
- [DOC-SEARCH] If a player pays at the club for an online booking, staff must mark that share as paid within 2 hours of the match ending. Otherwise the system charges the booking owner, and the club must refund them directly. — [Playtomic Help: Mark as paid](https://helpmanager.playtomic.com/hc/en-gb/articles/46928469100817-How-to-mark-a-booking-or-activity-as-paid-in-Playtomic-Manager)
- [DOC-TITLE] CourtReserve's scheduler has drag and drop, configurable time intervals, hidden resource types, custom fields on bookings, event notes, check-ins, payment processing and a consolidated auto-assign view. — [CourtReserve Schedulers collection](https://help.courtreserve.com/en/collections/9210267-schedulers-on-admin-panel)
- [DOC-SEARCH] CourtReserve lets each custom scheduler be shown to players, system users or both, and it must fall within standard operating hours. — [CourtReserve custom schedulers](https://intercom.help/courtreserve/en/articles/3669990-overview-custom-schedulers)
- [MKT, search summary] Playo's scheduler switches by sport category and shows hourly reservations. — [Venue Partner Interface, mwm.ai](https://mwm.ai/apps/venue-partner-interface/1057092085)
- [MKT] Turf Manager uses day and night session slots and records paid, discounted and due amounts on each booking. Discount recording is `[OUT: coupons]` if treated as a discount feature. — [Turf Manager](https://mwm.ai/apps/turf-manager/6766165177)
- [MKT, search summary] Pitchbooking staff enter bookings received by phone or email. — [GetApp: Pitchbooking](https://www.getapp.com/all-software/a/pitchbooking/)
- [3P] Hudle's partner app handles customers who book at the venue. — [SquareBoat: Hudle](https://www.squareboat.com/clients/hudle)
- [MKT, search summary] Odoo's Sports Facility module confirms walk-in bookings without creating a sales order. This is a general ERP add-on rather than a turf product. — [Odoo: Sports Facility Management](https://apps.odoo.com/apps/modules/18.0/dev_sports_facility_management)
- [REV] An Upper Hand reviewer complained of no drag-and-drop and no direct link from a calendar session to a client profile. — [Capterra: Upper Hand reviews](https://capterra.com/p/151570/Upper-Hand/reviews/)

### Inferences
- For a walk-in, the minimum viable flow is: pick a slot on the calendar, enter or find the customer, record the payment state. Linking the booking directly to the customer record addresses the Upper Hand complaint.
- **v1 decision needed:** turf-focused products record cash and dues, while this project is Stripe-only (`[OUT: payment methods]`). A walk-in paying cash has no path in a strictly Stripe-only model, so the owner needs to decide between Stripe-only walk-ins (for example, a Checkout link) and an offline "paid at venue" record.
- Playtomic's 2-hour rule shows the risk of mixing online and at-venue payment: an unmarked payment can lead to a wrong charge and a manual refund.

### Gaps
- No step-by-step walk-in flow, screenshot or click count was verified. Playtomic's and CourtReserve's articles were not read in full.
- Calendar view types (day, week, per-resource) could not be confirmed for most products.

## What do customer reviews praise or complain about in admin dashboards?

### Takeaway
Praise centres on reports, scheduling ease and support. Complaints centre on calendar friction, learning curve, unclear financial reporting and slowness at scale. The review evidence is second-hand and thin, and no independent operator reviews were found for the turf-specific or marketplace partner tools.

### Cited Findings
- [REV] CourtReserve is rated 4.7 from 53 reviews, with 4.5 for ease of use; regional Capterra sites differ slightly. — [Capterra: CourtReserve](https://www.capterra.com/p/152562/courtreserve/)
- [REV] A CourtReserve reviewer calls the admin side robust and improving on admin requests, but notes a learning curve and suggests having superusers. — [Capterra: CourtReserve reviews](https://www.capterra.com/p/152562/CourtReserve/reviews/)
- [REV] Another finds CourtReserve reports flexible but the help feature very hard to use. A separate reviewer says it helps hold members accountable for not showing up, which does not confirm a no-show fee feature. — [GetApp: CourtReserve](https://www.getapp.com/operations-management-software/a/courtreserve/)
- [3P] A summary reports CourtReserve users wanting next-available prompts, finer admin controls, easier fee splitting, more flexible reservation types and more integrations. — [Subscribed.fyi: CourtReserve](https://subscribed.fyi/courtreserve/reviews/)
- [REV] EZFacility is rated 4.4 from 128 reviews. Users value daily deposit and expiring-membership reports and describe reports as "very robust". One wanted more detailed revenue reporting. — [Capterra: EZFacility reviews](https://www.capterra.com/p/54308/EZFacility-Club-Management/reviews/?page=5); [GetApp: EZFacility](https://www.getapp.ca/software/102627/ezfacility-club-management)
- [REV] One EZFacility reviewer says a whole league schedules quickly and double-booking a field is not possible. A G2 review is titled "Efficient Facility Scheduling, Needs Conflict Clarity". — [Software Advice: EZFacility](https://www.softwareadvice.com/cafm/ezfacility-profile/); [G2: EZFacility reviews](https://g2.com/products/ezfacility-ezfacility/reviews)
- [3P] Review summaries say EZFacility's detailed reporting and invoice processing can be slow on large datasets, and cite limited mobile compatibility. — [ZoftwareHub: EZFacility reviews](https://zoftwarehub.com/products/ezfacility/reviews)
- [3P, competitor, biased] Swift calls EZFacility's calendar view "very clunky" for customers booking online. This concerns the customer side. — [Swift: EZFacility review](https://runswiftapp.com/blog/ezfacility-review)
- [REV] Upper Hand is rated about 4.1 from about 110 reviews. Complaints include no calendar drag-and-drop, no link from a session to a client profile, and unclear banking reports. A 1-star review is dated December 2024. Praise centres on breadth. — [Capterra: Upper Hand reviews](https://capterra.com/p/151570/Upper-Hand/reviews/)
- [REV] Omnify's G2 reports and dashboards score is 9.0 from just 5 reviews. — [G2: Clubworx vs Omnify](https://www.g2.com/compare/clubworx-2023-12-07-vs-omnify)
- Playtomic Manager: no independent club-owner reviews were found. Trustpilot's 2.8 from 3 reviews relates to the consumer app. — [Trustpilot: Playtomic](https://nl.trustpilot.com/review/app.playtomic.com)

### Inferences
- Operators appear to value specific operational reports, such as deposits and expiring memberships, as much as or more than general charts. This rests on a few reviews.
- Financial clarity is a recurring pressure point: Upper Hand's banking reports and EZFacility's revenue detail both drew complaints. This supports making the revenue CSV line up clearly with Stripe payouts.
- Calendar friction draws specific complaints, so drag-and-drop and calendar-to-customer links may be worth more than their low feature counts suggest.

### Gaps
- Capterra pages returned 403, so most review text and dates are unverified and sample sizes for each complaint are tiny. No frequency claims are possible.
- No admin-side reviews were found for Hudle, Playo, BookYourTurf, Turf Manager, Pitchbooking or Bookteq. Pitchbooking's review base is described as very small.
- App-store reviews for Hudle Partner could not be read because the page timed out.

## Which features do turf-specific operators rely on that generic booking tools lack?

### Takeaway
Evidence points to four recurring needs: splitting one pitch into linked sub-pitches, multi-sport views of the same ground, a cash and dues ledger, and season or block hires. This comes from product listings and booking forms rather than operator interviews, so it shows what is offered rather than what operators rely on. Generic tools do not always lack these either: Skedda has space-sharing rules.

### Cited Findings
- [MKT, search summary] Pitchbooking allows facilities to be split into halves or thirds. — [GetApp: Pitchbooking](https://www.getapp.com/all-software/a/pitchbooking/)
- [DOC-SEARCH, non-commercial-turf scheduling tool] USFA's scheduler links a full 11v11 field to its 7v7 halves, so a booking on a half blocks the full pitch. This is the clearest documented linked-resource logic found. — [USFA Events help](https://usfaevents.com/helpcenter.aspx?id=31)
- [DOC] Skedda, a generic tool, also has space-sharing rules that make related spaces unavailable and feed its utilisation calculation. — [Skedda Insights](https://support.skedda.com/en/articles/5807358-insights)
- [3P, operator form] Enfield Council's 3G pitch process asks block bookers to choose a full or half pitch. — [Enfield 3G block-booker application 2025-26](https://enfield.gov.uk/__data/assets/pdf_file/0029/86582/3G-football-pitches-new-block-booker-application-2025-26-Leisure-and-culture.pdf)
- [MKT, search summary] Hudle's occupancy dashboard is sport-wise, and Playo's scheduler switches by sport. — [Hudle Partner, App Store](https://apps.apple.com/us/app/-/id1569130632); [Venue Partner Interface, mwm.ai](https://mwm.ai/apps/venue-partner-interface/1057092085)
- [MKT] BookYourTurf names box cricket and football explicitly and supports block and unblock by venue and date. — [BookYourTurf Partner](https://mwm.ai/apps/bookyourturf-partner/6763787322)
- [MKT] Turf Manager structures slots into day and night sessions and tracks dues, cash-in-hand, expenses and salaries. — [Turf Manager](https://mwm.ai/apps/turf-manager/6766165177)
- [MKT, search summary] Pitchbooking gives grounds teams role-restricted booking visibility on phones. — [G-Cloud: Pitchbooking](https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/578712559994936)
- [REV] EZFacility users cite whole-league scheduling with no field double-booking. — [Software Advice: EZFacility](https://www.softwareadvice.com/cafm/ezfacility-profile/)

### Inferences
- **Highest-value turf item to check against the data model:** if the venue has one surface sold as full, half or 5-a-side, a booking on one must block the others. A flat slot-per-ground model cannot express this. The owner should confirm whether this applies to v1.
- **Likely useful and within scope:**
  - Season or block hires through recurring bookings by staff.
  - Maintenance blocks, which fit the existing admin-block rule.
  - A printable or read-only daily schedule for ground staff, which a `manager` role could cover.
- **Likely out of scope:** expense and salary tracking is `[UNCLEAR]` but looks beyond v1. Multi-sport occupancy is `[OUT: analytics]`. Peak and night pricing is `[OUT: dynamic pricing]`, though day and night sessions are common in turf apps and may be raised by operators.
- Cash and dues tracking is the feature that most separates the turf-specific apps from the other products here, and it conflicts directly with the Stripe-only constraint.

### Gaps
- No operator interviews, forums or independent surveys were found, so "rely on" is inferred from what vendors offer.
- No source confirmed futsal-specific formats, cricket-specific tools (nets, overs-based slots) or floodlight charges in commercial products. MATCHi's automated light control is the only related item found, and it is for racket venues.
- The turf-specific apps with the most explicit features (BookYourTurf, Turf Manager) are new, with almost no ratings, so they show what is being marketed rather than what has been proven in use.
