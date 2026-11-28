# customer-portal-theme Specification

## Purpose

Lets customers choose and retain the appearance of the booking portal independently of staff tools.

## Requirements

### Requirement: Customers can select a portal theme

The customer portal SHALL offer Manchester (light), Dark, Pitch, and System on desktop and mobile to signed-out and signed-in customers. The control SHALL expose its label and selected option to assistive technology and support keyboard and touch interaction.

#### Scenario: Choose a theme from a customer page

- **GIVEN** a customer opens the theme control in the desktop header or mobile menu
- **WHEN** the customer selects Dark, Pitch, or Manchester
- **THEN** the portal immediately applies that theme to the current page
- **AND** the control reports the selected option when viewed again

#### Scenario: Use the selector with a keyboard

- **WHEN** the customer opens and operates the theme control with a keyboard
- **THEN** the currently selected option is identifiable and focus remains visible as the customer moves through the choices and makes a selection

### Requirement: The portal remembers a customer theme

The portal SHALL remember the selected option in the same browser and origin across customer pages, reloads, and changes in sign-in status. It SHALL use Manchester when the browser has no saved portal choice.

#### Scenario: Open the portal for the first time

- **GIVEN** the browser has no saved portal choice
- **WHEN** the customer visits a portal page
- **THEN** the portal displays Manchester on the initial render

#### Scenario: Revisit the portal after choosing a theme

- **GIVEN** the customer has selected Pitch
- **WHEN** the customer navigates from grounds to checkout, reloads a customer page, or signs in or out on the same origin
- **THEN** the portal displays Pitch

### Requirement: System follows the device appearance

When System is selected, the portal SHALL use the device's current light or dark preference and update when that preference changes while the portal is open.

#### Scenario: Device appearance changes

- **GIVEN** the portal theme option is System and the device appearance is light
- **WHEN** the device switches to dark appearance
- **THEN** the portal displays Dark
- **AND** System remains the selected option

### Requirement: Portal and staff theme preferences are independent

The portal SHALL maintain a separate theme preference from the admin and platform apps, including when those apps are served from the portal's browser origin.

#### Scenario: Existing staff preference on the same origin

- **GIVEN** the browser has a saved staff theme and no saved portal theme on the same origin
- **WHEN** the customer first opens the portal
- **THEN** the portal displays Manchester

#### Scenario: Switching a theme affects its own app

- **GIVEN** the portal and staff apps are served on the same origin and have saved theme choices
- **WHEN** the customer changes the portal theme
- **THEN** the staff apps keep their saved theme
- **AND** changing the theme from a staff app preserves the portal choice
