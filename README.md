# Handcrafted Haven App

This folder contains the Next.js application for the WDD 430 group project.

## Stack
- Next.js 16 App Router
- TypeScript
- Prisma + PostgreSQL
- CSS modules with shared design tokens
- Auth, email, and blob storage integrations

## Documentation
- [Documentation index](docs/README.md)
- [User guide](docs/user-guide.md)
- [UI documentation](docs/ui.md)
- [Backend documentation](docs/backend.md)
- [Database documentation](docs/database.md)
- [API documentation](docs/api.md)
- [Deployment guide](docs/deployment.md)

## Local Development
1. Install dependencies:

```bash
npm install
```

If you are using pnpm in your environment, `pnpm install` works as well.

2. Set up your environment variables for PostgreSQL, JWT, Resend, and Vercel Blob.

3. Start the dev server:

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Current Status
- Marketplace browsing, authentication, seller tools, reviews, inventory, and payment handoff flows are implemented.
- Theme tokens live in `src/app/globals.css` and the shared UI components.
- The project now includes backend, database, API, deployment, user, and UI documentation under `docs/`.

## Team Workflow
- Create a feature branch for your task.
- Open a pull request with a short summary and UI evidence when visuals change.
- Link your PR to the matching project board item.

## Useful Commands
```bash
npm run lint
npm run build
```
