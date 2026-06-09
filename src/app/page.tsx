import Link from "next/link";
import { db } from "@/lib/db";
import { haikus, categories } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

function getTodayDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return { mmdd: `${month}-${day}`, month, day, year: now.getFullYear() };
}

async function getTodayHaiku(mmdd: string, year: number) {
  const result = await db
    .select({
      id: haikus.id,
      date: haikus.date,
      line1: haikus.line1,
      line2: haikus.line2,
      line3: haikus.line3,
      title: haikus.title,
      authorName: haikus.authorName,
      createdAt: haikus.createdAt,
      categoryName: categories.name,
      categoryColor: categories.color,
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
      id: haikus.id,
      date: haikus.date,
      line1: haikus.line1,
      line2: haikus.line2,
      line3: haikus.line3,
      title: haikus.title,
      createdAt: haikus.createdAt,
      authorName: haikus.authorName,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .where(eq(haikus.status, "approved"))
    .orderBy(desc(haikus.createdAt))
    .limit(9);
}

async function getCategoryStats() {
  const allCategories = await db.select().from(categories);
  const catStats: { name: string; slug: string; color: string; count: number }[] = [];
  for (const cat of allCategories) {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(haikus)
      .where(and(eq(haikus.categoryId, cat.id), eq(haikus.status, "approved")));
    catStats.push({
      name: cat.name,
      slug: cat.slug,
      color: cat.color ?? "#6366f1",
      count: Number(result[0]?.count ?? 0),
    });
  }
  return catStats;
}

async function getStats() {
  const total = await db.select({ count: sql<number>`count(*)` }).from(haikus).where(eq(haikus.status, "approved"));
  return { totalHaikus: Number(total[0]?.count ?? 0) };
}

function formatDate(mmdd: string) {
  const [m, d] = mmdd.split("-").map(Number);
  return new Date(0, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export default async function HomePage() {
  const { mmdd, year } = getTodayDate();
  const [todayHaiku, recentHaikus, categoryStats, stats] = await Promise.all([
    getTodayHaiku(mmdd, year),
    getRecentHaikus(),
    getCategoryStats(),
    getStats(),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100/30 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100/60 text-indigo-700 text-xs font-medium rounded-full mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {formatDate(mmdd)}, {year}
          </div>

          {todayHaiku ? (
            <div className="animate-fade-in">
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full mb-6">
                Today&apos;s Haiku
              </div>
              <div className="font-serif text-3xl sm:text-4xl md:text-5xl leading-relaxed text-gray-800 mb-6 space-y-2">
                <p>{todayHaiku.line1}</p>
                <p>{todayHaiku.line2}</p>
                <p>{todayHaiku.line3}</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                {todayHaiku.title && <span className="font-medium text-gray-700">&mdash; {todayHaiku.title}</span>}
                {todayHaiku.authorName && <span>by {todayHaiku.authorName}</span>}
                {todayHaiku.categoryName && (
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${todayHaiku.categoryColor ?? "#6366f1"}20`,
                        color: todayHaiku.categoryColor ?? "#6366f1",
                      }}
                  >
                    {todayHaiku.categoryName}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4 leading-tight">
                Today&apos;s Haiku
                <br />
                <span className="gradient-text">Hasn&apos;t Been Written Yet</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
                Pick a date, get inspired by pop culture history, and write a 5-7-5 verse that
                the world will read.
              </p>
              <Link
                href="/write"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 hover:shadow-xl hover:-translate-y-0.5"
              >
                Write the First Haiku
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-8 py-6 flex items-center justify-around">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalHaikus}</div>
            <div className="text-xs text-gray-400 mt-0.5">Haikus Published</div>
          </div>
          <div className="w-px h-10 bg-gray-100" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{categoryStats.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">Categories</div>
          </div>
          <div className="w-px h-10 bg-gray-100" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">365</div>
            <div className="text-xs text-gray-400 mt-0.5">Days to Fill</div>
          </div>
        </div>
      </section>

      {recentHaikus.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 mt-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Haikus</h2>
              <p className="text-gray-500 text-sm mt-1">The latest verses from our community</p>
            </div>
            <Link
              href="/write"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Write yours
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentHaikus.map((haiku, i) => {
              const delay = Math.min(i * 0.05, 0.3);
              return (
                <Link
                  key={haiku.id}
                  href={`/haiku/${haiku.id}`}
                  className="haiku-card group bg-white border border-gray-100 rounded-2xl p-6"
                  style={{ animationDelay: `${delay}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-400 font-medium">
                      {formatDate(haiku.date)}
                    </span>
                    {haiku.categoryName && (
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${haiku.categoryColor ?? "#6366f1"}15`,
                          color: haiku.categoryColor ?? "#6366f1",
                        }}
                      >
                        {haiku.categoryName}
                      </span>
                    )}
                  </div>
                  <div className="font-serif text-base leading-relaxed text-gray-700 space-y-1">
                    <p>{haiku.line1}</p>
                    <p>{haiku.line2}</p>
                    <p>{haiku.line3}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <span className="text-xs text-gray-400">
                      {haiku.authorName ?? "Anonymous"}
                    </span>
                    <span className="text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-6 mt-20">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
          <p className="text-gray-500 text-sm mt-1">Find haikus by theme</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categoryStats.map((cat) => (
            <div
              key={cat.slug}
              className="group relative overflow-hidden rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all cursor-pointer"
            >
              <div
                className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
                style={{ backgroundColor: cat.color }}
              />
              <div
                className="w-8 h-8 rounded-lg mb-2"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
              <div className="font-medium text-sm text-gray-900">{cat.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {cat.count} haiku{cat.count !== 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}