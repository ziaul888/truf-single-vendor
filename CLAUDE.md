# CLAUDE.md — Turf Management System (Code Cohen)

## Project Overview
Turf/sports-ground booking platform — v1.0 initial release.
Stack: Next.js 14 (App Router) · Node.js + Express · PostgreSQL · Prisma · Stripe · SendGrid

## Architecture
```
src/
├── app/                  # Next.js App Router pages & layouts
│   ├── (admin)/          # Admin dashboard routes (protected)
│   ├── (portal)/         # Customer booking portal routes
│   └── api/              # Next.js API routes (thin controllers only)
├── components/
│   ├── ui/               # Generic reusable components (Button, Input, etc.)
│   └── features/         # Feature-specific components (BookingCard, etc.)
├── lib/
│   ├── db.ts             # Prisma client singleton
│   ├── stripe.ts         # Stripe client
│   ├── sendgrid.ts       # Email client
│   └── auth.ts           # JWT helpers
├── services/             # Business logic (never put logic in routes/components)
├── validations/          # Zod schemas — one file per domain
└── types/                # Shared TypeScript interfaces
```

## Code Style & Quality
- TypeScript everywhere — no `.js` files in `src/`
- Use `strict: false` (see tsconfig) but avoid `any` — use proper types
- Formatter: Prettier (default config, runs on save)
- Linter: ESLint with Next.js defaults — fix all warnings, never suppress with comments
- Named exports only — no default exports except Next.js pages
- File naming: `kebab-case.ts` for files, `PascalCase` for React components
- Max file length: 300 lines — split if longer
- Max function length: 40 lines — extract helpers if longer
- One concern per file — no "utils.ts" dumping grounds

## Best Development Practices

### 1. Service Layer Pattern
Never write business logic in API routes or React components.
Always create a service function in `src/services/`.
```ts
// WRONG — logic in route
app.post('/bookings', async (req, res) => {
  const slot = await db.timeSlot.findFirst(...);
  if (slot.status !== 'available') ...
  const booking = await db.booking.create(...);
  await stripe.paymentIntents.create(...);
});

// CORRECT — thin route, fat service
app.post('/bookings', async (req, res) => {
  const result = await BookingService.create(req.body);
  res.json({ success: true, data: result });
});
```

### 2. Always Validate Input with Zod
Every API endpoint must validate request body/params before touching the DB.
```ts
// src/validations/booking.ts
export const CreateBookingSchema = z.object({
  groundId: z.string().uuid(),
  slotId: z.string().uuid(),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10).max(15),
});
```

### 3. Error Handling — Never Throw Naked
Use a consistent error response shape everywhere.
```ts
// src/lib/api-response.ts
export const success = (data: unknown) => ({ success: true, data });
export const error = (message: string, code = 400) => ({ success: false, error: message });

// In routes — always try/catch
try {
  const data = await BookingService.create(body);
  return res.status(201).json(success(data));
} catch (err) {
  if (err instanceof AppError) return res.status(err.code).json(error(err.message, err.code));
  console.error(err);
  return res.status(500).json(error('Internal server error'));
}
```

### 4. Database — Prisma Best Practices
- Always use Prisma migrations — never edit schema without `prisma migrate dev`
- Use `db.$transaction([...])` for operations that must be atomic (e.g. create booking + update slot)
- Never expose Prisma models directly to the client — map to a DTO
- Add indexes on frequently queried fields: `groundId`, `date`, `status`
- Soft-delete pattern: add `deletedAt DateTime?` — never hard-delete bookings or payments
```ts
// Atomic booking creation — slot + booking in one transaction
const [updatedSlot, newBooking] = await db.$transaction([
  db.timeSlot.update({ where: { id: slotId }, data: { status: 'booked' } }),
  db.booking.create({ data: { ...bookingData } }),
]);
```

### 5. Stripe — Secure Payment Flow
- NEVER handle raw card data — always use Stripe Checkout Sessions
- Verify webhook signatures on every incoming Stripe event
- Store `stripePaymentIntentId` on every payment record
- Refunds via Stripe API only — mark record as `refunded`, never delete
```ts
// Always verify webhook
const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
```

### 6. Environment Variables
- Never hardcode secrets or API keys
- Never commit `.env` or `.env.local` — only commit `.env.example`
- Validate all env vars at startup using Zod
```ts
// src/lib/env.ts — validate on boot
const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  SENDGRID_API_KEY: z.string(),
  JWT_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});
export const env = EnvSchema.parse(process.env);
```

### 7. Authentication & Authorization
- JWT stored in httpOnly cookie — never localStorage
- Middleware validates token on every admin route
- Two roles only: `admin`, `manager` — check role before sensitive actions
- Always hash passwords with bcrypt (saltRounds: 12)
- Rate-limit login endpoint (max 5 attempts per 15 min)

### 8. React & Frontend
- Use React Server Components by default — only add `'use client'` when needed
- Data fetching in Server Components — never fetch in `useEffect` for initial data
- Use `next/image` for all images — never bare `` tags
- Loading states: every async action needs a loading indicator
- Error boundaries: wrap feature sections with ``
- Forms: use `react-hook-form` + Zod resolver — no manual `useState` for forms
- Never store sensitive data in component state or localStorage

### 9. API Conventions
- All endpoints under `/api/v1/`
- Response shape: `{ success: boolean, data?, error? }`
- HTTP status codes: 200 OK · 201 Created · 400 Bad Request · 401 Unauthorized · 404 Not Found · 409 Conflict · 500 Server Error
- Pagination: `{ data, total, page, limit }` for list endpoints
- Never return passwords, JWT secrets, or internal IDs in responses

### 10. Git & Commits
- Branch naming: `feat/`, `fix/`, `chore/`, `refactor/`
- Commit format: `feat(booking): add slot availability check`
- Never commit directly to `main` — use PRs
- One feature per branch — keep PRs small and focused
- Write meaningful commit messages — no "fix bug" or "update"

### 11. Testing
- Unit test all service functions in `src/services/`
- Integration test all API endpoints with Supertest
- Use a separate test database — never run tests against production DB
- Mock Stripe and SendGrid in tests — never make real API calls
- Minimum coverage target: 70% on services
```bash
npm test                  # Run all tests
npm run test:coverage     # Coverage report
```

### 12. Performance
- Use `React.memo` only when profiling shows a real problem — not by default
- Debounce search/filter inputs (300ms)
- Paginate all list endpoints — never return unbounded arrays
- Cache ground listings with `next/cache` revalidation (60s)
- Use database indexes — run `EXPLAIN ANALYZE` on slow queries

### 13. Security Checklist
- All user input sanitized before DB write
- SQL injection: impossible with Prisma parameterized queries — do not use raw SQL
- XSS: Next.js escapes by default — never use `dangerouslySetInnerHTML`
- CORS: whitelist only your own domain
- Helmet.js on Express for security headers
- No sensitive data in URLs or query params
- Logs must never contain passwords, card numbers, or tokens

## Key Business Rules
- Slots auto-generated hourly from ground opening/closing time
- Slot cannot be double-booked — check `status === 'available'` inside a DB transaction
- Admin-blocked slots are permanently unavailable to customers
- Cancellation = full refund to original payment method only
- Pricing is per-ground, per-hour — fixed, no dynamic pricing in v1
- Soft-delete only — never hard-delete bookings, payments, or customers

## What Is NOT in v1 — Do Not Implement
- Mobile app or any native features
- Coupon or discount codes
- SMS notifications (email only)
- Loyalty or points system
- UPI, wallets, or multiple payment methods
- Multi-vendor / multi-branch support
- Advanced analytics beyond daily/weekly revenue CSV

## Environment Variables
```
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENDGRID_API_KEY=
JWT_SECRET=
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

## Commands
```bash
npm run dev                  # Start dev server (port 3000)
npm run build                # Production build
npm run lint                 # ESLint check
npm run test                 # Run test suite
npx prisma migrate dev       # Apply DB migrations
npx prisma generate          # Regenerate Prisma client
npx prisma studio            # Open DB GUI
```

## When in doubt — ask before implementing. Keep it simple. Ship v1 first.
