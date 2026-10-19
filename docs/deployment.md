# Deployment Guide

## Target platform
The project is structured for deployment on Vercel with PostgreSQL, Prisma, Resend, and Vercel Blob integrations.

## Required environment variables
Set these before running locally or deploying:
- `DATABASE_URL`
- `NEXT_PUBLIC_BASE_URL`
- `JWT_SECRET`
- `JWT_SIGNING_SECRET`
- `JWT_ENCRYPTION_SECRET`
- `RESEND_API_KEY`

Depending on the deployment environment, you may also need the Vercel Blob configuration that powers image uploads.

## Local verification checklist
1. Install dependencies with `npm install`.
2. Confirm the database is reachable.
3. Generate Prisma artifacts if needed for your environment.
4. Run `npm run lint`.
5. Run `npm run build`.
6. Start the app with `npm run dev` and verify the main flows.

## Production checklist
- Set all environment variables in the hosting platform.
- Confirm the PostgreSQL database is accessible from the deployed app.
- Verify sign up, login, checkout, reviews, and seller dashboard flows.
- Check that email delivery and blob uploads work in the production environment.
- Confirm protected dashboard routes still redirect unauthenticated visitors.

## Release notes to remember
- The payment flow is currently a UI handoff that updates order status.
- Dashboard routes are guarded by the app proxy.
- Product images and some email flows depend on external services, so deployment requires those secrets to be present.