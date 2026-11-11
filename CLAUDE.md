

Project Scope

## Cross-Repository Instructions

Claude Code starts from the turf-admin repository.

Backend repository: ../turf-api

### For Backend or Full-Stack Tasks

1. Read ../turf-api/CLAUDE.md before making backend changes.
2. Follow the backend repository's coding standards.
3. Inspect existing backend code before implementation.
4. Use relevant backend memory when available.
5. Never assume backend memory is automatically loaded.
6. Verify API contracts before changing frontend integration.
7. Run relevant tests in each modified repository.
8. Review Git changes separately for both repositories.

### Memory Rules

- Frontend tasks: use frontend project memory.
- Backend tasks: use backend-specific memory.
- Full-stack tasks: use relevant context from both.
- Never apply outdated memory without verifying current code.
- Never duplicate backend business logic in the frontend.

- This repository is the Next.js 14 App Router frontend for the Turf Management System v1.
- It contains the admin dashboard and customer booking portal.
- The separate sibling repository ../turf-api is the NestJS 12 backend and owns API endpoints, database, authentication enforcement, booking/payment business logic, and integrations.
- This file contains frontend development rules only. Do not implement Prisma, Stripe webhooks, SendGrid delivery, NestJS controllers, or database migrations here.
- Verify current source and package.json before assuming any dependency, script, or folder exists.
Frontend Architecture
- Follow existing Next.js App Router conventions under src/app/, including the existing admin and portal route groups where present.
- Reuse shared components from src/components/ui/ and feature components from src/components/features/ where present.
- Keep UI presentation, reusable hooks, API clients, form validation, and types appropriately separated based on the actual project structure.
- Prefer Server Components where suitable; use Client Components for interactivity, browser APIs, and client state.
- Respect existing authentication/session and data-fetching patterns; do not invent a parallel architecture.
Senior-Level Code Quality
- Write readable, maintainable, production-ready TypeScript. Avoid any and unsafe type assertions; follow the current tsconfig without changing strictness unrequested.
- Follow DRY, KISS, separation of concerns, and existing conventions. Do not over-engineer.
- Prefer named exports except where Next.js requires default exports.
- Use descriptive names, focused components/functions, and feature-specific helpers rather than catch-all utility files.
- Reuse existing UI components, hooks, themes, schemas, and API clients before creating new ones.
- Avoid unrelated refactors, unapproved dependencies, and premature memoization.
- Use Prettier and the project's configured lint rules; do not suppress warnings without a justified reason.
Mobile-First UX (Critical)
- Customers and staff primarily use phones. Design every UI change mobile-first.
- Verify widths of 320, 375, 390, and 430 px, then tablet and desktop layouts.
- Use responsive layouts, touch-friendly controls, readable text, accessible labels, and usable mobile forms.
- Avoid horizontal overflow, clipped dialogs, inaccessible navigation, and fixed widths that break on small screens.
- Respect the existing design system, theme tokens, spacing, and colors; do not introduce arbitrary hardcoded colors.
- Provide loading, empty, error, success, and disabled states where relevant.
- Preserve keyboard accessibility and sensible focus behavior.
API Integration (Cross-Repo Boundary)
- Frontend consumes the backend through /api/v1; the frontend may proxy requests to the API server.
- Before adding or changing API calls, inspect existing frontend API clients and the actual backend contract.
- Account for backend response envelopes ({ success: true, data } or { success: false, error }) and nested pagination data as implemented.
- Treat server-side authorization, payment verification, slot availability, pricing, and cancellation rules as backend-owned.
- Frontend may validate inputs for UX but must not be the sole enforcer of business rules.
- Do not expose secrets, store sensitive tokens in localStorage, or log private customer/payment data.
- Do not modify ../turf-api unless the task requires it.
Multi-Repository Claude Workflow
- Claude Code usually starts from this turf-admin repository.
- Backend path: ../turf-api (only if present and accessible).
- For backend or full-stack tasks, explicitly read ../turf-api/CLAUDE.md before backend edits.
- Determine whether a request affects frontend, backend, or both. Never assume both must change.
- Check Git branch and working tree separately in every affected repository.
- Coordinate request/response contracts and verify integration after cross-repo changes.
- If backend access is unavailable, explain the limitation instead of guessing or fabricating an API.
- Example startup from this repository: claude --add-dir ../turf-api (subject to Claude Code permissions).
Agentic Development Workflow
1. Analyze: Read relevant files, existing patterns, active branch, and working-tree changes.
2. Plan: For nontrivial tasks, outline the smallest safe implementation and key edge cases.
3. Implement: Make focused, reusable changes within the appropriate repository.
4. Verify: Run available frontend type-check/lint/tests/build; use Playwright for critical UI flows when configured, especially mobile.
5. Review: Inspect Git diff; report changed files, behavior, verification results, and any untested items.
Never claim tests passed unless they were run. Never commit, push, discard user changes, or run destructive commands without explicit approval.
RAG Learning Notes
- When the user is actively learning RAG in this project, maintain docs/rag-learning.md in Bangla with English technical terms.
- Add verified concepts and practical examples learned during the task; avoid duplicate or speculative notes.
- Do not implement RAG features unless specifically requested.
Frontend Product Constraints
- Preserve current customer/admin booking, authentication, payment-option, and cancellation UX as defined by the backend contract.
- The frontend may display card (Stripe Checkout), cash at venue, and manual bKash/Nagad options when enabled by backend settings; never pretend manual wallet payments are automatically verified.
- Keep v1 scope focused: do not introduce native mobile apps, coupons, loyalty, multi-branch support, or unsupported payment methods without approval.
- Responsive mobile web UI is required; this does not imply building a native mobile app.
Commands
- Inspect package.json and the lockfile to determine the actual package manager and scripts.
- Use existing project commands for development, linting, type checking, testing, and builds; do not assume missing scripts exist.
Final Rule
When in doubt, inspect the code and ask before making architectural or destructive changes. Keep changes focused and ship v1 safely.
