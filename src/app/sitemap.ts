import { db } from "@/lib/db";
import { haikus, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = "https://thedailyhaiku.com";

  // Generated at request time; tolerate the DB being unreachable so the build
  // (and a cold start) never fails on the sitemap.
  let allHaikus: { id: number; date: string; year: number }[] = [];
  let allCategories: { slug: string }[] = [];
  try {
    allHaikus = await db
      .select({ id: haikus.id, date: haikus.date, year: haikus.year })
      .from(haikus)
      .where(eq(haikus.status, "approved"));
    allCategories = await db.select({ slug: categories.slug }).from(categories);
  } catch (e) {
    console.error("sitemap: DB unavailable, returning static routes only", e);
  }

  const haikuEntries = allHaikus.map((h) => ({
    url: `${baseUrl}/haiku/${h.id}`,
    lastModified: new Date(`${h.year}-${h.date}`),
    changeFrequency: "never" as const,
    priority: 0.8,
  }));

  const categoryEntries = allCategories.map((c) => ({
    url: `${baseUrl}/browse?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/write`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    },
    ...haikuEntries,
    ...categoryEntries,
  ];
}
