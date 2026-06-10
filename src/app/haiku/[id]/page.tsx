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
      isFiller: haikus.isFiller,
      eventHeadline: haikus.eventHeadline,
      eventDescription: haikus.eventDescription,
      eventSources: haikus.eventSources,
      validationLink: haikus.validationLink,
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
  const sources = haiku.eventSources ? JSON.parse(haiku.eventSources) as string[] : null;

  return (
    <article className="max-w-lg mx-auto px-6 pt-16">
      <Link
        href="/"
        className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
      >
        &larr; Back home
      </Link>

      <div className="mt-10 border-t border-[var(--rule)] pt-10">
        <div className="text-center mb-8">
          <p className="text-xs text-[var(--ink-muted)] tracking-widest uppercase mb-2">
            {dateStr}
          </p>
          {haiku.title && (
            <h1 className="text-sm text-[var(--ink-muted)] mt-1">
              &ldquo;{haiku.title}&rdquo;
            </h1>
          )}
        </div>

        <div className="font-serif text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.3] text-center mb-8 space-y-1">
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
            <span className="text-xs text-[var(--accent)] tracking-wider uppercase">
              {haiku.categoryName}
            </span>
          </div>
        )}

        {!haiku.isFiller && haiku.eventHeadline && (
          <div className="border-t border-[var(--rule)] pt-6 mt-6">
            <div className="text-[10px] text-[var(--ink-muted)] tracking-widest uppercase mb-1">
              On This Day
            </div>
            <p className="font-serif text-lg font-medium text-[var(--ink)] mb-2">
              {haiku.eventHeadline}
            </p>
            {haiku.eventDescription && (
              <p className="text-sm text-[var(--ink)] leading-relaxed">
                {haiku.eventDescription}
              </p>
            )}
          </div>
        )}

        {haiku.eventTitle && (
          <div className="mt-3">
            <p className="text-xs text-[var(--ink-muted)]">
              Event: {haiku.eventTitle}
              {haiku.eventYear && <>, {haiku.eventYear}</>}
            </p>
          </div>
        )}

        {sources && sources.length > 0 && (
          <div className="border-t border-[var(--rule)] pt-4 mt-4">
            <p className="text-[10px] text-[var(--ink-muted)] tracking-widest uppercase mb-2">Sources</p>
            <ul className="space-y-1">
              {sources.map((src, i) => (
                <li key={i}>
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--accent)] hover:text-[var(--ink)] transition-colors underline underline-offset-2 break-all"
                  >
                    {src}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isPending && (
          <div className="border border-[var(--rule)] bg-[var(--surface)] p-4 mt-6 text-sm text-[var(--ink-muted)] text-center">
            This haiku is pending review.
          </div>
        )}

        {haiku.adminNotes && (
          <div className="border-t border-[var(--rule)] pt-4 mt-6 text-sm">
            <span className="text-[var(--ink-muted)]">Editor&rsquo;s note: </span>
            <span className="text-[var(--ink)]">{haiku.adminNotes}</span>
          </div>
        )}
      </div>

      <div className="text-center mt-12 pb-16">
        <Link
          href="/write"
          className="text-sm text-[var(--accent)] hover:text-[var(--ink)] transition-colors"
        >
          Write your own &rarr;
        </Link>
      </div>
    </article>
  );
}
