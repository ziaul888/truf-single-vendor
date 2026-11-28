# Tasks

## 1. Portal theme preference

- [x] 1.1 Add the optional storage key to the shared provider and configure `portal-theme` at the portal root. In a browser with only the legacy `theme` key, verify Manchester on the portal's first paint and verify that the dashboard still loads its saved theme.

## 2. Customer controls

- [x] 2.1 Reuse the shared dropdown in the desktop portal header. Expose the current choice with the existing radio menu primitives and verify the labeled trigger, visible focus, selection, and return focus with a keyboard.
- [x] 2.2 Add the inline theme radio group to `MobileMenu` using the same option labels and values. Verify touch and keyboard selection, visible focus, and usable layout at 320, 375, 390, and 430 px and around the desktop breakpoint.

## 3. Integration verification

- [x] 3.1 In the browser, exercise all four choices on portal routes. Verify immediate palette changes, persistence across navigation and reload on root and venue-prefixed routes, and persistence through sign-in and sign-out. Switch the device appearance while System is selected and verify that the applied palette follows it.
- [x] 3.2 On an origin that serves customer and staff pages, change each app's theme in turn and verify the other app still loads its saved choice. Run `yarn workspace @turforg/portal test:portal-navigation`, `yarn workspace @turforg/portal test:booking-requests`, `yarn workspace @turforg/portal build`, and `yarn lint`.
