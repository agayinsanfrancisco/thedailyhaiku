export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { haikus, categories } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

function getToday() {
  const now = new Date();
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
      eventSources: haikus.eventSources,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .where(and(eq(haikus.date, mmdd), eq(haikus.year, year), eq(haikus.status, "approved")))
    .limit(1);
  return result[0] ?? null;
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
  const { mmdd, year } = getToday();
  const [todayHaiku, recentHaikus, categoryStats] = await Promise.all([
    getTodayHaiku(mmdd, year),
    getRecentHaikus(),
    getCategoryStats(),
  ]);

  return (
    <div>
      <div className="max-w-5xl mx-auto px-6">
        <section className="pt-10 pb-4">
          <p className="text-xs text-[var(--ink-muted)] tracking-widest uppercase">{formatDate(mmdd)}</p>
        </section>

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

              <div className="flex items-center gap-4 animate-fade-up">
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
              </div>
            </section>
          </>
        ) : (
          <section className="pt-12 pb-16 animate-fade-up">
            <div className="kinetic-stack mb-8">
              <p className="kinetic-word">today&rsquo;s</p>
              <div className="flex gap-3 items-baseline flex-wrap">
                <p className="kinetic-word-outline">empty</p>
                <p className="kinetic-word">page</p>
              </div>
            </div>
            <p className="text-sm text-[var(--ink-muted)] mb-6 max-w-xs">
              No haiku for today yet. Be the first to write one.
            </p>
            <Link
              href="/write"
              className="inline-block text-sm text-[var(--ink)] border-2 border-[var(--ink)] px-5 py-2.5 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
            >
              Write today&rsquo;s haiku
            </Link>
          </section>
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
          <p className="text-xs text-[var(--ink-muted)] tracking-widest uppercase mb-6">Recent haikus</p>
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
