import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { haikus, categories, events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function getHaiku(id: number) {
  const result = await db
    .select({
      id: haikus.id,
      date: haikus.date,
      year: haikus.year,
      line1: haikus.line1,
      line2: haikus.line2,
      line3: haikus.line3,
      title: haikus.title,
      authorName: haikus.authorName,
      status: haikus.status,
      adminNotes: haikus.adminNotes,
      createdAt: haikus.createdAt,
      categoryName: categories.name,
      categoryColor: categories.color,
      eventTitle: events.title,
      eventYear: events.year,
      customEventTitle: haikus.customEventTitle,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .leftJoin(events, eq(haikus.eventId, events.id))
    .where(eq(haikus.id, id))
    .limit(1);

  return result[0] ?? null;
}

export default async function HaikuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const haiku = await getHaiku(parseInt(id));

  if (!haiku) {
    notFound();
  }

  const month = parseInt(haiku.date.split("-")[0]);
  const day = parseInt(haiku.date.split("-")[1]);
  const dateStr = new Date(0, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const isPending = haiku.status === "pending" || haiku.status === "edits_requested";

  return (
    <article className="max-w-lg mx-auto px-6 pt-16">
      <Link
        href="/"
        className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors font-[system-ui]"
      >
        &larr; Back home
      </Link>

      <div className="mt-10 border-t border-[var(--rule)] pt-10">
        <div className="text-center mb-8">
          <p className="text-xs text-[var(--ink-muted)] font-[system-ui] tracking-widest uppercase mb-2">
            {dateStr}
          </p>
          {haiku.title && (
            <h1 className="text-sm text-[var(--ink-muted)] font-[system-ui] mt-1">
              &ldquo;{haiku.title}&rdquo;
            </h1>
          )}
        </div>

        <div className="font-serif text-[clamp(1.5rem,4vw,2.5rem)] leading-[1.4] text-center mb-8 space-y-1">
          <p>{haiku.line1}</p>
          <p>{haiku.line2}</p>
          <p>{haiku.line3}</p>
        </div>

        {haiku.authorName && (
          <div className="text-center text-sm text-[var(--ink-muted)] mb-8">
            &mdash; {haiku.authorName}
          </div>
        )}

        {haiku.categoryName && (
          <div className="text-center mb-6">
            <span className="text-xs font-[system-ui] text-[var(--accent)] tracking-wider uppercase">
              {haiku.categoryName}
            </span>
          </div>
        )}

        {(haiku.eventTitle || haiku.customEventTitle) && (
          <div className="border-t border-[var(--rule)] pt-6 mt-6">
            <div className="text-[10px] text-[var(--ink-muted)] font-[system-ui] tracking-widest uppercase mb-1">
              Pop Culture Inspiration
            </div>
            <p className="text-sm text-[var(--ink)]">
              {haiku.customEventTitle ?? haiku.eventTitle}
              {haiku.eventYear && <> ({haiku.eventYear})</>}
            </p>
          </div>
        )}

        {isPending && (
          <div className="border border-[var(--accent-dim)] bg-[var(--surface)] p-4 mt-6 text-sm text-[var(--ink-muted)] text-center">
            This haiku is pending review.
          </div>
        )}

        {haiku.adminNotes && (
          <div className="border-t border-[var(--rule)] pt-4 mt-6 text-sm">
            <span className="font-[system-ui] text-[var(--ink-muted)]">Editor&rsquo;s note: </span>
            <span className="text-[var(--ink)]">{haiku.adminNotes}</span>
          </div>
        )}
      </div>

      <div className="text-center mt-12 pb-16">
        <Link
          href="/write"
          className="text-sm font-[system-ui] text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
        >
          Write your own &rarr;
        </Link>
      </div>
    </article>
  );
}
