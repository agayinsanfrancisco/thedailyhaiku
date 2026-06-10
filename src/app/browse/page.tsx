import Link from "next/link";
import { db } from "@/lib/db";
import { haikus, categories } from "@/lib/db/schema";
import { eq, and, desc, like } from "drizzle-orm";
import BrowseFilter from "./BrowseFilter";

function formatDate(mmdd: string) {
  const [m, d] = mmdd.split("-").map(Number);
  return new Date(0, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

async function getBrowseHaikus(categorySlug?: string, author?: string, date?: string) {
  const conditions = [eq(haikus.status, "approved")];

  if (categorySlug) {
    const cat = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);
    if (cat[0]) {
      conditions.push(eq(haikus.categoryId, cat[0].id));
    }
  }

  if (author) {
    conditions.push(like(haikus.authorName, `%${author}%`));
  }

  if (date) {
    conditions.push(eq(haikus.date, date));
  }

  return db
    .select({
      id: haikus.id, date: haikus.date,
      line1: haikus.line1, line2: haikus.line2, line3: haikus.line3,
      title: haikus.title, authorName: haikus.authorName,
      categoryName: categories.name, categorySlug: categories.slug, categoryColor: categories.color,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(haikus.date));
}

async function getAllCategories() {
  return db.select({ name: categories.name, slug: categories.slug }).from(categories);
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; author?: string; date?: string }>;
}) {
  const params = await searchParams;
  const [results, allCategories] = await Promise.all([
    getBrowseHaikus(params.category, params.author, params.date),
    getAllCategories(),
  ]);

  return (
    <article className="max-w-5xl mx-auto px-6 pt-16">
      <p className="text-xs text-[var(--ink-muted)] tracking-widest uppercase mb-2">
        Browse
      </p>
      <h1 className="text-2xl mb-8">All Haikus</h1>

      <BrowseFilter
        categories={allCategories}
        currentCategory={params.category ?? null}
        currentAuthor={params.author ?? null}
        currentDate={params.date ?? null}
      />

      {results.length === 0 ? (
        <div className="text-center py-16 text-[var(--ink-muted)]">
          <p className="text-lg">No haikus found</p>
          <p className="text-sm mt-1">Try different filters or write one!</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 gap-8 [column-rule:1px_solid_var(--rule)]">
          {results.map((haiku, i) => (
            <Link
              key={haiku.id}
              href={`/haiku/${haiku.id}`}
              className="block break-inside-avoid mb-8 p-0 group animate-reveal"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="border-t border-[var(--rule)] pt-4">
                <div className="font-serif text-[17px] leading-[1.55] space-y-0.5 mb-3">
                  <p>{haiku.line1}</p>
                  <p>{haiku.line2}</p>
                  <p>{haiku.line3}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--ink-muted)]">
                  <span>{formatDate(haiku.date)}</span>
                  {haiku.categoryName && <span className="text-[var(--accent)]">{haiku.categoryName}</span>}
                  {haiku.authorName && <span className="truncate max-w-[120px]">{haiku.authorName}</span>}
                  <span className="group-hover:text-[var(--ink)] transition-colors ml-auto opacity-0 group-hover:opacity-100">
                    Read
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
