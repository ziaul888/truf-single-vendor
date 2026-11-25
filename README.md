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

Run `yarn dev` for the operations app on port 3000, and `yarn dev:saas` for
the SaaS app on port 3001. The SaaS app serves both the landing page and
`/saas/apply`. Existing `/saas` and `/saas/apply` links on the operations
host redirect to the SaaS app and keep their query parameters.

```text
apps/
  operations/        Owner dashboard, platform admin and customer booking site
  saas/              Landing page and owner application
packages/
  web-shared/        Shared UI, branding and API types
```

## Independent deployment

Build the apps with `yarn workspace turf-admin build` and
`yarn workspace @turforg/saas build`. For Git deployments, import the same
repository as two Vercel projects with root directories `apps/operations`
and `apps/saas`. Use the repository’s Yarn workspace install, include source
files outside each root for the shared package, and enable **Skip deployment**
on both projects.

Set these environment variables before moving production traffic.

| Project | Variable | Value |
| --- | --- | --- |
| Both | `API_PROXY_TARGET` | The Render API origin |
| SaaS | `OWNER_APP_ORIGIN` | The owner dashboard origin |
| SaaS | `NEXT_PUBLIC_SITE_URL` | The canonical SaaS origin |
| Operations | `SAAS_APP_ORIGIN` | The SaaS origin |

Add the exact SaaS origin to the API’s existing `CORS_ORIGINS` list. The Apply
POST uses a same-origin proxy and the API checks the browser’s origin.
Keep the existing Render service and database. Verify the standalone SaaS
deployment and its Apply flow before activating the operations redirects.


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
