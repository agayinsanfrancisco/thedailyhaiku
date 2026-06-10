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
      color: cat.color ?? "#bf2c24",
      count: Number(result[0]?.count ?? 0),
    });
  }
  return out;
}

async function getStats() {
  const [total] = await db
    .select({ count: sql<number>`count(*)` })
    .from(haikus)
    .where(eq(haikus.status, "approved"));
  return { totalHaikus: Number(total?.count ?? 0) };
}

export default async function HomePage() {
  const { mmdd, year } = getToday();
  const [todayHaiku, recentHaikus, categoryStats, stats] = await Promise.all([
    getTodayHaiku(mmdd, year),
    getRecentHaikus(),
    getCategoryStats(),
    getStats(),
  ]);

  return (
    <article className="max-w-5xl mx-auto px-6">
      <section className="pt-24 pb-16 border-b border-[var(--rule)]">
        <div className="flex items-start justify-between mb-12">
          <div className="space-y-1">
            <p className="text-xs text-[var(--ink-muted)] tracking-widest uppercase font-[system-ui]">
              {formatDate(mmdd)}, {year}
            </p>
            <p className="text-xs text-[var(--ink-muted)] font-[system-ui]">
              Day {String(year).slice(-2)}{mmdd.replace("-", "")}
            </p>
          </div>
          {stats.totalHaikus > 0 && (
            <p className="text-xs text-[var(--ink-muted)] font-[system-ui] tabular-nums">
              {stats.totalHaikus} haiku{stats.totalHaikus !== 1 ? "s" : ""} published
            </p>
          )}
        </div>

        {todayHaiku ? (
          <div className="animate-fade-up">
            <div className="text-[var(--accent)] text-xs font-[system-ui] tracking-widest uppercase mb-6">
              Today&rsquo;s Haiku
            </div>
            <div className="text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.3] space-y-1.5 mb-6">
              <p>{todayHaiku.line1}</p>
              <p>{todayHaiku.line2}</p>
              <p>{todayHaiku.line3}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-[var(--ink-muted)]">
              {todayHaiku.authorName && <span>&mdash; {todayHaiku.authorName}</span>}
              {todayHaiku.title && (
                <span className="text-xs italic">&ldquo;{todayHaiku.title}&rdquo;</span>
              )}
              {todayHaiku.categoryName && (
                <span className="text-xs">in {todayHaiku.categoryName}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-fade-up">
            <p className="text-[var(--ink-muted)] text-sm font-[system-ui] mb-6">
              No haiku has been written for today yet.
            </p>
            <div className="text-[clamp(2rem,5vw,3.5rem)] leading-[1.3] space-y-1.5 mb-8 text-[var(--ink-muted)]">
              <p>the day waits for</p>
              <p>the sound of your own words</p>
              <p>a breath, a verse, now</p>
            </div>
            <Link
              href="/write"
              className="inline-block border-2 border-[var(--ink)] px-8 py-3 text-sm font-[system-ui] tracking-wider uppercase hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
            >
              Write Today&rsquo;s Haiku
            </Link>
          </div>
        )}
      </section>

      {recentHaikus.length > 0 && (
        <section className="pt-16 pb-8">
          <h2 className="text-xs text-[var(--ink-muted)] font-[system-ui] tracking-widest uppercase mb-8">
            Recent Haikus
          </h2>
          <div className="columns-1 sm:columns-2 gap-8 [column-rule:1px_solid_var(--rule)]">
            {recentHaikus.map((haiku, i) => (
              <Link
                key={haiku.id}
                href={`/haiku/${haiku.id}`}
                className="block break-inside-avoid mb-8 p-0 group animate-reveal"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="border-t border-[var(--rule)] pt-4">
                  <div className="text-[17px] leading-[1.55] space-y-0.5 mb-3">
                    <p>{haiku.line1}</p>
                    <p>{haiku.line2}</p>
                    <p>{haiku.line3}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--ink-muted)]">
                    <span>{formatDate(haiku.date)}</span>
                    {haiku.categoryName && <span className="text-[var(--accent)]">{haiku.categoryName}</span>}
                    <span className="group-hover:text-[var(--ink)] transition-colors ml-auto opacity-0 group-hover:opacity-100">
                      Read
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="py-16 border-t border-[var(--rule)]">
        <h2 className="text-xs text-[var(--ink-muted)] font-[system-ui] tracking-widest uppercase mb-8">
          Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-12 gap-y-4">
          {categoryStats.map((cat) => (
            <div key={cat.slug} className="text-sm">
              <span className="text-[var(--accent)]">{cat.name}</span>
              <span className="text-[var(--ink-muted)] ml-2 tabular-nums">{cat.count}</span>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}