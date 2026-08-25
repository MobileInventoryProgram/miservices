# Claude Code Notes — miServices

## Dev Server

- **Port**: 3000. The dev script is `npm run dev` which runs `next dev -p 3000 -H 0.0.0.0`.
- **Do NOT use port 5000** — macOS AirPlay Receiver permanently occupies it and will cause silent failures.
- `.env` must have `NEXT_PUBLIC_BASE_URL=http://localhost:3000` and `NEXTAUTH_URL=http://localhost:3000`.
- After making changes that affect layouts or config, **clear `.next` cache** (`rm -rf .next`) before restarting. Stale webpack chunks cause blank white pages.
- Always start the dev server yourself and verify it loads — never tell the user to do it.

## Working Style

- **Do everything**. Run scripts, start servers, verify results, fix errors. Never tell the user to run something — run it yourself.
- After making changes, verify they work: run builds, start the dev server, curl pages, check for errors.
- If something breaks, diagnose AND fix it in the same pass.

## Project Structure

- Next.js 14 App Router at `/Users/alexmccormick/miservices/miServices/`
- Sanity CMS v3 with embedded Studio at `/studio`
- Tailwind CSS 3 with PostCSS
- NextAuth v4 with CredentialsProvider and JWT sessions

## Layout Rules

- Only the root `app/layout.tsx` should declare `<html>` and `<body>` tags.
- Nested layouts must NOT re-declare `<html>` or `<body>` — this causes the global stylesheet to stop loading.
- The Studio layout (`app/studio/[[...tool]]/layout.tsx`) uses a `<div>` wrapper only.
- `components/ConditionalLayout.tsx` hides Header/Footer for `/members` and `/studio` routes.

## Sanity

- Project ID: `a4q9j3x1`, dataset: `production`
- The API token in `.env` does NOT have project management permissions (can't add CORS origins via API).
- CORS origin `http://localhost:3000` with credentials must be added manually at manage.sanity.io if Studio gives a CORS error.

## Members Area

- Auth: NextAuth v4 with JWT strategy. Member → Franchisee linked via Sanity reference (franchiseeId), with territory string as legacy fallback.
- Session carries: `id`, `name`, `email`, `role`, `franchiseeId`, `territory`.
- `getFranchiseeForSession(session)` resolves by reference first, falls back to territory.
- Pricing: `ensureFranchiseePricing(franchiseeId)` auto-creates a pricing doc if none exists.
- Documents category has subcategories (general, operating-procedures, personnel, training). Other categories are flat.

## Scripts

- Run with: `npx tsx --env-file=.env scripts/<name>.ts`
- Seed scripts are idempotent (check existence, create or update).
