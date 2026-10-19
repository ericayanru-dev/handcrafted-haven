# Database Documentation

## Database stack
The app uses PostgreSQL through Prisma. The Prisma client is generated into `src/back-end/database/generated/prisma` and the app uses a shared database connection under `src/back-end/database/db.ts`.

## Core models
- User: account identity, auth state, seller relation, reviews, cart, and orders.
- RefreshToken: long-lived auth refresh tokens with revocation tracking.
- SellerProfile: seller storefront information attached to one user.
- Product: product catalog records with seller ownership, price, stock, category, and image URL.
- Cart: one cart per user.
- CartItem: product quantities inside a cart.
- Order: checkout record with payment status, totals, and a unique payment reference.
- OrderItem: immutable snapshot of purchased items.
- Review: one review per user per product.

## Relationship summary
- A user may have one seller profile, one cart, many orders, many reviews, and many refresh tokens.
- A seller profile owns many products.
- A cart owns many cart items.
- An order owns many order items.
- A product can appear in cart items, order items, and reviews.

## Important constraints
- User email values are unique.
- A seller profile is unique per user.
- A cart is unique per user.
- A review is unique per product and user pair.
- Cart items are unique per cart and product pair.
- Order references are unique and act as the external payment-friendly identifier.

## Practical notes for developers
- Product stock is validated during add-to-cart, quantity updates, and checkout.
- Order creation snapshots title and price into order items so later product edits do not rewrite purchase history.
- Review stats are recomputed after create, update, and delete.