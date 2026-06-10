import Link from "next/link";
import { db } from "@/lib/db";
import { haikus, categories } from "@/lib/db/schema";
import { eq, and, desc, like } from "drizzle-orm";

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
      <p className="text-xs text-[var(--ink-muted)] tracking-widest uppercase font-[system-ui] mb-2">
        Browse
      </p>
      <h1 className="text-2xl font-serif mb-8">All Haikus</h1>

      <form className="flex flex-wrap gap-3 mb-10 items-end">
        <div>
          <label className="block text-xs font-[system-ui] text-[var(--ink-muted)] mb-1">
            Category
          </label>
          <select
            name="category"
            defaultValue={params.category ?? ""}
            onChange={(e) => {
              const form = e.currentTarget.form;
              if (form) form.submit();
            }}
            className="px-3 py-2 border border-[var(--rule)] bg-transparent text-sm focus:outline-none focus:border-[var(--ink)] transition-colors"
          >
            <option value="">All categories</option>
            {allCategories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-[system-ui] text-[var(--ink-muted)] mb-1">
            Author
          </label>
          <input
            type="text"
            name="author"
            defaultValue={params.author ?? ""}
            placeholder="Search author..."
            className="px-3 py-2 border border-[var(--rule)] bg-transparent text-sm focus:outline-none focus:border-[var(--ink)] transition-colors w-40 placeholder:text-[var(--accent-dim)]"
          />
        </div>
        <div>
          <label className="block text-xs font-[system-ui] text-[var(--ink-muted)] mb-1">
            Date
          </label>
          <input
            type="text"
            name="date"
            defaultValue={params.date ?? ""}
            placeholder="MM-DD (e.g. 06-10)"
            className="px-3 py-2 border border-[var(--rule)] bg-transparent text-sm focus:outline-none focus:border-[var(--ink)] transition-colors w-36 placeholder:text-[var(--accent-dim)]"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-[system-ui] tracking-wider uppercase border-2 border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
        >
          Filter
        </button>
        {(params.category || params.author || params.date) && (
          <Link
            href="/browse"
            className="px-4 py-2 text-xs font-[system-ui] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {results.length === 0 ? (
        <div className="text-center py-16 text-[var(--ink-muted)]">
          <p className="font-serif text-lg">No haikus found</p>
          <p className="text-sm mt-1 font-[system-ui]">Try different filters or write one!</p>
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
                <div className="text-[17px] leading-[1.55] space-y-0.5 mb-3">
                  <p>{haiku.line1}</p>
                  <p>{haiku.line2}</p>
                  <p>{haiku.line3}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--ink-muted)] font-[system-ui]">
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
