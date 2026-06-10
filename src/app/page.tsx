export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { haikus, categories, events } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import StreakCounter from "@/components/StreakCounter";
import SurpriseMeButton from "@/components/SurpriseMeButton";

function getToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return { mmdd: `${month}-${day}`, year: now.getFullYear(), month, day };
}

function getYesterday() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return { mmdd: `${month}-${day}`, year: now.getFullYear(), month, day };
}

function formatDate(mmdd: string) {
  const [m, d] = mmdd.split("-").map(Number);
  return new Date(0, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

async function getTodayHaiku(mmdd: string, year: number) {
  const result = await db
    .select({
      id: haikus.id,
      line1: haikus.line1, line2: haikus.line2, line3: haikus.line3,
      title: haikus.title, authorName: haikus.authorName,
      categoryName: categories.name, categoryColor: categories.color,
      isFiller: haikus.isFiller,
      eventHeadline: haikus.eventHeadline,
      eventDescription: haikus.eventDescription,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .where(and(eq(haikus.date, mmdd), eq(haikus.year, year), eq(haikus.status, "approved")))
    .limit(1);
  return result[0] ?? null;
}

async function getYesterdayHaiku(mmdd: string, year: number) {
  const result = await db
    .select({ id: haikus.id })
    .from(haikus)
    .where(and(eq(haikus.date, mmdd), eq(haikus.year, year), eq(haikus.status, "approved")))
    .limit(1);
  return result[0] ?? null;
}

async function getTodayEvents(month: number, day: number) {
  return db
    .select({
      id: events.id,
      title: events.title,
      year: events.year,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(events)
    .leftJoin(categories, eq(events.categoryId, categories.id))
    .where(and(eq(events.month, month), eq(events.day, day)))
    .limit(5);
}

async function getRecentHaikus() {
  return db
    .select({
      id: haikus.id, date: haikus.date,
      line1: haikus.line1, line2: haikus.line2, line3: haikus.line3,
      title: haikus.title, authorName: haikus.authorName,
      categoryName: categories.name, categoryColor: categories.color,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .where(eq(haikus.status, "approved"))
    .orderBy(desc(haikus.createdAt))
    .limit(8);
}

async function getCategoryStats() {
  const all = await db.select().from(categories);
  const out: { name: string; slug: string; color: string; count: number }[] = [];
  for (const cat of all) {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(haikus)
      .where(and(eq(haikus.categoryId, cat.id), eq(haikus.status, "approved")));
    out.push({
      name: cat.name, slug: cat.slug,
      color: cat.color ?? "#c9a84c",
      count: Number(result[0]?.count ?? 0),
    });
  }
  return out;
}

export default async function HomePage() {
  const { mmdd, year, month, day } = getToday();
  const yesterday = getYesterday();
  const [todayHaiku, yesterdayHaiku, todayEvents, recentHaikus, categoryStats] = await Promise.all([
    getTodayHaiku(mmdd, year),
    getYesterdayHaiku(yesterday.mmdd, yesterday.year),
    getTodayEvents(Number(month), Number(day)),
    getRecentHaikus(),
    getCategoryStats(),
  ]);

  return (
    <div>
      <div className="max-w-5xl mx-auto px-6">
        <section className="pt-10 pb-4 flex items-center justify-between">
          <p className="text-xs text-[var(--ink-muted)] tracking-widest uppercase">{formatDate(mmdd)}</p>
          <StreakCounter />
        </section>

        {todayEvents.length > 0 && !todayHaiku && (
          <section className="pb-6 animate-fade-up">
            <p className="text-[11px] text-[var(--accent)] tracking-widest uppercase mb-2">On this day</p>
            <div className="flex flex-wrap gap-2">
              {todayEvents.slice(0, 3).map((evt) => (
                <Link
                  key={evt.id}
                  href="/write"
                  className="group"
                >
                  <span className="inline-block text-xs text-[var(--ink-muted)] border border-[var(--rule)] px-3 py-1.5 hover:border-[var(--accent)] hover:text-[var(--ink)] transition-colors">
                    {evt.year && <span className="text-[var(--accent)]">{evt.year}</span>}
                    {evt.year && <span> \u2014 </span>}
                    {evt.title}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {todayHaiku ? (
          <>
            {!todayHaiku.isFiller && todayHaiku.eventHeadline && (
              <section className="pb-8 border-b border-[var(--rule)]">
                <div className="kinetic-stack">
                  <p className="kinetic-word">{todayHaiku.eventHeadline.split(" ").slice(0, -2).join(" ")}</p>
                  <div className="flex gap-3 items-baseline flex-wrap">
                    <p className="kinetic-word-outline">
                      {todayHaiku.eventHeadline.split(" ").slice(-2, -1)[0] || ""}
                    </p>
                    <p className="kinetic-word">
                      {todayHaiku.eventHeadline.split(" ").slice(-1)[0] || ""}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="pt-8 pb-10">
              <div className="gallery-frame p-8 md:p-10 mb-6 animate-fade-up">
                <Link href={`/haiku/${todayHaiku.id}`} className="block group">
                  <div className="font-serif text-[clamp(1.5rem,4vw,2.25rem)] leading-[1.35] space-y-1 mb-5">
                    <p>{todayHaiku.line1}</p>
                    <p>{todayHaiku.line2}</p>
                    <p>{todayHaiku.line3}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--ink-muted)]">
                    {todayHaiku.authorName && <span>&mdash; {todayHaiku.authorName}</span>}
                    {todayHaiku.title && <span className="text-xs">&ldquo;{todayHaiku.title}&rdquo;</span>}
                    {todayHaiku.categoryName && (
                      <span className="text-xs text-[var(--accent)]">{todayHaiku.categoryName}</span>
                    )}
                  </div>
                </Link>
              </div>

              {!todayHaiku.isFiller && todayHaiku.eventDescription && (
                <div className="glass-card p-6 mb-8 animate-fade-up">
                  <p className="text-sm text-[var(--ink)] leading-relaxed">
                    {todayHaiku.eventDescription}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-5 animate-fade-up">
                <Link
                  href={`/haiku/${todayHaiku.id}`}
                  className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors underline underline-offset-2"
                >
                  View full post &rarr;
                </Link>
                <Link
                  href="/write"
                  className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                >
                  Write yours
                </Link>
                <SurpriseMeButton />
              </div>
            </section>
          </>
        ) : (
          <section className="pt-8 pb-10 animate-fade-up">
            <div className="kinetic-stack mb-6">
              <p className="kinetic-word">today&rsquo;s</p>
              <div className="flex gap-3 items-baseline flex-wrap">
                <p className="kinetic-word-outline">empty</p>
                <p className="kinetic-word">page</p>
              </div>
            </div>

            {todayEvents.length > 0 && (
              <p className="text-sm text-[var(--ink-muted)] mb-2 max-w-md">
                {todayEvents.length} event{todayEvents.length > 1 ? "s" : ""} happened on this day. Pick one and write the haiku.
              </p>
            )}

            <div className="flex items-center gap-4 mt-6">
              <Link
                href="/write"
                className="inline-block text-sm text-[var(--ink)] border-2 border-[var(--ink)] px-5 py-2.5 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
              >
                Write today&rsquo;s haiku
              </Link>
              <SurpriseMeButton />
            </div>
          </section>
        )}

        {yesterdayHaiku && (
          <div className="pb-6 animate-fade-up">
            <Link
              href={`/haiku/${yesterdayHaiku.id}`}
              className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              &larr; Yesterday&rsquo;s haiku
            </Link>
          </div>
        )}
      </div>

      <section className="bg-[var(--surface)] border-t border-[var(--rule)]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-2">
            {categoryStats.map((cat) => (
              <Link
                key={cat.slug}
                href={`/browse?category=${cat.slug}`}
                className="text-xs text-[var(--ink-muted)] border border-[var(--rule)] px-3 py-1.5 hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors"
              >
                {cat.name}
                {cat.count > 0 && (
                  <span className="ml-1.5 text-[var(--accent)]">{cat.count}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {recentHaikus.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-12">
          <div className="section-rule" />
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-[var(--ink-muted)] tracking-widest uppercase">Recent haikus</p>
            <Link
              href="/browse"
              className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              Browse all &rarr;
            </Link>
          </div>
          <div className="columns-1 sm:columns-2 gap-8">
            {recentHaikus.map((haiku, i) => (
              <Link
                key={haiku.id}
                href={`/haiku/${haiku.id}`}
                className="block break-inside-avoid mb-6 group animate-reveal"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="gallery-frame p-5">
                  <div className="font-serif text-base leading-relaxed space-y-0.5 mb-3">
                    <p>{haiku.line1}</p>
                    <p>{haiku.line2}</p>
                    <p>{haiku.line3}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
                    <span>{formatDate(haiku.date)}</span>
                    {haiku.categoryName && <span className="text-[var(--accent)]">{haiku.categoryName}</span>}
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">Read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
