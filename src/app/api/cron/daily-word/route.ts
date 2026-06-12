import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { haikus, categories, subscribers } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { wordOfTheDay } from "@/lib/design";
import { sendDailyWord } from "@/lib/email";

export const dynamic = "force-dynamic";

// Sends today's word + haiku to active subscribers. Triggered daily by a
// scheduled GitHub Action with the CRON_SECRET. Skips if there's no approved
// haiku for today (no empty-page emails).
async function run(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("x-cron-secret") ?? request.nextUrl.searchParams.get("secret");
  if (!secret || given !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const year = now.getFullYear();

  const todays = await db
    .select({
      id: haikus.id, line1: haikus.line1, line2: haikus.line2, line3: haikus.line3,
      authorName: haikus.authorName, seasonWord: haikus.seasonWord, seasonColor: haikus.seasonColor,
      categoryName: categories.name,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .where(and(eq(haikus.date, mmdd), eq(haikus.year, year), eq(haikus.status, "approved")))
    .limit(1);

  if (!todays[0]) {
    return NextResponse.json({ sent: 0, skipped: "no approved haiku for today" });
  }
  const h = todays[0];
  const word = wordOfTheDay(h.seasonWord, [h.line1, h.line2, h.line3], now.getMonth() + 1);
  const longDate = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const active = await db
    .select({ email: subscribers.email })
    .from(subscribers)
    .where(and(eq(subscribers.dailyWord, true), isNull(subscribers.unsubscribedAt)));

  let sent = 0;
  for (const s of active) {
    const ok = await sendDailyWord(s.email, {
      word, color: h.seasonColor, haikuId: h.id,
      line1: h.line1, line2: h.line2, line3: h.line3, author: h.authorName, longDate,
    });
    if (ok) sent++;
  }

  return NextResponse.json({ sent, subscribers: active.length, word, date: mmdd });
}

export async function GET(request: NextRequest) {
  return run(request);
}
export async function POST(request: NextRequest) {
  return run(request);
}
