# 🏟️ Turf Admin Panel

Turf Management System - Admin Panel built with Next.js 16, TypeScript, and Tailwind CSS.

**Project:** Code Cohen

---

## 🚀 Tech Stack

### Core
- **Next.js 16.2** - React framework with App Router & Turbopack
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Styling

### UI & Components
- **shadcn/ui** - Accessible component library (built on Radix UI)
- **lucide-react** - Icon library
- **next-themes** - Dark/Light mode
- **sonner** - Toast notifications
- **cmdk** - Command palette (Cmd+K)

### State Management
- **@tanstack/react-query** - Server state, caching
- **zustand** - Client state
- **nuqs** - URL state management

### Forms & Validation
- **react-hook-form** - Form handling
- **zod** - Schema validation
- **@hookform/resolvers** - Integration

### Data Display
- **@tanstack/react-table** - Advanced data tables
- **recharts** - Charts for analytics
- **react-day-picker** - Date picker

### Utilities
- **axios** - HTTP client
- **date-fns** - Date manipulation
- **jspdf** + **jspdf-autotable** - PDF generation (invoices)
- **papaparse** - CSV parsing
- **xlsx** - Excel export

---

## Run locally

Install dependencies at the repository root with `yarn install --frozen-lockfile`.
Copy each app’s `.env.example` to `.env.local` in the same directory and point
`API_PROXY_TARGET` at the running Turf API.

| Command | Port | App |
| --- | --- | --- |
| `yarn dev:portal` | 3000 | Customer booking portal and public gateway |
| `yarn dev:saas` | 3001 | SaaS landing and owner application |
| `yarn dev:platform` | 3002 | Platform Admin |
| `yarn dev:admin` | 3003 | Turf owner and staff dashboard |

`yarn dev` starts the booking portal, which serves `/turf/<slug>`. Run it
alongside the relevant workspace to test existing `/dashboard`, `/login`,
`/saas`, `/saas/apply` and `/platform` URLs on port 3000.
For direct local sign-in, include the Admin and Platform Admin origins
on ports 3003 and 3002 in the API’s `CORS_ORIGINS` list.

```text
apps/
  admin/             Turf owner and staff dashboard
  portal/            Customer booking and public gateway
  saas/              Landing page and owner application
  platform/          Platform Admin console and sign-in
packages/
  web-shared/        Shared UI, branding and API types
```

## Independent deployment

Build one app with `yarn workspace @turforg/<app> build`, where `<app>` is
`admin`, `portal`, `saas` or `platform`. Use four Vercel projects with
the corresponding `apps/<app>` roots. Use the repository’s Yarn workspace
install, include source files outside each root for the shared package,
and enable **Skip deployment** for unaffected projects.

Set these environment variables before moving production traffic.

| Project | Variable | Value |
| --- | --- | --- |
| All | `API_PROXY_TARGET` | The Render API origin |
| Admin | `NEXT_PUBLIC_PORTAL_ORIGIN` | The public booking origin used in website links |
| SaaS | `OWNER_APP_ORIGIN` | The owner dashboard origin |
| SaaS | `NEXT_PUBLIC_SITE_URL` | The existing public origin used by customers |
| Platform | `SAAS_APP_ORIGIN` | The SaaS origin linked from Platform Admin |
| Platform | `NEXT_PUBLIC_SITE_URL` | The existing public Platform Admin origin |
| Portal | `NEXT_PUBLIC_SITE_URL` | The canonical public origin for booking links and SEO |
| Portal | `SAAS_APP_ORIGIN` | The standalone SaaS deployment origin |
| Portal | `PLATFORM_APP_ORIGIN` | The standalone Platform Admin deployment origin |
| Portal | `ADMIN_APP_ORIGIN` | The standalone Owner Admin deployment origin |

Deploy the upstream apps before switching the existing gateway project to
`apps/portal`. Keep its public, owner and platform hostnames attached. The
gateway forwards pages and assets on the requested host, so browser API
requests and session cookies stay on that host. Keep public sign-in and
booking origins in the API’s `CORS_ORIGINS` list. Verify owner and platform
sign-in, Apply, and a scoped customer booking through the gateway.


---

## 🎨 Adding shadcn/ui Components

Add components as needed:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add sidebar
npx shadcn@latest add card
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add calendar
```

Or add multiple at once:
```bash
npx shadcn@latest add button input form table dialog sheet sidebar card
```

---

## 📋 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

---

## 🎯 Next Steps

1. **Install dependencies:** `npm install`
2. **Run dev server:** `npm run dev`
3. **Add shadcn components** as needed
4. **Build features:**
   - Login page
   - Dashboard layout (sidebar + header)
   - Ground management
   - Booking management
   - Customer management
   - Staff management
   - Payment tracking
   - Reports & analytics

---

## 📄 License

Private project - Code Cohen
# truf-single-vendor
