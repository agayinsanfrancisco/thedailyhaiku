import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { haikus, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { wordOfTheDay } from "@/lib/design";
import HeroWord from "@/components/HeroWord";

export const dynamic = "force-dynamic";

async function getHaiku(id: number) {
  const result = await db
    .select({
      id: haikus.id,
      date: haikus.date,
      year: haikus.year,
      line1: haikus.line1,
      line2: haikus.line2,
      line3: haikus.line3,
      authorName: haikus.authorName,
      status: haikus.status,
      adminNotes: haikus.adminNotes,
      categoryName: categories.name,
      isFiller: haikus.isFiller,
      eventHeadline: haikus.eventHeadline,
      eventDescription: haikus.eventDescription,
      eventSources: haikus.eventSources,
      seasonWord: haikus.seasonWord,
      seasonColor: haikus.seasonColor,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .where(eq(haikus.id, id))
    .limit(1);
  return result[0] ?? null;
}

export default async function HaikuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const haiku = await getHaiku(parseInt(id));
  if (!haiku) notFound();

  const month = parseInt(haiku.date.split("-")[0]);
  const day = parseInt(haiku.date.split("-")[1]);
  const longDate = new Date(haiku.year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const isPending = haiku.status === "pending" || haiku.status === "edits_requested";
  const word = wordOfTheDay(haiku.seasonWord, [haiku.line1, haiku.line2, haiku.line3], month);
  const hasStory = haiku.isFiller !== "true" && haiku.eventDescription;

  let source: string | null = null;
  if (haiku.eventSources) {
    try {
      const arr = JSON.parse(haiku.eventSources);
      source = Array.isArray(arr) ? arr[0] : haiku.eventSources;
    } catch {
      source = haiku.eventSources;
    }
  }

  return (
    <div>
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-[6vw] pt-2 pb-16 overflow-hidden">
        <p className="text-[0.74rem] font-bold tracking-[0.5em] uppercase text-[var(--ink-soft)]">{longDate}</p>
        <div className="mt-3">
          <HeroWord word={word} color={haiku.seasonColor} />
        </div>
        {haiku.seasonWord && haiku.authorName && (
          <p className="mt-3 text-[0.66rem] tracking-[0.3em] uppercase text-[var(--ink-faint)]">— {haiku.authorName}&rsquo;s word —</p>
        )}

        <div
          className="relative z-[5] mt-[-1.2rem] rounded-[18px] bg-[var(--card)] px-[clamp(1.4rem,5vw,3.6rem)] pt-11 pb-9"
          style={{ width: "min(92vw, 760px)", boxShadow: "0 30px 70px rgba(26,24,18,0.16), 0 4px 14px rgba(26,24,18,0.08)" }}
        >
          {isPending && (
            <p className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-[var(--ink-faint)] mb-4">pending review</p>
          )}
          <p className="text-[0.68rem] font-bold tracking-[0.32em] uppercase text-[var(--accent)] mb-6">
            {hasStory && haiku.eventHeadline ? haiku.eventHeadline : "a haiku"}
          </p>
          <div className="font-display leading-[1.6]">
            <p style={{ fontSize: "clamp(1.05rem, 4.4vw, 2.05rem)" }}>{haiku.line1}</p>
            <p style={{ fontSize: "clamp(1.05rem, 4.4vw, 2.05rem)" }}>{haiku.line2}</p>
            <p style={{ fontSize: "clamp(1.05rem, 4.4vw, 2.05rem)", color: "var(--accent)" }}>{haiku.line3}</p>
          </div>
          <div className="flex items-center justify-between gap-8 mt-7 pt-5 border-t border-[var(--rule)] text-sm text-[var(--ink-soft)]">
            <span>
              {haiku.authorName ? <>by <b className="font-bold text-[var(--ink)]">{haiku.authorName}</b></> : "anonymous"}
              {haiku.categoryName ? ` · ${haiku.categoryName.toLowerCase()}` : ""}
            </span>
            {hasStory && <a href="#story" className="text-[var(--accent)] font-bold text-[0.74rem] tracking-[0.12em] uppercase no-underline">the story ↓</a>}
          </div>
          {haiku.adminNotes && (
            <p className="mt-5 pt-4 border-t border-[var(--rule)] text-[0.82rem] text-[var(--ink-soft)]">
              <span className="text-[var(--ink-faint)]">editor&rsquo;s note: </span>{haiku.adminNotes}
            </p>
          )}
        </div>

        <div className="mt-10">
          <Link
            href="/write"
            className="inline-block rounded-full bg-[var(--ink)] text-[var(--paper)] text-[0.86rem] font-bold tracking-[0.16em] uppercase px-[3.4rem] py-[1.15rem] no-underline transition-colors hover:bg-[var(--accent)]"
            style={{ boxShadow: "0 14px 36px rgba(26,24,18,0.22)" }}
          >
            write your own
          </Link>
        </div>
      </section>

      {hasStory && (
        <section id="story" className="relative z-[1] max-w-[860px] mx-auto px-[6vw] pt-20 pb-24">
          <div className="flex items-center gap-5 mb-9">
            <div className="w-14 h-[2px] bg-[var(--accent)]" />
            <p className="text-[0.72rem] font-bold tracking-[0.42em] uppercase text-[var(--accent)]">what this haiku describes</p>
          </div>
          {haiku.eventHeadline && <h2 className="font-display text-[clamp(1.9rem,4.6vw,3.2rem)] leading-[1.12] mb-7">{haiku.eventHeadline}</h2>}
          <p className="text-[1.08rem] leading-[1.85] text-[var(--ink-soft)] max-w-[640px]">{haiku.eventDescription}</p>
          {source && (
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex items-center gap-2 text-[0.78rem] font-bold tracking-[0.12em] uppercase text-[var(--ink)] no-underline pb-[0.35rem]"
              style={{ borderBottom: "2px solid var(--accent)" }}
            >
              source <span className="font-normal normal-case tracking-normal text-[var(--ink-soft)]">· {(() => { try { return new URL(source).hostname.replace(/^www\./, ""); } catch { return source; } })()}</span>
            </a>
          )}
        </section>
      )}
    </div>
  );
}
