<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Local development

The app runs on **Postgres** (production uses a Coolify-managed instance; there is no SQLite fallback). To run locally you need a Postgres on `localhost:5432`.

**Option A — Homebrew (no Docker):**
```bash
brew install postgresql@16
brew services start postgresql@16
initdb /opt/homebrew/var/postgresql@16   # only if the data dir is uninitialized
createdb thedailyhaiku
# DATABASE_URL=postgres://<your-mac-username>@localhost:5432/thedailyhaiku
```

**Option B — Docker:**
```bash
docker compose up -d
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/thedailyhaiku
```

Then, once `DATABASE_URL` is in `.env.local` (see `.env.example`):
```bash
npm install
npm run setup    # drizzle-kit migrate + seed
npm run dev
```

**Schema changes:** edit `src/lib/db/schema.ts`, then `npm run db:generate` to create a new migration in `drizzle/`, and commit it. Migrations are applied at container start in production (`drizzle-kit migrate`) — never `push --force` (it recreates tables and loses data).
