import Link from "next/link";
import { db } from "@/lib/db";
import { haikus, categories } from "@/lib/db/schema";
import { eq, and, desc, like } from "drizzle-orm";
import BrowseFilter from "./BrowseFilter";

export const dynamic = "force-dynamic";

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
    <article className="relative z-[1] max-w-6xl mx-auto px-[4vw] pt-6 pb-24">
      <div className="text-center mb-3">
        <p className="text-[0.72rem] font-bold tracking-[0.42em] uppercase text-[var(--accent)] mb-2">the archive</p>
        <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)]">every haiku, every day</h1>
      </div>

      <div className="mt-8 mb-10">
        <BrowseFilter
          categories={allCategories}
          currentCategory={params.category ?? null}
          currentAuthor={params.author ?? null}
          currentDate={params.date ?? null}
        />
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 text-[var(--ink-soft)]">
          <p className="font-display text-2xl">nothing here yet</p>
          <p className="text-sm mt-2">
            Try different filters, or{" "}
            <Link href="/write" className="text-[var(--accent)] underline underline-offset-2">write one</Link>.
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
          {results.map((haiku) => (
            <Link
              key={haiku.id}
              href={`/haiku/${haiku.id}`}
              className="block break-inside-avoid mb-5 panel transition-transform hover:-translate-y-1"
              style={{ textDecoration: "none" }}
            >
              <div className="flex items-center gap-2 mb-4 text-[0.62rem] font-bold tracking-[0.18em] uppercase">
                <span className="text-[var(--accent)]">{formatDate(haiku.date)}</span>
                {haiku.categoryName && <span className="text-[var(--ink-faint)]">· {haiku.categoryName}</span>}
              </div>
              <div className="font-display text-[1.18rem] leading-[1.7] text-[var(--ink)]">
                <p>{haiku.line1}</p>
                <p>{haiku.line2}</p>
                <p style={{ color: "var(--accent)" }}>{haiku.line3}</p>
              </div>
              {haiku.authorName && <p className="mt-4 text-[0.74rem] text-[var(--ink-soft)]">— {haiku.authorName}</p>}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
