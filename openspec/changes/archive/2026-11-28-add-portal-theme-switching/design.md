# Design

## Context

The portal already wraps customer routes in the shared `Providers` component. Its `next-themes` provider applies the theme class to `<html>`, and the portal imports the shared palette tokens. The portal can also serve admin and platform pages through same-origin rewrites, where those apps can access the same browser storage. See [proposal.md](proposal.md) for the motivation and [the spec](specs/customer-portal-theme/spec.md) for the behavior.

## Goals / Non-Goals

Keep theme state in the existing provider and use the shared palettes for customer pages. Scope the preference to one browser and origin. Venues served under different paths on the same origin share the customer preference, while separate hostnames have their own storage.

## Decisions

1. **Configure storage at the portal root.** Add an optional theme storage key to the shared `Providers` component and pass `portal-theme` from `apps/portal/src/app/layout.tsx`. Admin and platform use the provider's default `theme` key. The same provider also hosts React Query, so this keeps one provider tree and uses the existing theme script to apply the saved preference before the page paints.
2. **Reuse one set of choices in the two navigation layouts.** Reuse the shared `ThemeToggle` dropdown in the desktop header. Use the shared dropdown radio primitives so the current selection is available to assistive technology. In the mobile menu, offer a labeled inline radio group inside the existing sheet so customers can switch themes without opening a second overlay. Share the option values and labels between the controls, and give each mobile option a touch target of at least 44 px.
3. **Use the chosen option as the selected value.** Read `theme` for the selected control value so System stays selected even when the resolved palette changes. Keep the accessible control label stable during hydration and render the selected option once the client can read the saved choice.

## Risks / Trade-offs

- The shared provider's default storage key matters for same-origin compatibility. Verify isolation in both directions with the portal gateway serving the dashboard.
- The desktop header already contains booking, account, and venue controls. Check the theme trigger at the breakpoint where desktop navigation first appears. Check visible focus and touch targets in the mobile sheet.

## Migration Plan

Start the portal preference with an empty `portal-theme` key. A browser that only has the legacy `theme` preference starts the customer portal in Manchester and keeps its saved theme for staff pages.
