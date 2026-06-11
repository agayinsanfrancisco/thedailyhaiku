import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { haikus, events, categories, subscribers } from "@/lib/db/schema";
import { countLineSyllables } from "@/lib/syllable";
import { newManageToken } from "@/lib/ownership";
import { sendSubmissionReceipt } from "@/lib/email";
import { and, eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, line1, line2, line3, title, categoryId, eventId, isFiller, validationLink, eventHeadline, eventDescription, eventSources, authorName, authorEmail, seasonWord, seasonColor, wantApproval, wantDaily } = body;

    if (!date || !line1 || !line2 || !line3) {
      return NextResponse.json({ error: "Missing required fields (date, line1, line2, line3)" }, { status: 400 });
    }

    const s1 = countLineSyllables(line1);
    const s2 = countLineSyllables(line2);
    const s3 = countLineSyllables(line3);

    if (s1 !== 5 || s2 !== 7 || s3 !== 5) {
      return NextResponse.json({
        error: "Haiku must follow 5-7-5 syllable structure",
        counts: [s1, s2, s3],
      }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const manage = newManageToken();

    const existing = await db
      .select()
      .from(haikus)
      .where(
        and(
          eq(haikus.date, date),
          eq(haikus.year, year),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "A haiku already exists for this date this year" }, { status: 409 });
    }

    const newHaiku = await db.insert(haikus).values({
      date,
      year,
      line1,
      line2,
      line3,
      title: title ?? null,
      categoryId: categoryId ? parseInt(categoryId) : null,
      eventId: eventId ? parseInt(eventId) : null,
      isFiller: isFiller ? "true" : "false",
      validationLink: validationLink ?? null,
      eventHeadline: eventHeadline ?? null,
      eventDescription: eventDescription ?? null,
      eventSources: eventSources ?? null,
      authorName: authorName ?? null,
      authorEmail: authorEmail ?? null,
      seasonWord: seasonWord?.trim() || null,
      seasonColor: seasonColor ?? null,
      manageTokenHash: manage.hash,
      status: "pending",
    }).returning();

    // Email + subscription (both gated on the email opt-ins and a configured key).
    const email = typeof authorEmail === "string" ? authorEmail.trim() : "";
    if (email) {
      if (wantApproval !== false) {
        // receipt carries the recovery manage link; fire-and-forget
        void sendSubmissionReceipt(email, newHaiku[0].id, manage.token, date);
      }
      if (wantDaily) {
        await db
          .insert(subscribers)
          .values({ email, dailyWord: true })
          .onConflictDoUpdate({ target: subscribers.email, set: { dailyWord: true, unsubscribedAt: null } })
          .catch(() => {});
      }
    }

    // Return the plaintext token once — the client stores it; we keep only the hash.
    return NextResponse.json({ haiku: newHaiku[0], manageToken: manage.token }, { status: 201 });
  } catch (error) {
    console.error("Error submitting haiku:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const approved = await db
    .select({
      id: haikus.id,
      date: haikus.date,
      line1: haikus.line1,
      line2: haikus.line2,
      line3: haikus.line3,
      title: haikus.title,
      status: haikus.status,
      createdAt: haikus.createdAt,
      categoryName: categories.name,
      categoryColor: categories.color,
      eventTitle: events.title,
      isFiller: haikus.isFiller,
      eventHeadline: haikus.eventHeadline,
      eventDescription: haikus.eventDescription,
      eventSources: haikus.eventSources,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .leftJoin(events, eq(haikus.eventId, events.id))
    .where(eq(haikus.status, "approved"))
    .orderBy(desc(haikus.createdAt))
    .limit(20);

  return NextResponse.json({ haikus: approved });
}
