# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project scope at a glance
- Full‑stack TypeScript app (Vite + React + Tailwind) with an Express API that is mounted in dev and bundled for production.
- Separate Django REST backend (kmrl_backend) used for data ingestion and ML workflows; the TS server forwards certain routes to it in dev/prod.
- Package manager is pnpm (see package.json "packageManager"); prefer pnpm commands.

Common commands

JavaScript/TypeScript workspace (Vite + Express)
- Install deps
  - pnpm install
- Run dev server (Vite + Express middleware on port 5000)
  - pnpm dev
- Build
  - Full build (client + server): pnpm build
  - Client only: pnpm build:client
  - Server only: pnpm build:server
- Run production server (after build)
  - pnpm start
  - Notes: serves SPA from dist/spa and API from dist/server/node-build.mjs; PORT defaults to 3000
- Type checking
  - pnpm typecheck
- Format (Prettier)
  - pnpm format.fix
- Tests (Vitest)
  - Run all: pnpm test
  - Run a single file: pnpm vitest client/lib/utils.spec.ts --run
  - Run a single test by name: pnpm vitest -t "cn function" --run

Django backend (kmrl_backend)
- Run development server (default 127.0.0.1:8000)
  - python kmrl_backend/manage.py runserver 0.0.0.0:8000
- Apply migrations
  - python kmrl_backend/manage.py migrate
- Run tests
  - python kmrl_backend/manage.py test
- Environment
  - The backend reads .env (dotenv) and supports SUPABASE_DATABASE_URL (preferred) or falls back to SQLite. CORS allows http://localhost:5000 during dev.

How things fit together

- Frontend (client/)
  - React app (Vite, Tailwind, shadcn/ui) lives under client/ (see client/pages/*, client/components/ui/*). Path aliases: "@" → ./client, "@shared" → ./shared (tsconfig.json).
  - In dev, Vite serves the SPA at http://localhost:5000.

- TypeScript API (server/)
  - Express app is defined in server/index.ts (createServer) with routes like:
    - GET /api/ping (uses env PING_MESSAGE)
    - GET /api/demo
    - POST /api/ingest (forwards CSV payloads to the Django REST API at http://localhost:8000/api/csv/ingest/)
  - In dev, vite.config.ts mounts the Express app as middleware on the Vite server (expressPlugin). This lets the SPA and API share port 5000.
  - For production, vite.config.server.ts bundles server/node-build.ts to dist/server/node-build.mjs (SSR/Node target). node-build serves the built SPA (dist/spa) and exposes the API on PORT (default 3000).

- Shared code (shared/)
  - Type definitions and cross-cutting utilities shared between client and server via the @shared alias.

- Django REST backend (kmrl_backend/)
  - kmrl_backend/fleet provides REST endpoints for authentication, CSV ingestion, ML training/prediction, and data retrieval (see fleet/urls.py and views.py). Project urls mount these under /api/ (kmrl_backend/urls.py).
  - Database is configured via dj_database_url using SUPABASE_DATABASE_URL when present; otherwise falls back to SQLite for local dev. CORS is enabled and whitelists http://localhost:5000 by default.
  - The Express route POST /api/ingest forwards CSV payloads to Django’s /api/csv/ingest/ and returns either the Django response or a local fallback if the backend is unavailable.

Typical local development flow
- Terminal A: Start Django
  - python kmrl_backend/manage.py migrate
  - python kmrl_backend/manage.py runserver 0.0.0.0:8000
- Terminal B: Start Vite + Express middleware
  - pnpm dev
- Visit http://localhost:5000 for the SPA; API is served under the same origin (dev) and forwards to Django for CSV/ML endpoints as needed.

Notable config files
- package.json
  - scripts: dev, build, build:client, build:server, start, test, typecheck, format.fix
  - packageManager is pnpm@10.x — prefer pnpm over npm/yarn
- tsconfig.json
  - Aliases: "@" → client, "@shared" → shared; includes client, server, shared, vite configs
- vite.config.ts
  - Dev server on 0.0.0.0:5000; Express middleware attached; denies access to server/** over Vite fs
- vite.config.server.ts
  - Node target (node22), SSR build of server/node-build.ts to dist/server/node-build.mjs; externalizes express and cors
- kmrl_backend/kmrl_backend/settings.py
  - dotenv, CORS, REST framework auth, database via SUPABASE_DATABASE_URL or SQLite fallback

Notes
- Linting: no ESLint config detected; use pnpm typecheck and pnpm format.fix.
- When running production Node server, ensure you first build both client and server (pnpm build).
- Ensure Django is reachable at http://localhost:8000 for CSV/ML routes during dev; otherwise the Express layer will fall back to local handling with a warning.
