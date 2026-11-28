# Proposal

## Why

Customers need a way to choose among the themes the portal already renders. When the portal and admin run on the same browser origin, they currently read the same saved preference.

## What Changes

- Let customers choose Manchester (light), Dark, Pitch, or System from the desktop header and mobile menu. Make the control available before and after sign-in.
- Apply the choice immediately across customer pages and remember it in the same browser and origin. Use Manchester when the portal has no saved choice.
- Give the portal its own saved preference so customers and staff can make independent choices on the same origin.

## Capabilities

### New Capabilities

- `customer-portal-theme` covers theme selection, browser persistence, and preference isolation for the customer booking portal.

### Modified Capabilities

## Impact

The portal root layout, desktop header, and mobile menu use the existing shared theme provider, palette tokens, and UI primitives. The preference lives in browser storage and applies to customer routes at the root and under `/turf/<slug>`.
