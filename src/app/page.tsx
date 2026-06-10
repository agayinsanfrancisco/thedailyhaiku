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
      color: cat.color ?? "#bf2c24",
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
    <div className="max-w-5xl mx-auto px-6">
      <section className="py-8 border-b border-[var(--rule)]">
        <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
          <span>{formatDate(mmdd)}</span>
          <span className="text-[var(--rule)]">/</span>
          <Link href="/write" className="text-[var(--accent)] hover:text-[var(--ink)] transition-colors">
            Write today&rsquo;s &rarr;
          </Link>
        </div>
      </section>

      <section className="py-6 border-b border-[var(--rule)]">
        <div className="flex flex-wrap gap-2">
          {categoryStats.map((cat) => (
            <Link
              key={cat.slug}
              href={`/browse?category=${cat.slug}`}
              className="text-xs text-[var(--ink-muted)] border border-[var(--rule)] px-3 py-1 hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors"
            >
              {cat.name}
              {cat.count > 0 && (
                <span className="ml-1.5 text-[var(--accent)]">{cat.count}</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="pt-12 pb-10">
        {todayHaiku ? (
          <div className="animate-fade-up">
            <Link href={`/haiku/${todayHaiku.id}`} className="block group">
              <div className="font-serif text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.3] space-y-1 mb-5">
                <p>{todayHaiku.line1}</p>
                <p>{todayHaiku.line2}</p>
                <p>{todayHaiku.line3}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--ink-muted)]">
                {todayHaiku.authorName && <span>&mdash; {todayHaiku.authorName}</span>}
                {todayHaiku.title && <span className="text-xs">&ldquo;{todayHaiku.title}&rdquo;</span>}
                {todayHaiku.categoryName && <span className="text-xs text-[var(--accent)]">{todayHaiku.categoryName}</span>}
              </div>
            </Link>
            {!todayHaiku.isFiller && todayHaiku.eventHeadline && (
              <div className="mt-6 border-t border-[var(--rule)] pt-5">
                <p className="font-serif text-base font-medium text-[var(--ink)] mb-1.5">
                  {todayHaiku.eventHeadline}
                </p>
                {todayHaiku.eventDescription && (
                  <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                    {todayHaiku.eventDescription}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-up">
            <p className="text-sm text-[var(--ink-muted)] mb-3">
              No haiku for today yet.
            </p>
            <Link
              href="/write"
              className="text-sm text-[var(--accent)] hover:text-[var(--ink)] transition-colors border-b border-[var(--accent-light)] hover:border-[var(--ink)]"
            >
              Write today&rsquo;s haiku
            </Link>
          </div>
        )}
      </section>

      {recentHaikus.length > 0 && (
        <section className="pt-6 pb-8 border-t border-[var(--rule)]">
          <p className="text-xs text-[var(--ink-muted)] mb-6">Recent haikus</p>
          <div className="columns-1 sm:columns-2 gap-8 [column-rule:1px_solid_var(--rule)]">
            {recentHaikus.map((haiku, i) => (
              <Link
                key={haiku.id}
                href={`/haiku/${haiku.id}`}
                className="block break-inside-avoid mb-6 p-0 group animate-reveal"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="border-t border-[var(--rule)] pt-3">
                  <div className="text-sm leading-relaxed space-y-0.5 mb-2">
                    <p>{haiku.line1}</p>
                    <p>{haiku.line2}</p>
                    <p>{haiku.line3}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
                    <span>{formatDate(haiku.date)}</span>
                    {haiku.categoryName && <span className="text-[var(--accent)]">{haiku.categoryName}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
