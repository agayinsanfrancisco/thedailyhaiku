export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { haikus, categories, events } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { wordOfTheDay } from "@/lib/design";
import HeroWord from "@/components/HeroWord";

function getDateParts(offsetDays = 0) {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return { mmdd: `${month}-${day}`, year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

function longDate(month: number, day: number, year: number) {
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

async function getTodayHaiku(mmdd: string, year: number) {
  const result = await db
    .select({
      id: haikus.id,
      line1: haikus.line1,
      line2: haikus.line2,
      line3: haikus.line3,
      authorName: haikus.authorName,
      categoryName: categories.name,
      categorySlug: categories.slug,
      isFiller: haikus.isFiller,
      eventHeadline: haikus.eventHeadline,
      eventDescription: haikus.eventDescription,
      eventSources: haikus.eventSources,
      seasonWord: haikus.seasonWord,
      seasonColor: haikus.seasonColor,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .where(and(eq(haikus.date, mmdd), eq(haikus.year, year), eq(haikus.status, "approved")))
    .limit(1);
  return result[0] ?? null;
}

async function getTodayEvents(month: number, day: number) {
  return db
    .select({ id: events.id, title: events.title, year: events.year })
    .from(events)
    .where(and(eq(events.month, month), eq(events.day, day)))
    .orderBy(sql`RANDOM()`)
    .limit(3);
}

const MOTES = [
  { left: "8%", dur: "17s", delay: "0s", dx: "-4vw", red: false },
  { left: "22%", dur: "21s", delay: "5s", dx: "6vw", red: true },
  { left: "46%", dur: "19s", delay: "9s", dx: "-7vw", red: false },
  { left: "64%", dur: "23s", delay: "2s", dx: "5vw", red: false },
  { left: "81%", dur: "18s", delay: "12s", dx: "-5vw", red: true },
  { left: "92%", dur: "25s", delay: "7s", dx: "-3vw", red: false },
];

export default async function HomePage() {
  const today = getDateParts();
  const [todayHaiku, todayEvents] = await Promise.all([
    getTodayHaiku(today.mmdd, today.year),
    getTodayEvents(today.month, today.day),
  ]);

  const hasHaiku = !!todayHaiku;
  const word = hasHaiku
    ? wordOfTheDay(
        todayHaiku!.seasonWord,
        [todayHaiku!.line1, todayHaiku!.line2, todayHaiku!.line3],
        today.month,
      )
    : wordOfTheDay(null, [], today.month);
  const wordNote = hasHaiku
    ? todayHaiku!.seasonWord
      ? `— the poet's word${todayHaiku!.authorName ? `, chosen by ${todayHaiku!.authorName}` : ""} —`
      : "— today's word —"
    : "— today's season word, waiting for a poem —";

  return (
    <div>
      <section className="relative min-h-[88vh] flex flex-col overflow-hidden">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className={`mote${m.red ? " red" : ""}`}
            style={{ left: m.left, animationDuration: m.dur, animationDelay: m.delay, ["--dx" as string]: m.dx }}
          />
        ))}

        <div className="relative z-[3] flex-1 flex flex-col items-center justify-center text-center px-[6vw] pt-2 pb-16">
          <p className="text-[0.74rem] font-bold tracking-[0.5em] uppercase text-[var(--ink-soft)] animate-fade-up">
            {longDate(today.month, today.day, today.year)}
          </p>

          <div className="mt-3">
            <HeroWord word={word} color={hasHaiku ? todayHaiku!.seasonColor : null} />
          </div>
          <p className="mt-3 text-[0.66rem] tracking-[0.3em] uppercase text-[var(--ink-faint)] animate-fade-up" style={{ animationDelay: "1s" }}>
            {wordNote}
          </p>

          {hasHaiku ? (
            <div
              className="relative z-[5] mt-[-1.2rem] rounded-[18px] bg-[var(--card)] px-[clamp(1.4rem,5vw,3.6rem)] pt-11 pb-9 animate-fade-up"
              style={{ width: "min(92vw, 760px)", boxShadow: "0 30px 70px rgba(26,24,18,0.16), 0 4px 14px rgba(26,24,18,0.08)", animationDelay: "0.45s" }}
            >
              <p className="text-[0.68rem] font-bold tracking-[0.32em] uppercase text-[var(--accent)] mb-6">
                today&rsquo;s haiku
                {todayHaiku!.isFiller !== "true" && todayHaiku!.eventHeadline ? ` · ${todayHaiku!.eventHeadline}` : ""}
              </p>
              <div className="font-display leading-[1.6]">
                <p className="whitespace-nowrap" style={{ fontSize: "clamp(1.05rem, 4.4vw, 2.05rem)" }}>{todayHaiku!.line1}</p>
                <p className="whitespace-nowrap" style={{ fontSize: "clamp(1.05rem, 4.4vw, 2.05rem)" }}>{todayHaiku!.line2}</p>
                <p className="whitespace-nowrap" style={{ fontSize: "clamp(1.05rem, 4.4vw, 2.05rem)", color: "var(--accent)" }}>{todayHaiku!.line3}</p>
              </div>
              <div className="flex items-center justify-between gap-8 mt-7 pt-5 border-t border-[var(--rule)] text-sm text-[var(--ink-soft)]">
                <span>
                  {todayHaiku!.authorName ? <>by <b className="font-bold text-[var(--ink)]">{todayHaiku!.authorName}</b></> : "anonymous"}
                  {todayHaiku!.categoryName ? ` · ${todayHaiku!.categoryName.toLowerCase()}` : ""}
                </span>
                {todayHaiku!.isFiller !== "true" && todayHaiku!.eventDescription && (
                  <a href="#story" className="text-[var(--accent)] font-bold text-[0.74rem] tracking-[0.12em] uppercase no-underline">the story ↓</a>
                )}
              </div>
            </div>
          ) : (
            <div className="relative z-[5] mt-2 max-w-md animate-fade-up" style={{ animationDelay: "0.45s" }}>
              <p className="text-[var(--ink-soft)] leading-relaxed">
                No haiku for today yet — the page is blank, the word is waiting.
                {todayEvents.length > 0 ? " Pick a moment that happened on this day and write it." : ""}
              </p>
            </div>
          )}

          <div className="relative z-[5] mt-10 animate-fade-up" style={{ animationDelay: "0.7s" }}>
            <Link
              href="/write"
              className="inline-block rounded-full bg-[var(--ink)] text-[var(--paper)] text-[0.86rem] font-bold tracking-[0.16em] uppercase px-[3.4rem] py-[1.15rem] no-underline transition-colors hover:bg-[var(--accent)]"
              style={{ boxShadow: "0 14px 36px rgba(26,24,18,0.22)" }}
            >
              {hasHaiku ? "write tomorrow's" : "write today's haiku"}
            </Link>
          </div>
        </div>
      </section>

      {hasHaiku && todayHaiku!.isFiller !== "true" && todayHaiku!.eventDescription && (
        <section id="story" className="relative z-[1] max-w-[860px] mx-auto px-[6vw] pt-24 pb-20">
          <div className="flex items-center gap-5 mb-9">
            <div className="w-14 h-[2px] bg-[var(--accent)]" />
            <p className="text-[0.72rem] font-bold tracking-[0.42em] uppercase text-[var(--accent)]">what this haiku describes</p>
          </div>
          {todayHaiku!.eventHeadline && (
            <h2 className="font-display text-[clamp(1.9rem,4.6vw,3.2rem)] leading-[1.12] mb-7">{todayHaiku!.eventHeadline}</h2>
          )}
          <p className="text-[1.08rem] leading-[1.85] text-[var(--ink-soft)] max-w-[640px]">{todayHaiku!.eventDescription}</p>
          {todayHaiku!.eventSources && (
            <SourceLink raw={todayHaiku!.eventSources} />
          )}
        </section>
      )}

      {!hasHaiku && todayEvents.length > 0 && (
        <section className="relative z-[1] bg-[var(--ink)] text-[var(--paper)] px-[6vw] py-7 flex gap-12 items-center overflow-x-auto">
          <p className="text-[0.7rem] tracking-[0.3em] uppercase text-[rgba(247,243,234,0.5)] whitespace-nowrap">on this day</p>
          {todayEvents.map((e) => (
            <Link key={e.id} href={`/write/${today.mmdd}?event=${e.id}`} className="font-display text-[0.98rem] whitespace-nowrap no-underline text-[var(--paper)] hover:text-[var(--accent)] transition-colors">
              {e.year ? <span className="text-[var(--accent)] mr-2">{e.year}</span> : null}
              {e.title}
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

function SourceLink({ raw }: { raw: string }) {
  let url = raw;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) url = parsed[0];
  } catch {
    /* raw is a plain string */
  }
  let domain = url;
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* keep raw */
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-9 inline-flex items-center gap-2 text-[0.78rem] font-bold tracking-[0.12em] uppercase text-[var(--ink)] no-underline pb-[0.35rem]"
      style={{ borderBottom: "2px solid var(--accent)" }}
    >
      source <span className="font-normal normal-case tracking-normal text-[var(--ink-soft)]">· {domain}</span>
    </a>
  );
}
