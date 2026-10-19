# UI Documentation

## Visual direction
The UI uses a warm, craft-forward look with strong contrast, rounded cards, and clear accent color usage. The intent is to feel calm and handmade rather than corporate or generic.

## Design tokens
- Background and surface colors live in `src/app/globals.css`.
- Typography uses Poppins for headings and Source Sans 3 for body text.
- Layout spacing follows an 8px rhythm with consistent card padding and gaps.

## Core layout pieces
- The root layout wraps every page with the shared navbar, footer, cart provider, and toast provider.
- The navbar adapts between desktop and mobile navigation.
- The footer repeats key marketplace links and keeps the marketplace CTA visible.

## Key screens
- Home page: marketplace introduction and feature highlights.
- Marketplace and products: browse and filter products, then open product detail pages.
- Auth screens: login and register pages with inline validation feedback.
- Cart and checkout: step through order review and shipping details.
- Payment flow: payment handoff page and success page.
- Dashboard: seller profile, product management, inventory, and related seller tools.

## Interaction patterns
- Primary actions use prominent buttons and secondary actions stay visually lighter.
- Empty, loading, and error states are surfaced directly in the page area.
- Protected routes redirect unauthenticated users back to login.

## Reusable components
- Shared UI primitives live in `src/components/ui`.
- Navigation, footer, cart, payment, review, product, orders, and seller components are split by domain.