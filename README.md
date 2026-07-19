# Shelterflex Web

Next.js web app for **Shelterflex**, a Rent Now, Pay Later (RNPL) rental platform.
Provides the UI for tenants, landlords, whistleblowers, freelance inspectors and admins.

Part of the Shelterflex ecosystem — see the
[ecosystem overview](https://github.com/Shelterflex/shelterflex-platform/blob/main/ECOSYSTEM.md).

## Setup

**Prerequisites:** Node.js 20+ and npm (ships with Node — nothing extra to install).

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000`.

### Only the install step is enforced

Installing with pnpm or yarn is blocked, and fails immediately with
instructions rather than doing something subtly wrong. The reason:
`package-lock.json` is the committed lockfile and CI runs `npm ci`. Installing
with pnpm or yarn ignores that lockfile and resolves a different dependency
tree than CI, which produces bugs that reproduce for you and nobody else. The
guard lives in `scripts/ensure-npm.mjs`.

### Backend

The app talks to [shelterflex-api](https://github.com/Shelterflex/shelterflex-api),
expected on `http://localhost:4000` by default. Point it elsewhere with:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000 npm run dev
```

You do not need the backend running to work on screens still served by mock data
(see below).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve a production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest, with coverage) |
| `npm run test:e2e` | Playwright tests |

## Data sources

The app is mid-migration from mock data to the live API, and currently uses both:

- **Live API** — 23 modules under `lib/*Api.ts`, routed through the shared
  `apiFetch` helper in `lib/api.ts`.
- **Mock data** — `lib/mockData/`, still imported by 16 files, mostly dashboard
  and marketing pages.

When wiring a screen to the backend, add or extend a module under `lib/` rather
than calling `fetch` directly from a component, and drop the corresponding mock
import once the screen is live.

## Conventions

- Keep backend calls centralized in `lib/` — avoid raw `fetch` in components.
- Paths passed to `apiFetch` are version-relative. `lib/api.ts` prepends the API
  version prefix, so a path must **not** start with `/api` or `/api/v1`.

## Design system

Open `/design-system` in dev for the component showcase: responsive breakpoints,
theme tokens, and button variants (`primary`, `secondary`, `outline`, `ghost`).

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Open issues live in
[this repository's tracker](https://github.com/Shelterflex/shelterflex-web/issues).
