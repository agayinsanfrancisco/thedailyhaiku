import { db } from "@/lib/db";
import { haikus, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap() {
  const baseUrl = "https://thedailyhaiku.com";

  const allHaikus = await db
    .select({ id: haikus.id, date: haikus.date, year: haikus.year })
    .from(haikus)
    .where(eq(haikus.status, "approved"));

  const allCategories = await db
    .select({ slug: categories.slug })
    .from(categories);

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
