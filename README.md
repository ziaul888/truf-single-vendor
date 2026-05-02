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

## 📦 Installation

### 1. Install Dependencies
```bash
npm install
```

or with pnpm (faster):
```bash
pnpm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Then update values as needed.

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Folder Structure

```
turf-admin/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components (add with CLI)
│   │   └── providers.tsx       # Theme + Query providers
│   ├── lib/                    # Utilities & helpers
│   │   └── utils.ts            # cn(), formatCurrency(), etc.
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Zustand stores
│   ├── types/                  # TypeScript types
│   └── schemas/                # Zod schemas
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── components.json             # shadcn/ui config
├── next.config.mjs             # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
└── package.json
```

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
