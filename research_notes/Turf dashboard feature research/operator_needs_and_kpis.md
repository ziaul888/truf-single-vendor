# Operator Needs and KPIs for a Single-Venue Turf Dashboard

Researched 2026-11-02. Labels used throughout:

- **Evidence grades:** [INDEPENDENT] = press, peer-reviewed or primary documentation. [VENDOR] = written by a company selling turf software, construction or restaurant software; potentially biased. [ANALOGUE] = a non-turf sector, so transfer is uncertain. [EXCERPT] = seen only in a search excerpt; the full page was not read or was blocked. [OPINION] = no data behind it.
- **Scope flags:** [EXCEEDS V1 ANALYTICS LIMIT] = beyond CLAUDE.md's "daily/weekly revenue CSV" limit; owner decides. [OUT OF V1] = excluded by CLAUDE.md. [RULE CONFLICT] = contradicts a written CLAUDE.md business rule.
- **Repo facts** cite file paths in this repo. They come from the frontend type contracts ("exactly as turf-api returns them"). The turf-api backend is not in this repo: there is no `schema.prisma` here, and `server/index.js` is a mock. Backend behaviour is therefore inferred, not confirmed.

## Which KPIs do facility operators track, how is each calculated, and what benchmarks exist?

### Takeaway
Utilization and revenue per available hour, split by weekday and hour, are the core pair, and their definitions are consistent across sources. No independent, audited turf benchmark dataset was found: every turf-specific number is a vendor figure or a model assumption, so targets should come from the venue's own trailing data.

### Cited Findings

**Definitions (consistent across sources; none is an industry standard)**
- Utilization = booked hours / available hours x 100. RevPAH = total booking revenue / total available hours. Lead time = average days between booking and event. Cancellation rate = cancelled / total bookings x 100 — [EZFacility, Nov 2025](https://www.ezfacility.com/blog/sports-facility-management-metrics/) [VENDOR]
- RevPAH is argued to matter more than the hourly rate: Rs 1,200/hr at 50% occupancy gives Rs 600 RevPAH, and Rs 800/hr at 85% gives Rs 680. These occupancies are illustrative, not measured — [TurfBox, Jul 2026](https://turfbox.in/blog/turf-pricing-strategy-india-2026.html) [VENDOR]
- No-show rate, as carefully defined in the best large dataset = recorded no-shows / (recorded no-shows + attended bookings), counting only bookings that ended at least 72 hours before extraction. No-shows must be marked by staff or an integration, and nothing is inferred by timeout — [Resos No-Show Index 2026](https://resos.com/restaurant-no-show-rate/) [VENDOR, ANALOGUE]

**Utilization benchmarks**
- General sports facilities: above 70% is "generally healthy" and under 50% suggests unused capacity, with no source cited for either — [EZFacility](https://www.ezfacility.com/blog/sports-facility-management-metrics/) [VENDOR, OPINION]
- Indian 7-a-side turf: "a good turf sells 7–9 hours/day" of about 16 sellable hours, unsourced — [Clutchr/Cuetronix, Jul 2026](https://clutchr.in/blog/turf-business-profitability-guide) [VENDOR]. That implies about 44–56% blended occupancy (my division).
- Indian Tier 2 box cricket: 6–11 PM 85–95% booked, 7 AM–6 PM 30–40% booked, no per-figure source. The page says 14 hours/day but its stated 7 AM–11 PM span is 16 hours, an internal inconsistency — [Super Sports Infra, Jul 2026](https://supersportsinfra.com/blog/box-cricket-cost-guide.html) [VENDOR, promotional]
- New-venue ramp-up: one two-court Pune arena reportedly went from 35% in month 1 to 68% in month 4 and 78% in month 12 — [ChampCourts](https://champcourts.com/collections/box-cricket-courts) [VENDOR, EXCERPT, single case]
- Weekday fill by pricing model: flat 20–35%, peak/off-peak 40–55%, dynamic 55–70%, all unsourced — [TurfBox](https://turfbox.in/blog/turf-pricing-strategy-india-2026.html) [VENDOR]. Do not treat these as causal.
- Padel analogue: about 85% average peak-time occupancy, attributed by one write-up specifically to British clubs; about 70% occupancy at well-run Spanish clubs; Swedish peak-hour occupancy down from 52% (2021) to 21% (2025) — secondary coverage of the [Playtomic Global Padel Report](https://playtomic.com/global-padel-report) [ANALOGUE, EXCERPT; primary report not opened, and Playtomic is itself a booking-platform vendor]. These figures have different scopes and should not be compared directly. A separate press-derived figure says Swedish occupancy fell from 80–90% peak to 7–8% at some sites — [Racquet Sports Institute, Apr 2026](https://racquetsports.institute/post/economies-of-scale-in-racquet-sports-facilities). The two Swedish figures conflict, probably because of differing scope.

**Revenue per hour benchmarks**
- ">$60 revenue per court-hour" for robustly programmed racquet facilities. The page discloses no sample or method, is tagged "Ai Agent", and aggregates business-plan sites — [Racquet Sports Institute](https://racquetsports.institute/post/economies-of-scale-in-racquet-sports-facilities) [ANALOGUE, weak]
- $25–75 per booked hour for small indoor facilities and 65–70%+ peak-time utilization targets appear on template and model sellers' sites; a cautionary example has utilization rising from 60% to 85% while revenue per hour falls from $60 to $42 — e.g. [Financial Models Lab](https://financialmodelslab.com/blogs/kpi-metrics/sports-complex), [Business Plan Templates](https://businessplan-templates.com/blogs/metrics/tennis-club) [VENDOR, EXCERPT; exact page attribution of each figure not confirmed]. Their weak sourcing means they should not be used as targets.

**Economics that explain why these KPIs matter**
- Indian turf at Rs 1,200/hr average: Rs 2.5–3.2 lakh monthly revenue per ground against lease Rs 60k–1.5 lakh, maintenance Rs 20–40k, power Rs 15–30k and staff Rs 20–35k — [Clutchr](https://clutchr.in/blog/turf-business-profitability-guide) [VENDOR]. Those lines sum to about Rs 1.15–2.55 lakh per month (my sum). The page states no margin.
- Payback estimates conflict: 12–18 months per [TurfBox](https://turfbox.in/blog/how-to-start-box-cricket-turf-business.html) against 24–36 months per [Stark Sports](https://www.starksports.in/blog/box-cricket-vs-academy-vs-full-ground-india) [both VENDOR, EXCERPT]
- Outdoor arenas "lose 30–40% revenue in peak monsoon", unsourced — [Super Sports Infra](https://supersportsinfra.com/blog/box-cricket-cost-guide.html) [VENDOR]
- Bangladesh: sessions are often priced per 90 minutes at Tk 1,500–10,000, with evening 5–10 PM priced higher and heat suppressing daytime play. One Chattogram operator said about 80% of clients are corporate workers playing at night, and that volume was historically 3–4 games a day but 7–8 on Fridays — [The Daily Star, Apr 2025](https://www.thedailystar.net/business/news/lost-playgrounds-booming-business-3869101) [INDEPENDENT, anecdotal]. No revenue or profit figures are disclosed.

**Repeat rate, no-show and dues**
- Repeat: "70%+ of volume is the same teams, week after week", unsourced — [Clutchr](https://clutchr.in/blog/turf-business-profitability-guide) [VENDOR]
- No-show, turf: "discounted and off-peak bookings without advance payment have 30–40% no-show rates", unsourced — [TurfBox](https://turfbox.in/blog/turf-pricing-strategy-india-2026.html) [VENDOR]
- No-show, restaurants: 2.33% across 3,768,761 reservations at 2,417 restaurants (Aug 2025–Jul 2026, about 54% UK). True rates are probably higher because staff must record them, and only 72.9% of eligible locations recorded any — [Resos](https://resos.com/restaurant-no-show-rate/) [ANALOGUE]
- No-show, healthcare: 23.1% with no reminder in one 2007 US outpatient RCT — [Parikh et al. 2010](https://pubmed.ncbi.nlm.nih.gov/20569761/) [ANALOGUE, pre-2020]

### Inferences
- **The two independent-looking Indian occupancy figures roughly agree but do not corroborate each other.** Super Sports Infra's bands blend to about 47–57% over 16 hours (5 hours at 85–95% plus 11 at 30–40%), close to Clutchr's 44–56%. Both are unsourced vendor figures and may share origins. Treat "about 50% blended, sold out in the evening, weak by day" as a working hypothesis, not a benchmark.
- **The revenue opportunity is in the off-peak shape, not the average.** Selling one more hour a day adds 6.25 utilization points on a 16-hour day, about Rs 36,000 a month at Rs 1,200/hr. If costs are as fixed as the Clutchr line items suggest, most of that reaches margin. This is illustrative arithmetic on vendor inputs.
- **Suggested KPI priority for a single venue** (my judgement, based on the economics above rather than on any operator survey):
  1. Weekday x hour utilization, because it locates idle capacity.
  2. RevPAH, because it stops utilization being bought with lower price.
  3. Outstanding and overdue dues, because this is cash already earned.
  4. No-show and late-cancellation lost hours, because each lost prime slot is unrecoverable.
  5. Repeat share, because it indicates demand concentration.
  6. Lead time, because it is mainly a diagnostic for reminder timing and when to expect late sell-through.
- **Use the venue's own trailing data as the benchmark** (last 4–8 weeks, same weekday and hour), since no external figure is reliable enough to display as a target in the product.

### Gaps
- No independent or audited turf utilization, RevPAH, repeat-rate, lead-time or no-show benchmark was found for India, Bangladesh, the UK or the US. I found no association-grade dataset; UK and US association sources were not located within this research budget, and absence should not be read as proof none exists.
- No benchmark at all was found for lead time or for outstanding dues as a share of revenue.
- Playtomic's report was not read directly, and no off-peak occupancy figure was found.
- Bangladesh-specific occupancy and financial data: none found.

## What are the biggest operational pain points for turf owners?

### Takeaway
Vendors consistently name double-bookings, scattered WhatsApp and phone booking, cash without a trail, unpaid no-shows and idle weekday daytime, but nobody has measured how often these occur or what they cost. The only press reporting from owners (Bangladesh) emphasises different things: rent, maintenance, power and player disputes.

### Cited Findings
- **Double-bookings and manual channels:** "double booking issues", "manual booking confusion" and calls and WhatsApp becoming hard to manage as volume grows — [TurfBox](https://turfbox.in/blog/best-cricket-booking-app-for-turf-owners.html) [VENDOR]. An academic paper repeats that manual methods "can lead to mistakes such as double bookings and delays in confirmation", but it reports no survey, interviews or operator measurements, so it is assertion rather than evidence — [IJERT, Mar 2026](https://www.ijert.org/smart-turf-booking-and-lighting-control-ijertv15is030261)
- **Cause of collisions:** phone, walk-in, WhatsApp and web bookings collide when they do not all check one live calendar — generic scheduling vendors, e.g. [Exepad](https://exepad.com/blog/why-double-bookings-keep-happening), [Reservio](https://www.reservio.com/blog/tips/double-booking-in-scheduling) [VENDOR, EXCERPT; exact attribution not confirmed]
- **Cash and dues:** "missed payment tracking" and "track cash handovers" — [TurfBox](https://turfbox.in/blog/best-cricket-booking-app-for-turf-owners.html) [VENDOR]. "Staff collects cash, but there's no trail" — [TurfBox booking-app article](https://turfbox.in/blog/online-turf-booking-app-cricket-grounds.html) [VENDOR, EXCERPT; attribution within TurfBox's pages not confirmed]. No leakage percentage was found anywhere. Clutchr's profitability guide does not address cash, dues or leakage at all.
- **No-shows:** on prime slots they are "your most expensive failure" — [Clutchr](https://clutchr.in/blog/turf-business-profitability-guide) [VENDOR, OPINION]
- **Idle off-peak:** weekday 10am–4pm is "the desert every owner knows" — [Clutchr](https://clutchr.in/blog/turf-business-profitability-guide) [VENDOR]. Weekday demand is "demand-constrained" and weekend demand "supply-constrained" — [TurfBox](https://turfbox.in/blog/turf-pricing-strategy-india-2026.html) [VENDOR]. Daytime heat limits play in Bangladesh — [The Daily Star](https://www.thedailystar.net/business/news/lost-playgrounds-booming-business-3869101) [INDEPENDENT]
- **Owner-reported problems in the press:** high land rent, ongoing maintenance and rain damage, turf replacement every 2–3 years, night-game electricity, limited government support, and player disputes requiring strong management and CCTV — [The Daily Star](https://www.thedailystar.net/business/news/lost-playgrounds-booming-business-3869101) [INDEPENDENT, anecdotal]
- **Marketplace commission:** "single-digit" commissions on 300 bookings a month are said to exceed the annual cost of flat-priced software, and repeat teams routed through marketplaces mean paying commission on customers already owned — [Clutchr](https://clutchr.in/blog/turf-business-profitability-guide) [VENDOR, self-interested]
- **Staff accountability:** only a call-to-action about shifts and handovers was found — [TurfBox](https://turfbox.in/blog/best-cricket-booking-app-for-turf-owners.html) [VENDOR]. No data found.

### Inferences
- **Pain-point rankings cannot be evidenced.** Vendors emphasise what their software fixes, while owners speaking to the press raise fixed costs a booking system cannot change. The pain list is plausible but should be validated by interviewing the project owner and a few local operators.
- **Double-booking is largely solved by the existing design** (a single slot record with transactional status plus `held`), provided staff enter every phone and walk-in booking. The residual risk is off-system bookings, so the behaviour to support is fast staff entry rather than more double-booking features.
- **The cash trail is the highest-value accountability feature.** `recordedBy` on payments and the `user` on booking events already exist (`src/types/booking.ts`), so most of it is a reporting view rather than new data capture.

### Gaps
- No measured frequency or cost was found for double-bookings, cash leakage, or time spent on manual booking.
- No academic or survey study of turf operators was found. Bengali-language sources and Bangladeshi academic databases were not searched and might yield more.
- No evidence on staff accountability or theft specific to turfs.

## What does a front desk or manager need during a working day versus what an owner needs weekly, and what does design guidance say?

### Takeaway
Design guidance supports separating them: an operational "what do I do now" screen (exceptions and today's timeline) and a separate analytical weekly review (trends, heatmap, dues aging). No turf-specific user research was found, so the allocation of metrics to roles is reasoned rather than evidenced.

### Cited Findings
- NN/g defines dashboards as "collections of data visualizations, presented in a single-page view" giving at-a-glance information users can act on quickly, not "expansive views of complex data". It recommends length and 2D position for quantities (bars, lines), advises avoiding pies, donuts, gauges, radial and 3D charts for quick comparison, and says not to encode quantity in color — [NN/g, Laubheimer, 2017](https://www.nngroup.com/articles/dashboards-preattentive/) [INDEPENDENT, pre-2020 but foundational]
- Few's definition, as quoted by others: the most important information needed to achieve objectives, consolidated on a single screen so it can be monitored at a glance. He is also reported to say a dashboard is not for data exploration or lookup — [Dundas](https://dundas.com/support/blog/so-what-exactly-is-a-dashboard), [InformationWeek](https://www.informationweek.com/data-management/dashboard-confusion) [secondary, EXCERPT; Few's book was not read]
- Few's strategic/operational/analytical taxonomy is widely cited but has been questioned as incomplete — [Stephanie Evergreen](https://stephanieevergreen.com/the-fourth-purpose-of-a-dashboard/) [EXCERPT]. The one-screen rule has also been challenged — [Juice Analytics](https://www.juiceanalytics.com/writing/breaking-free-one-page-dashboard-rule) [VENDOR, EXCERPT]
- Operational dashboards use live data so users can spot deviations and act; analytical dashboards are not time-sensitive and support drill-down — [Basedash](https://www.basedash.com/blog/operational-dashboards-vs-analytical-dashboards-how-to-design-each) [VENDOR, EXCERPT]
- An empirical study of dashboard structure (144 dashboards reviewed, plus a workshop with 23 participants) names genres including analytical, narrative and embedded — [Bach et al., 2022/23](https://arxiv.org/abs/2205.00757). The abstract page does not itself address the monitoring/analytical split or the single-screen rule.
- **Repo state:** the dashboard contract already models operational needs: `toConfirm`, `overdue`, `dueToday`, `payingNow` and `startingSoon` attention counts; per-ground slot `timeline`, `current` and `next` booking with its `due`; and an activity feed (`src/types/dashboard.ts`). Reports already expose revenue, method split, completion and cancellation rates, and per-ground utilization (`src/types/report.ts`).

### Inferences
Role allocation (my reasoning, applying the guidance above):

| Need | Front desk / manager, during the day | Owner / admin, weekly |
|---|---|---|
| Question answered | What must I do in the next hour? | Is the venue healthier, and where is money leaking? |
| Time horizon | Today, live | Last 7/28 days against the prior period |
| Content | Who is playing now and next; balance to collect from the next team; pay-at-venue bookings to confirm; dues today and overdue; free slots left today; held checkouts | Weekday x hour utilization heatmap; RevPAH per ground; net revenue and refunds; dues aging; lost hours from cancellations and no-shows; repeat share; cash recorded per staff member |
| Form | Exceptions list and timeline; large numbers; one screen | Bars, lines and tables with date comparison; drill-down permitted |
| Trend arrows | Mostly noise for these tasks | Useful |

- **Most of the left column already exists in the contract**, so the gap is in the right column. Whether `src/app/(admin)/dashboard/page.tsx` renders each field was not audited.
- **Today's revenue and its trend against a prior period are of low operational value at the desk** because staff cannot act on them. Consider making the attention list the dominant element for managers. This is opinion derived from the guidance.
- **Role alignment:** `admin` could map to the owner view and `manager` to the operational view, using the two existing roles and needing no new role.
- **Heatmap caveat:** NN/g advises against color for precise quantity. A weekday x hour grid is still reasonable for spotting pattern rather than reading values, provided numbers are available in the cell or tooltip. This is my judgement and the source does not address heatmaps.

### Gaps
- No observational research or interviews with turf front-desk staff or owners were found.
- Few's primary texts and NN/g material dated after 2020 on operational dashboards were not retrieved.

## Which no-show and cancellation reduction tactics are evidenced, and which can be done with email and Stripe only?

### Takeaway
Reminders have the only randomized support, all from healthcare and mostly not email, with small to moderate effects. Prepayment shows the largest observed gap, but the best dataset explicitly refuses to call that causal. No turf-specific tactic has been tested. The two strongest in-scope moves are to add a pre-play reminder email, which the email types suggest is missing, and to measure no-shows at all, since the system has no way to record them.

### Cited Findings

**Prepayment and deposits**
- Reservations with a deposit or card hold: 0.80% no-show (1,907/238,539; 327 restaurants). Without: 2.47% (85,589/3,461,164; 2,409 restaurants). The publisher says the gap cannot be attributed to the feature, and its matched study's intervals all included no effect, so it publishes no feature effect — [Resos](https://resos.com/restaurant-no-show-rate/) [VENDOR, ANALOGUE, observational]
- Tock platform data is reported as 0.9% with full prepayment against 3% with card holds; a survey of 39 Michelin-starred restaurants reports about 1% with a card deposit; one blog claims deposits cause a 60–90% no-show drop with a 5–10% drop in bookings — e.g. [QuickTable](https://www.quicktable.co/restaurant-no-show-statistics/), [IntoTheMinds](https://www.intotheminds.com/blog/en/credit-card-deposit-restaurant/) [VENDOR, ANALOGUE, EXCERPT; exact attribution of the booking-volume claim not confirmed]. The booking-loss figure is weak but is the key trade-off.
- Turf: collect 50–100% advance on weekend bookings, with no measured result — [TurfBox](https://turfbox.in/blog/turf-pricing-strategy-india-2026.html) [VENDOR, OPINION]

**Reminders**
- RCT (n=9,835): no-shows 13.6% with staff phone calls, 17.3% with an automated reminder, 23.1% with none, each sent 3 days before. Cancellations were significantly higher in both reminder arms — [Parikh et al. 2010](https://pubmed.ncbi.nlm.nih.gov/20569761/) [ANALOGUE, pre-2020, telephone rather than email]
- Pragmatic randomized study at Kaiser Permanente Washington: an additional text lowered primary-care no-shows from 9.1% to 8.4% (RR 0.93, 95% CI 0.89–0.96) — [Permanente Journal](https://www.thepermanentejournal.org/doi/10.7812/TPP/21.078) [ANALOGUE, EXCERPT; page returned 403]. The effect of adding one more message is small.
- Pooled SMS reminders against none: attendance RR 1.06 (95% CI 1.05–1.07). The same UK review reports automated reminders less effective than manual calls, and no difference between sending the day before and the week before — [UK evidence review, NCBI Bookshelf](https://ncbi.nlm.nih.gov/books/n/ukhsdr0234/app5) [ANALOGUE, EXCERPT]
- Restaurants: delivered SMS reminder associated with 16% lower no-shows within restaurants (RR 0.836); confirmation prompts were near neutral (RR 0.983) — [Resos](https://resos.com/restaurant-no-show-rate/) [ANALOGUE, observational]
- Email specifically: a retrospective orthodontic study found electronic reminders (SMS and email) beat phone calls on no-shows, with SMS lowest at 1.90%; the patient-chosen method means this is not randomized — [Angle Orthodontist](https://angle-orthodontist.kglmeridian.com/downloadpdf/view/journals/angl/88/3/article-p314.pdf) [ANALOGUE, EXCERPT]. A urology email study is listed with no results — [ClinicalTrials.gov NCT06114602](https://clinicaltrials.gov/study/NCT06114602)
- Targeted live calls for patients with high predicted risk: 33% against 36% no-show — [randomized QI study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10150669/) [ANALOGUE, EXCERPT]

**Timing and segment patterns**
- Restaurant no-show rate by lead time is shallow and non-linear: same day 2.09%, 2–6 days 2.67% (highest), 30+ days 1.96%. Dinner 2.63% against lunch 1.84%. Larger parties no-show less (10+ guests 1.15%), but each loss costs more — [Resos](https://resos.com/restaurant-no-show-rate/) [ANALOGUE]

**Stripe mechanics**
- Card authorization holds are possible in Checkout Sessions with `payment_intent_data[capture_method]=manual`. Online card holds usually last 7 days (Visa merchant-initiated about 5 days), extended holds exist for eligible payments, and an expired hold releases funds. Customers can be confused by how holds appear on statements — [Stripe docs](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method) [INDEPENDENT, primary]
- **Stripe's availability page does not list Bangladesh, and lists India as "Preview" via sales contact** — [Stripe Global](https://stripe.com/global) [primary, checked 2026-11-02]. The repo's slot times are "venue-local (Asia/Dhaka)" and its comments use the taka (`src/types/slot.ts`, `src/types/booking.ts`). A Bangladesh-based operator may therefore be unable to open a Stripe account directly; the owner should confirm the entity and country of the account.

**Tactic scope table**

| Tactic | Evidence | Email + Stripe only? | Scope flag |
|---|---|---|---|
| Record no-shows (staff "no-show" action) | Precondition for measuring anything; [Resos](https://resos.com/restaurant-no-show-rate/) shows staff recording underlies the metric | Yes, internal | Needs a new status; analytics use is [EXCEEDS V1 ANALYTICS LIMIT] |
| Pre-play reminder email with cancel link | Moderate for reminders generally; email itself unproven | Yes | In scope. No such kind in `EmailKind` (`src/types/settings.ts`) |
| Full prepayment by Checkout | Large observed gap, causality unproven | Yes | In scope, and the card flow already works this way |
| Limit or disable pay-at-venue | Inferred from prepayment evidence | Yes, `portalCashEnabled` toggle exists | Cash itself raises a conflict, see below |
| Staff call list for unpaid bookings today | RCT: staff calls beat automated ones | Phone only, no new channel | In scope |
| Card hold, capture on no-show | Restaurant association only; [Tock figures](https://www.quicktable.co/restaurant-no-show-statistics/) suggest weaker than prepayment | Yes, but 7-day window limits it to near-term bookings | [RULE CONFLICT]: charging is a new policy |
| Partial retention on late cancellation | [ChampCourts](https://champcourts.com/collections/box-cricket-courts) recommendation only | Yes | [RULE CONFLICT]: "Cancellation = full refund" |
| SMS or WhatsApp reminder | Best evidence of any channel | No | [OUT OF V1] |
| Off-peak discount codes, loyalty, dynamic pricing | Vendor claims only | No or partly | [OUT OF V1] |

### Inferences
- **Reminders may work partly by converting silent no-shows into cancellations** (Parikh's cancellation result). For a turf this is the useful outcome, because a cancelled slot can be resold while a no-show cannot. It follows that a reminder should carry a one-click cancel link, and that cancellation rate may rise after launch without that being a failure. The current `cancellationCutoffHours` setting interacts with this: a reminder sent after the cutoff offers no release route.
- **Reminder timing:** send about 24 hours before, and before the cutoff if the two differ. Healthcare evidence shows little sensitivity to timing, so this is not worth much tuning.
- **Turf no-show levels may differ from every analogue.** Restaurant (2.3%), clinic (23%) and vendor turf (30–40%) rates differ more than tenfold. Team bookings also differ in that one captain is accountable for many players. Measure before investing in anything heavier than a reminder.
- **Prepaid no-shows matter less financially.** A card-paid no-show is revenue kept with an idle slot, while a pay-at-venue no-show is the real loss. Reporting should split no-shows by payment state.
- **Recommended order:** record no-shows, add the reminder email, add a staff call list, then decide on pay-at-venue restrictions using four to eight weeks of data.

### Gaps
- No trial or even observational data on no-show tactics in turf or sports facilities was found. Fitness-studio evidence was searched for and none of quality surfaced.
- No randomized email-versus-SMS comparison was found. A claimed 34% reduction from a reminder review (Hasvold and Wootton 2011) could not be verified and should not be cited.
- No credible data on how many customers abandon when prepayment becomes mandatory on a turf.
- Hotel-sector cancellation research was not found in this search.

## Which of these metrics could be computed from data a booking system already has?

### Takeaway
Most of them are computable from existing fields; true no-show rate is the important exception. The system has no no-show or check-in state (a search of `src/` finds no such reference), and `completed` appears to be set by a background job, so "Completion Rate" likely overstates attendance. Several metrics exceed the written v1 analytics limit and need an owner decision.

### Cited Findings
All from the repo's type contracts, with backend behaviour unverified.

| KPI | Computation from existing data | Status | Scope flag |
|---|---|---|---|
| Utilization per ground | `GroundReport.hoursBooked / hoursAvailable` (`src/types/report.ts`) | Exists | [EXCEEDS V1 ANALYTICS LIMIT], already built |
| Utilization by weekday x hour | Aggregate `Slot` by `date`, `startHour`, `status`, weighting by `durationMinutes` (`src/types/slot.ts`) | Data exists, no endpoint in the contract | [EXCEEDS V1 ANALYTICS LIMIT] |
| RevPAH | `GroundReport.revenue / hoursAvailable` | Trivial derivation | [EXCEEDS V1 ANALYTICS LIMIT] |
| Peak vs off-peak | Use `Slot.price`, fixed at creation, or `peakRanges` (`src/types/ground.ts`); see caveat below | Derivable | [EXCEEDS V1 ANALYTICS LIMIT]; see peak conflict below |
| Cancellation rate | `ReportSummary.cancellationRate` | Exists; see caveat below | Already built, beyond limit |
| Late-cancellation rate and lost hours | `cancelledAt` against `slot.date` and `startHour` (`src/types/booking.ts`) | Derivable | [EXCEEDS V1 ANALYTICS LIMIT] |
| No-show rate | **Not computable.** `BOOKING_STATUSES` is pending, confirmed, cancelled, completed | Needs a new status or flag | Capture is small; reporting is [EXCEEDS V1 ANALYTICS LIMIT] |
| Repeat customer rate | Customers with 2+ non-cancelled bookings, from `Customer.bookings` or by booking history | Derivable | [EXCEEDS V1 ANALYTICS LIMIT] |
| Lead time | `createdAt` to slot start | Derivable | [EXCEEDS V1 ANALYTICS LIMIT] |
| Outstanding dues | `Booking.due`, `dueDate`; `CustomerStats.totalDueAmount`; `DashboardAttention.overdue` and `dueToday` | Exists | Dues depend on offline payments, see below |
| Dues aging | Bucket `due` by `dueDate` | Derivable | [EXCEEDS V1 ANALYTICS LIMIT] |
| Revenue by payment method | `ReportSummary.revenueByMethod` | Exists | Multiple methods conflict, see below |
| Cash recorded per staff member | `BookingPayment.recordedBy`, `method`, `amount` | Derivable | [EXCEEDS V1 ANALYTICS LIMIT] |
| Cash handover / drawer reconciliation | Not modeled | New data needed | Owner decision |
| Portal vs staff booking share | `Booking.source` | Derivable | [EXCEEDS V1 ANALYTICS LIMIT] |
| Daily/weekly revenue | `RevenuePoint`, `GroupBy`; `ExportType` includes revenue | Exists | In scope |

**Places where the repo already departs from CLAUDE.md (owner should reconcile; not necessarily wrong)**
- CLAUDE.md excludes "multiple payment methods", and the brief says Stripe only, but `PAYMENT_METHODS` includes `cash` and `bank_transfer`, with partial payment and dues tracking (`src/types/booking.ts`). All cash, dues and leakage value depends on keeping these.
- CLAUDE.md excludes SMS notifications, but customer sign-in uses "phone + SMS code" and integrations list `twilio` (`src/types/booking.ts`, `src/types/settings.ts`). Sign-in codes are arguably not "notifications".
- CLAUDE.md says pricing is "fixed" per ground and per hour with no dynamic pricing, but grounds have `peakPrice` and `peakRanges` (`src/types/ground.ts`). Scheduled peak tiers are not demand-based dynamic pricing, but they are not flat either.
- CLAUDE.md limits analytics to daily/weekly revenue CSV, but `src/types/report.ts` and the reports pages already offer completion, cancellation, utilization and monthly grouping.
- Slot durations are 60 or 120 minutes only (`SLOT_DURATIONS`), while Bangladeshi operators commonly sell 90-minute sessions — [The Daily Star](https://www.thedailystar.net/business/news/lost-playgrounds-booming-business-3869101). Worth confirming with the owner.

### Inferences
**Definition traps to settle before building**
- **Completion Rate:** `SYSTEM_JOBS` includes `completion` (`src/types/settings.ts`), and `completionRate` is null until a slot has ended. This suggests auto-completion by time. If so, a no-show counts as completed, and the metric should not be read as attendance.
- **Cancellation rate:** bulk blocks and closures can cancel bookings (`BulkBlockResult.cancelledBookings`, `src/types/slot.ts`). Venue-initiated cancellations should be excluded from a customer cancellation KPI. `cancelReason` appears to be free text; the `cancelled` event's `user` may help distinguish actors, but a structured field would be cleaner.
- **Available hours:** decide whether maintenance and weather blocks reduce the denominator. Excluding them measures commercial performance and including them shows total capacity lost. Showing blocked hours separately handles both.
- **Peak history:** `peakRanges` reflects current settings, so historic peak analysis should use a value stored on the slot. The admin `Slot` lacks the `isPeak` that `PublicSlot` has, and comparing `price` to the current rates breaks after a price change.
- **Repeat rate:** customers are keyed around a phone number and booker, so one captain may represent a whole team. The metric measures repeat bookers, not players. Also `Customer.bookings` is all-time, so a period-based repeat share requires booking history.
- **Weekend definition:** Friday appears as the peak day in Bangladesh (Daily Star anecdote), so a Saturday/Sunday "weekend" assumption would mislead; a 7-day grid avoids the issue.
- **Small numbers:** with a single venue, weekly no-show rates will be noisy. Show counts and lost hours alongside percentages.

**Owner decisions**
1. Is a small owner KPI view (heatmap, RevPAH, dues aging, lost hours) an acceptable extension of the v1 analytics limit? Since utilization reporting already exists, the limit seems to have been passed in practice.
2. Should a no-show status be added? It is a small change that unlocks the metric and all later decisions, and is the single most valuable addition found.
3. Are cash, bank transfer and dues officially in v1? The code says yes and CLAUDE.md says no.
4. Is there any appetite to change "Cancellation = full refund" for late cancellations and no-shows?
5. Does the venue's Stripe account exist in a supported country?

### Gaps
- The turf-api backend is not in this repo, so query feasibility, indexes, auto-completion logic and the exact revenue definitions per ground could not be checked.
- Whether `hoursAvailable` excludes blocked hours is not stated in the contract.
- No evidence was found that any given KPI, once displayed, actually changes operator behaviour or revenue. All business-impact links here are reasoned from economics rather than measured.
