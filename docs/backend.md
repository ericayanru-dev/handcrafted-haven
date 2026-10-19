# Backend Documentation

## Overview
The backend is implemented in Next.js route handlers and service classes under `src/back-end`. Route handlers keep the HTTP layer thin, while the service layer handles validation, authorization, and data orchestration.

## Core backend responsibilities
- Authenticate users with JWT access and refresh tokens.
- Validate request bodies with Zod before touching the database.
- Enforce ownership checks for seller, product, review, and order data.
- Keep product, order, and review aggregates in sync with the database.
- Send transactional emails for signup and login events.

## Main service areas
- Auth service: signup, login, and email verification.
- Product service: product listing, detail lookup, create, update, and delete.
- Cart service: add, update, remove, clear, and read cart contents.
- Order service: checkout, order history, order lookup, and status updates.
- Review service: create, read, update, and delete product reviews.
- Seller profile service: create, read, update, and delete seller profiles.

## Auth flow
1. Signup validates the request, hashes the password, creates the user, and sends a verification email.
2. Login verifies credentials, updates the last login timestamp, sends a login alert email, and creates access and refresh tokens.
3. Protected dashboard routes use the proxy layer to redirect unauthenticated users.

## File and integration services
- Email delivery uses Resend templates under `src/back-end/lib/email/templates`.
- Blob cleanup uses `@vercel/blob` when product images are replaced or removed.
- JWT signing and verification are centralized in the token utility.

## Operational notes
- The current payment UI uses order status updates for handoff testing rather than a live gateway.
- Login and signup trigger email side effects, so a working email provider is required in production.