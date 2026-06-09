import Link from "next/link";
import { db } from "@/lib/db";
import { haikus, categories } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

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
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .where(eq(haikus.status, "approved"))
    .orderBy(desc(haikus.createdAt))
    .limit(6);
}

async function getCategoryCounts() {
  const allCategories = await db.select().from(categories);
  const counts: { name: string; slug: string; color: string; count: number }[] = [];
  for (const cat of allCategories) {
    const result = await db
      .select({ count: haikus.id })
      .from(haikus)
      .where(and(
        eq(haikus.categoryId, cat.id),
        eq(haikus.status, "approved"),
      ));
    counts.push({
      name: cat.name,
      slug: cat.slug,
      color: cat.color ?? "#6366f1",
      count: result.length,
    });
  }
  return counts;
}

export default async function HomePage() {
  const recentHaikus = await getRecentHaikus();
  const categoryCounts = await getCategoryCounts();

  return (
    <div className="space-y-16">
      <section className="text-center pt-12 pb-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          The Daily Haiku
        </h1>
        <p className="text-xl text-gray-600 max-w-xl mx-auto mb-8">
          One haiku for every day of the year, inspired by pop culture history.
          Pick a date, get inspired, and write your verse.
        </p>
        <Link
          href="/write"
          className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Write a Haiku
        </Link>
      </section>

      {recentHaikus.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Recent Haikus
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentHaikus.map((haiku) => {
              const month = parseInt(haiku.date.split("-")[0]);
              const day = parseInt(haiku.date.split("-")[1]);
              const dateStr = new Date(0, month - 1, day).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              });
              return (
                <Link
                  key={haiku.id}
                  href={`/haiku/${haiku.id}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-indigo-200 transition-all group"
                >
                  <div className="text-xs text-gray-400 mb-2">{dateStr}</div>
                  <div className="font-serif italic text-gray-700 leading-relaxed">
                    <p>{haiku.line1}</p>
                    <p>{haiku.line2}</p>
                    <p>{haiku.line3}</p>
                  </div>
                  {haiku.title && (
                    <div className="text-xs text-gray-500 mt-2">&mdash; {haiku.title}</div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {haiku.categoryName && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: haiku.categoryColor
                            ? `${haiku.categoryColor}20`
                            : "#f3f4f6",
                          color: haiku.categoryColor ?? "#6b7280",
                        }}
                      >
                        {haiku.categoryName}
                      </span>
                    )}
                    <span className="text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                      View &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="text-center pb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Browse by Category
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {categoryCounts.map((cat) => (
            <div
              key={cat.slug}
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${cat.color}15`,
                color: cat.color,
              }}
            >
              {cat.name} ({cat.count})
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
