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
    <div className="max-w-lg mx-auto">
      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back home
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-400 font-medium">{dateStr}</div>
          {haiku.title && (
            <h1 className="text-xl font-bold text-gray-800 mt-1">{haiku.title}</h1>
          )}
        </div>

        <div className="font-serif text-2xl text-gray-700 leading-relaxed text-center mb-6">
          <p>{haiku.line1}</p>
          <p>{haiku.line2}</p>
          <p>{haiku.line3}</p>
        </div>

        {haiku.authorName && (
          <div className="text-center text-sm text-gray-500 mb-6">
            &mdash; {haiku.authorName}
          </div>
        )}

        {haiku.categoryName && (
          <div className="text-center mb-4">
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{
                backgroundColor: haiku.categoryColor
                  ? `${haiku.categoryColor}20`
                  : "#f3f4f6",
                color: haiku.categoryColor ?? "#6b7280",
              }}
            >
              {haiku.categoryName}
            </span>
          </div>
        )}

        {(haiku.eventTitle || haiku.customEventTitle) && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mt-4">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
              Pop Culture Inspiration
            </div>
            <p className="text-sm text-gray-700">
              {haiku.customEventTitle ?? haiku.eventTitle}
              {haiku.eventYear && <> ({haiku.eventYear})</>}
            </p>
          </div>
        )}

        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4 text-sm text-yellow-700 text-center">
            This haiku is pending review.
          </div>
        )}

        {haiku.adminNotes && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 text-sm text-blue-700">
            <span className="font-medium">Editor&apos;s note: </span>
            {haiku.adminNotes}
          </div>
        )}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/write"
          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
        >
          Write your own haiku &rarr;
        </Link>
      </div>
    </div>
  );
}
