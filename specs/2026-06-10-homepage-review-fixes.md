# Spec: Homepage engagement review fixes

Fixes for the findings of the five-axis review of commit `b2d6681` (homepage
engagement: streak counter, on-this-day events, yesterday link, surprise me,
LGBTQIA+ category).

## Objective

Resolve the two Critical and three Important review findings, plus the cheap
suggestions, so the homepage engagement features ship correct data and a
working flow. Success = a user sees deduplicated "on this day" events, real
em dashes, a Surprise Me button that always recovers, event chips that carry
the chosen event into the write flow, and factually correct LGBTQIA+ dates.

## Assumptions

1. Events are only inserted by `src/seed.ts` and (potentially) admin tooling —
   the dedup key `(month, day, title)` is safe as a uniqueness contract.
2. Production (spica via Coolify) reruns `npm start` on every deploy, so the
   seed-side dedupe will clean the production DB on the next deploy without a
   manual migration.
3. The "officially recognized" TDOV entry means the first White House
   proclamation (March 31, 2021), per Wikipedia/whitehouse.gov.
4. The streak intentionally rewards visiting (not writing); only the
   day-boundary timezone is being fixed.

## Tech Stack

Next.js 15.5.19 (App Router, async `params`/`searchParams`), Drizzle ORM on
libsql/SQLite (`data/thedailyhaiku.db`), Tailwind v4 CSS vars, no test
framework configured.

## Commands

- Build: `npm run build` (pushes schema via `drizzle-kit push --force`, then `next build`)
- Dev: `npm run dev`
- Seed: `DATABASE_URL=file:./data/thedailyhaiku.db npx tsx src/seed.ts`
- Start (prod): `npm start` (push → seed → `next start`)

## Changes

### 1. Seed duplication (Critical)

- `src/lib/db/schema.ts`: add unique index `events_month_day_title_unique` on
  `(month, day, title)`.
- `src/seed.ts`: before inserting events — (a) remap `haikus.eventId` from
  duplicate event rows to the surviving (min-id) row, (b) delete duplicate
  rows, (c) insert events with `onConflictDoNothing` targeting the new unique
  index instead of the PK (which never conflicts).
- Deploy ordering note: `npm start` runs `drizzle-kit push` *before* the seed.
  On the first production deploy the push may fail to create the unique index
  while duplicates still exist; that failure is already caught and non-fatal,
  the seed then dedupes, and the next deploy's push creates the index. The
  seed-side dedupe alone is sufficient to keep data clean in the interim.

### 2. Literal `—` rendered to users (Critical)

`src/app/page.tsx`: JSX text does not process JS escapes — replace
`<span> — </span>` with an expression containing the escape.

### 3. SurpriseMeButton stuck loading (Important)

`src/components/SurpriseMeButton.tsx`: reset loading state in `finally`-style
when no id is returned (404 / empty DB), so the button re-enables.

### 4. Event chip preselection (Important)

- `src/app/page.tsx`: chips link to `/write/<MM-DD>?event=<id>` instead of
  bare `/write`.
- `src/app/write/[date]/page.tsx`: split into a thin **server** page that
  awaits `params`/`searchParams` and a client component
  (`WriteDateClient.tsx`) holding all existing logic, receiving
  `initialEventId`. Preselect that event once events load (only if the id is
  present in the loaded list). Server-side read avoids the Next 15
  `useSearchParams`-requires-Suspense build error.

### 5. LGBTQIA+ date corrections (Important)

`data/additional-events.json`:
- Lawrence v. Texas argued **3/26**/2003 (was 3/27)
- Rachel Levine confirmed **3/24/2021** (was 7/2/2021)
- TDOV → **3/31/2021**, retitled to "White House issues first presidential
  proclamation for Transgender Day of Visibility" (was 1/24/2023)

### 6. Streak + page cleanups (Suggestions)

- `src/components/StreakCounter.tsx`: key streak days by *local* date
  components (not UTC `toISOString`); guard `count` with `Number(...)`.
- `src/app/page.tsx`: empty-state message drops the misleading capped count;
  fetch limit matches rendered chip count (3); `getToday`/`getYesterday`
  merged into one offset-based helper.

## Boundaries

- Always: keep Drizzle parameterized queries; match existing CSS-var styling;
  run `npm run build` before committing.
- Ask first: any further schema changes beyond the unique index; deleting
  events that are not exact `(month, day, title)` duplicates.
- Never: hand-edit production DB; commit secrets; drop `haikus` rows.

## Testing Strategy

No test framework exists. Verification is: `npm run build` passes; seed run
twice locally yields a stable event count with zero `(month, day, title)`
duplicates; haiku→event references survive the dedupe (no orphaned
`eventId`s pointing at deleted rows).

## Success Criteria

- `SELECT COUNT(*) - COUNT(DISTINCT month||'-'||day||'-'||title) FROM events`
  returns 0 locally after seeding twice.
- No `haikus.eventId` references a deleted event row.
- Page source contains an em dash, not the characters `—`.
- Visiting `/write/06-28?event=<id>` shows that event preselected.
- The three corrected entries match the cited sources.
- `npm run build` succeeds.

## Open Questions

None blocking — assumptions above were proceeded on; flag in review if wrong.
