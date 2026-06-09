import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { haikus, categories, events } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allHaikus = await db
    .select({
      id: haikus.id,
      date: haikus.date,
      year: haikus.year,
      line1: haikus.line1,
      line2: haikus.line2,
      line3: haikus.line3,
      title: haikus.title,
      authorName: haikus.authorName,
      authorEmail: haikus.authorEmail,
      status: haikus.status,
      adminNotes: haikus.adminNotes,
      createdAt: haikus.createdAt,
      categoryName: categories.name,
      eventTitle: events.title,
      customEventTitle: haikus.customEventTitle,
    })
    .from(haikus)
    .leftJoin(categories, eq(haikus.categoryId, categories.id))
    .leftJoin(events, eq(haikus.eventId, events.id))
    .orderBy(desc(haikus.createdAt));

  return NextResponse.json({ haikus: allHaikus });
}
